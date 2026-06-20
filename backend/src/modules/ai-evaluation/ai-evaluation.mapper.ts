import type { QuestionEvaluationType } from './graphql/question-evaluation.type';
import type { CheckpointResultEntity } from './entities/checkpoint-result.entity';
import type { FinalEvaluationEntity } from './entities/final-evaluation.entity';
import type { QuestionEvaluationEntity } from './entities/question-evaluation.entity';
import type { CheckpointResultType } from './graphql/checkpoint-result.type';
import {
  AchievedLevelMethodEnum,
  FinalEvaluationCategoryEnum,
  HireRecommendationEnum,
  InterviewStrengthCategoryEnum,
  type CategoryBreakdownType,
  type FinalEvaluationType,
  type LevelBreakdownType,
  type TopicSessionEvaluationType,
} from './graphql/final-evaluation.type';
import {
  QUESTION_LEVELS,
  type QuestionLevel,
} from '../question-bank/types/question-level.enum';
import { QuestionLevelEnum } from '../question-bank/types/question.type';

export function mapQuestionEvaluationToGraphql(
  entity: QuestionEvaluationEntity,
  checkpointResults: CheckpointResultType[] = [],
): QuestionEvaluationType {
  return {
    id: String(entity.id),
    interviewAttemptId: String(entity.interviewAttemptId),
    interviewMessageId: String(entity.interviewMessageId),
    interviewQuestionId: String(entity.interviewQuestionId),
    score: entity.score,
    maxScore: entity.maxScore,
    shortSummary: entity.shortSummary,
    review: entity.review,
    needsManualReview: entity.needsManualReview,
    createdAt: entity.createdAt.getTime(),
    checkpointResults,
  };
}

export function mapCheckpointResultToGraphql(
  entity: CheckpointResultEntity,
): CheckpointResultType {
  return {
    id: String(entity.id),
    checkpointKey: entity.checkpointKey,
    matched: entity.matched,
    scoreAwarded: entity.scoreAwarded,
    evidenceQuote: entity.evidenceQuote,
  };
}

export function mapFinalEvaluationToGraphql(
  entity: FinalEvaluationEntity,
  deterministicScore?: unknown,
  targetLevel?: QuestionLevel | null,
): FinalEvaluationType {
  const breakdown = extractBreakdown(deterministicScore);
  const topicEvaluations = extractTopicEvaluations(deterministicScore);
  const scoreMeta = extractScoreMeta(deterministicScore, entity.totalScore);
  const achievedLevelMeta = extractAchievedLevelMeta(entity.rawResponse);

  return {
    id: String(entity.id),
    interviewAttemptId: String(entity.interviewAttemptId),
    totalScore: entity.totalScore,
    finalScore: scoreMeta.finalScore,
    totalWeight: scoreMeta.totalWeight,
    averageScore: scoreMeta.averageScore,
    strengthCategory: scoreMeta.strengthCategory,
    category: entity.category as FinalEvaluationCategoryEnum,
    hireRecommendation: entity.hireRecommendation as HireRecommendationEnum,
    achievedLevel: toQuestionLevelEnum(entity.achievedLevel),
    achievedLevelMethod: toAchievedLevelMethodEnum(entity.achievedLevelMethod),
    achievedLevelNote: achievedLevelMeta.note,
    targetLevel: toQuestionLevelEnum(targetLevel ?? null),
    levelBreakdown: achievedLevelMeta.levelBreakdown,
    summary: entity.summary,
    detailedSummary: entity.detailedSummary,
    strengths: entity.strengths,
    weaknesses: entity.weaknesses,
    risks: entity.risks,
    needsManualReview: entity.needsManualReview,
    categoryBreakdown: breakdown,
    topicEvaluations,
  };
}

function toQuestionLevelEnum(
  value: string | null | undefined,
): QuestionLevelEnum | null {
  if (typeof value !== 'string') {
    return null;
  }
  return (QUESTION_LEVELS as readonly string[]).includes(value)
    ? (value as QuestionLevelEnum)
    : null;
}

function toAchievedLevelMethodEnum(
  value: string | null | undefined,
): AchievedLevelMethodEnum | null {
  if (value === AchievedLevelMethodEnum.evidence) {
    return AchievedLevelMethodEnum.evidence;
  }
  if (value === AchievedLevelMethodEnum.estimate) {
    return AchievedLevelMethodEnum.estimate;
  }
  return null;
}

/**
 * `levelBreakdown` + `note` are persisted by FinalEvaluationService into
 * `raw_response.achievedLevelResult` (the full computeAchievedLevel result).
 * Older rows without it degrade to an empty breakdown / null note.
 */
