import {
  QUESTION_LEVELS,
  type QuestionLevel,
} from '../question-bank/types/question-level.enum';

/**
 * Achieved level (TASK-18.2) — a SEPARATE axis from the hire recommendation.
 *
 * It answers "what level did the candidate actually demonstrate?" independently
 * of the interview's target level. The existing scoring / `mapHireRecommendation`
 * is NOT touched: this only aggregates the per-question scores by the question's
 * own level and reports the highest level the candidate clearly passed.
 *
 * Two regimes:
 *  - evidence: the interview contains questions of ≥2 distinct levels → we walk
 *    the ladder junior→middle→senior→lead and report the highest level that was
 *    passed AND whose lower present levels were all passed (contiguous).
 *  - estimate: all questions share one level (no lower-level signal). Passing it
 *    is direct evidence of that level; failing it can only be estimated as one
 *    level below (we never tested lower questions), so `method = 'estimate'` and
 *    `achievedLevel` is null with an `estimatedLevel` hint.
 */

const DEFAULT_PASS_RATIO = 0.65;

const LEVEL_ORDER: Record<QuestionLevel, number> = {
  junior: 0,
  middle: 1,
  senior: 2,
  lead: 3,
};

export type AchievedLevelMethod = 'evidence' | 'estimate';

export type AchievedLevelInput = {
  level: string;
  score: number;
  maxScore: number;
};

export type AchievedLevelPerLevel = {
  level: QuestionLevel;
  earned: number;
  maxScore: number;
  ratio: number;
  passed: boolean;
};

export type AchievedLevelResult = {
  /** Highest level the candidate clearly passed, or null when none was passed. */
  achievedLevel: QuestionLevel | null;
  /** evidence = directly tested at that level; estimate = inferred (no lower-level questions). */
  method: AchievedLevelMethod;
  /** Soft hint used only when `method === 'estimate'` and `achievedLevel` is null. */
  estimatedLevel: QuestionLevel | null;
  /** Pass ratio threshold actually applied. */
  passRatio: number;
  /** Per-level aggregates, ordered junior→lead, only for levels present in the input. */
  perLevel: AchievedLevelPerLevel[];
  /** Human-facing note (e.g. calibration hint in estimate mode). */
  note: string | null;
};

export function readAchievedLevelPassRatio(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = env.ACHIEVED_LEVEL_PASS_RATIO;
  if (!raw?.trim()) {
    return DEFAULT_PASS_RATIO;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > 1) {
    return DEFAULT_PASS_RATIO;
  }

  return value;
}

export function computeAchievedLevel(
  questions: AchievedLevelInput[],
  passRatio: number = readAchievedLevelPassRatio(),
): AchievedLevelResult {
  const perLevel = aggregateByLevel(questions, passRatio);

  if (perLevel.length === 0) {
    return {
      achievedLevel: null,
      method: 'estimate',
      estimatedLevel: null,
      passRatio,
      perLevel: [],
      note: 'No scored questions with a known level.',
    };
  }

  const isSingleLevel = perLevel.length === 1;

  // Highest contiguous passed level from the lowest present level upward.
  let confirmed: QuestionLevel | null = null;
  for (const item of perLevel) {
    if (item.passed) {
      confirmed = item.level;
    } else {
      break;
    }
  }

  if (confirmed !== null) {
    // Directly tested at `confirmed` → evidence in both single- and multi-level cases.
    return {
      achievedLevel: confirmed,
      method: 'evidence',
      estimatedLevel: null,
      passRatio,
      perLevel,
      note: null,
    };
  }

  // Failed even the lowest present level: no confirmed level.
  const lowestPresent = perLevel[0].level;
  const estimatedLevel = levelBelow(lowestPresent);

  return {
    achievedLevel: null,
    method: 'estimate',
    estimatedLevel,
    passRatio,
    perLevel,
    note: isSingleLevel
      ? `Below ${lowestPresent}: all questions were ${lowestPresent}-level, so the exact lower level cannot be confirmed. Add lower-level calibration questions for a precise demonstrated level.`
      : `Did not pass the lowest tested level (${lowestPresent}); demonstrated level is below the tested range.`,
  };
}

function aggregateByLevel(
  questions: AchievedLevelInput[],
  passRatio: number,
): AchievedLevelPerLevel[] {
  const groups = new Map<QuestionLevel, { earned: number; maxScore: number }>();

  for (const question of questions) {
    const level = normalizeLevel(question.level);
    if (level === null || question.maxScore <= 0) {
      continue;
    }

    const current = groups.get(level) ?? { earned: 0, maxScore: 0 };
    current.earned += question.score;
    current.maxScore += question.maxScore;
    groups.set(level, current);
  }

  return [...groups.entries()]
    .map(([level, totals]) => {
      const ratio =
        totals.maxScore > 0 ? totals.earned / totals.maxScore : 0;
      return {
        level,
        earned: roundTwo(totals.earned),
        maxScore: roundTwo(totals.maxScore),
        ratio: roundTwo(ratio),
        passed: ratio >= passRatio,
      };
    })
    .sort((left, right) => LEVEL_ORDER[left.level] - LEVEL_ORDER[right.level]);
}

function normalizeLevel(raw: string): QuestionLevel | null {
  const value = raw?.trim().toLowerCase();
  return (QUESTION_LEVELS as readonly string[]).includes(value)
    ? (value as QuestionLevel)
    : null;
}

function levelBelow(level: QuestionLevel): QuestionLevel | null {
  const index = LEVEL_ORDER[level];
  if (index <= 0) {
    return null;
  }
  return QUESTION_LEVELS[index - 1];
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