function extractAchievedLevelMeta(rawResponse: unknown): {
  levelBreakdown: LevelBreakdownType[];
  note: string | null;
} {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return { levelBreakdown: [], note: null };
  }

  const result = (rawResponse as { achievedLevelResult?: unknown })
    .achievedLevelResult;
  if (!result || typeof result !== 'object') {
    return { levelBreakdown: [], note: null };
  }

  const { perLevel, note } = result as {
    perLevel?: unknown;
    note?: unknown;
  };

  const levelBreakdown = Array.isArray(perLevel)
    ? perLevel
        .map((item) => mapLevelBreakdown(item))
        .filter((item): item is LevelBreakdownType => item !== null)
    : [];

  return {
    levelBreakdown,
    note: typeof note === 'string' ? note : null,
  };
}

function mapLevelBreakdown(item: unknown): LevelBreakdownType | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const candidate = item as {
    level?: unknown;
    earned?: unknown;
    maxScore?: unknown;
    ratio?: unknown;
    passed?: unknown;
  };

  const level = toQuestionLevelEnum(
    typeof candidate.level === 'string' ? candidate.level : null,
  );
  if (level === null) {
    return null;
  }

  return {
    level,
    earned: Number(candidate.earned ?? 0),
    maxScore: Number(candidate.maxScore ?? 0),
    ratio: Number(candidate.ratio ?? 0),
    passed: candidate.passed === true,
  };
}

function extractScoreMeta(
  deterministicScore: unknown,
  fallbackTotalScore: number,
): {
  finalScore: number;
  totalWeight: number;
  averageScore: number | null;
  strengthCategory: InterviewStrengthCategoryEnum;
} {
  if (!deterministicScore || typeof deterministicScore !== 'object') {
    return {
      finalScore: fallbackTotalScore,
      totalWeight: 0,
      averageScore: null,
      strengthCategory: mapStrengthCategoryFromScore(fallbackTotalScore),
    };
  }

  const score = deterministicScore as {
    finalScore?: unknown;
    totalScoreOutOfTen?: unknown;
    totalWeight?: unknown;
    averageScore?: unknown;
    strengthCategory?: unknown;
  };

  const finalScore = Number(
    score.finalScore ?? score.totalScoreOutOfTen ?? fallbackTotalScore,
  );

  return {
    finalScore,
    totalWeight: Number(score.totalWeight ?? 0),
    averageScore:
      score.averageScore === undefined || score.averageScore === null
        ? null
        : Number(score.averageScore),
    strengthCategory: isStrengthCategory(score.strengthCategory)
      ? score.strengthCategory
      : mapStrengthCategoryFromScore(finalScore),
  };
}

function extractTopicEvaluations(
  deterministicScore: unknown,
): TopicSessionEvaluationType[] {
  if (!deterministicScore || typeof deterministicScore !== 'object') {
    return [];
  }

  const topics = (deterministicScore as { topics?: unknown }).topics;
  if (!Array.isArray(topics)) {
    return [];
  }

  return topics
    .filter((item): item is TopicSessionEvaluationType => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'topic' in item &&
        'score' in item &&
        'weight' in item
      );
    })
    .map((item) => ({
      topic: String(item.topic),
      score: Number(item.score),
      weight: Number(item.weight),
      weightedScore: Number(item.weightedScore),
      strengthCategory: isStrengthCategory(item.strengthCategory)
        ? item.strengthCategory
        : mapStrengthCategoryFromScore(Number(item.score)),
    }));
}

function extractBreakdown(
  deterministicScore: unknown,
): CategoryBreakdownType[] {
  if (!deterministicScore || typeof deterministicScore !== 'object') {
    return [];
  }

  const breakdown = (deterministicScore as { breakdown?: unknown }).breakdown;
  if (!Array.isArray(breakdown)) {
    return [];
  }

  return breakdown
    .filter((item): item is CategoryBreakdownType => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'categoryKey' in item &&
        'categoryLabel' in item
      );
    })
    .map((item) => ({
      categoryKey: String(item.categoryKey),
      categoryLabel: String(item.categoryLabel),
      scoreNormalized: Number(item.scoreNormalized),
      weight: Number(item.weight),
      contribution: Number(item.contribution),
    }));
}

function isStrengthCategory(
  value: unknown,
): value is InterviewStrengthCategoryEnum {
  return (
    value === InterviewStrengthCategoryEnum.weak ||
    value === InterviewStrengthCategoryEnum.medium ||
    value === InterviewStrengthCategoryEnum.strong
  );
}

function mapStrengthCategoryFromScore(
  scoreOutOfTen: number,
): InterviewStrengthCategoryEnum {
  if (scoreOutOfTen >= 7.5) {
    return InterviewStrengthCategoryEnum.strong;
  }

  if (scoreOutOfTen >= 5) {
    return InterviewStrengthCategoryEnum.medium;
  }

  return InterviewStrengthCategoryEnum.weak;
}
