import type { AdaptiveCheckpointDefinition } from '../types/adaptive-interview-context.types';
import type {
  CheckpointComplexityTier,
  CheckpointEvaluationHints,
} from '../types/checkpoint-evaluation-hints.type';
import {
  DEFAULT_MIN_SCORE_AFTER_SHALLOW_ACCEPT,
  RESIDUAL_GAP_PROBE_EXTRA_BUDGET,
  TIER_SHALLOW_ACCEPT_FRACTION,
  type CheckpointProbeStatus,
} from '../types/checkpoint-probe-policy.type';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import { isTargetedTopicRefusal } from './candidate-decline.util';
import {
  parseDepthFromRationale,
  type CheckpointDepthLevel,
} from './checkpoint-depth.util';
import { getContradictionScoreCap } from './hint-driven-evidence.util';
import { countMatchedConcepts } from './text-evidence-overlap.util';
import {
  type FollowUpAnswerTone,
  pickProbeAcknowledgment,
  pickProbeQuestionStem,
  pickResidualAcknowledgment,
} from './follow-up-acknowledgment.util';

const PROBE_REQUIRED_TIERS = new Set<CheckpointComplexityTier>([
  'intermediate',
  'advanced',
  'expert',
]);

const SHALLOW_ACCEPT_TIERS = new Set<CheckpointComplexityTier>([
  'mention',
  'basic',
  'core_plus',
]);

const SHALLOW_DEPTH_LEVELS = new Set<CheckpointDepthLevel>([
  'mention_only',
  'heard_of',
  'partial_knowledge',
]);

const ELIGIBLE_PROBE_STATUSES = new Set<CheckpointStateStatus>([
  'partial',
  'missed',
  'unclear',
]);

export type ProbePolicyCheckpointState = {
  checkpointKey?: string;
  status: CheckpointStateStatus | string;
  scoreAwarded: number;
  maxScore: number;
  followUpCount: number;
  rationale?: string | null;
};

export type ProbeRequiredInput = {
  checkpoint: AdaptiveCheckpointDefinition;
  state: ProbePolicyCheckpointState;
  hints: CheckpointEvaluationHints | null | undefined;
  questionMaxScore: number;
  candidateEvidenceText?: string;
  latestCandidateText?: string;
};

export function resolveComplexityTier(
  hints: CheckpointEvaluationHints | null | undefined,
  checkpointWeight: number,
  questionMaxScore: number,
): CheckpointComplexityTier {
  if (hints?.complexityTier) {
    return hints.complexityTier;
  }

  if (checkpointWeight >= 2) {
    return 'advanced';
  }

  const ratio =
    questionMaxScore > 0 ? checkpointWeight / questionMaxScore : 0;

  if (ratio >= 0.25) {
    return 'advanced';
  }
  if (ratio >= 0.15) {
    return 'intermediate';
  }
  if (ratio >= 0.12) {
    return 'core_plus';
  }
  if (ratio >= 0.08) {
    return 'basic';
  }

  return 'mention';
}

export function getMissingMustConcepts(
  hints: CheckpointEvaluationHints | null | undefined,
  candidateText: string,
): string[] {
  const mustConcepts = hints?.mustConcepts ?? [];
  if (mustConcepts.length === 0) {
    return [];
  }

  return mustConcepts.filter(
    (concept) => countMatchedConcepts(candidateText, [concept]) === 0,
  );
}

export function hasConceptGap(
  hints: CheckpointEvaluationHints | null | undefined,
  candidateText: string,
): boolean {
  const mustConcepts = hints?.mustConcepts ?? [];
  if (mustConcepts.length === 0) {
    return false;
  }

  const minMatched = hints?.minMatchedConcepts ?? 1;
  return countMatchedConcepts(candidateText, mustConcepts) < minMatched;
}

export function hasFalseClaimSignal(
  checkpoint: AdaptiveCheckpointDefinition,
  state: ProbePolicyCheckpointState,
  latestCandidateText: string,
  candidateEvidenceText: string,
): boolean {
  const depth = parseDepthFromRationale(state.rationale ?? null);
  if (depth === 'false_claim') {
    return true;
  }

  const rationale = state.rationale ?? '';
  if (/accuracy\s*=\s*wrong/i.test(rationale)) {
    return true;
  }

  return (
    getContradictionScoreCap(
      checkpoint,
      latestCandidateText,
      checkpoint.score,
    ) !== null ||
    getContradictionScoreCap(
      checkpoint,
      candidateEvidenceText,
      checkpoint.score,
    ) !== null
  );
}

export function probeRequired(input: ProbeRequiredInput): boolean {
  const { checkpoint, state, hints, questionMaxScore } = input;
  const candidateEvidenceText = input.candidateEvidenceText ?? '';
  const latestCandidateText = input.latestCandidateText ?? candidateEvidenceText;

  if (!ELIGIBLE_PROBE_STATUSES.has(state.status as CheckpointStateStatus)) {
    return false;
  }

  if (state.followUpCount > 0) {
    return false;
  }

  if (
    isTargetedTopicRefusal(latestCandidateText) &&
    state.status !== 'covered'
  ) {
    return false;
  }

  if (
    hasFalseClaimSignal(
      checkpoint,
      state,
      latestCandidateText,
      candidateEvidenceText,
    )
  ) {
    return false;
  }

  const tier = resolveComplexityTier(
    hints,
    checkpoint.score,
    questionMaxScore,
  );

  if (SHALLOW_ACCEPT_TIERS.has(tier)) {
    return false;
  }

  const requireProbe =
    hints?.probePolicy?.requireProbeBeforeFinalPartial ?? true;
  if (!requireProbe || !PROBE_REQUIRED_TIERS.has(tier)) {
    return false;
  }

  const depth = parseDepthFromRationale(state.rationale ?? null);
  const conceptGap = hasConceptGap(hints, candidateEvidenceText);

  return conceptGap || SHALLOW_DEPTH_LEVELS.has(depth);
}

export function countMatchedMustConcepts(
  hints: CheckpointEvaluationHints | null | undefined,
  candidateText: string,
): number {
  const mustConcepts = hints?.mustConcepts ?? [];
  if (mustConcepts.length === 0) {
    return 0;
  }

  return countMatchedConcepts(candidateText, mustConcepts);
}

export function hasPartialConceptCoverage(
  hints: CheckpointEvaluationHints | null | undefined,
  candidateText: string,
): boolean {
  const mustConcepts = hints?.mustConcepts ?? [];
  if (mustConcepts.length === 0) {
    return false;
  }

  const minMatched = hints?.minMatchedConcepts ?? 1;
  const matched = countMatchedConcepts(candidateText, mustConcepts);

  return matched > 0 && matched < minMatched;
}

/** After at least one follow-up: candidate covered part of mustConcepts but not enough. */
export function residualGapProbeRequired(input: ProbeRequiredInput): boolean {
  const { checkpoint, state, hints } = input;
  const candidateEvidenceText = input.candidateEvidenceText ?? '';
  const latestCandidateText = input.latestCandidateText ?? candidateEvidenceText;

  if (!ELIGIBLE_PROBE_STATUSES.has(state.status as CheckpointStateStatus)) {
    return false;
  }

  if (state.followUpCount < 1) {
    return false;
  }

  if (hints?.probePolicy?.allowResidualGapProbe === false) {
    return false;
  }

  if (state.maxScore > 0 && state.scoreAwarded >= state.maxScore * 0.75) {
    return false;
  }

  if (
    isTargetedTopicRefusal(latestCandidateText) &&
    state.status !== 'covered'
  ) {
    return false;
  }

  if (
    hasFalseClaimSignal(
      checkpoint,
      state,
      latestCandidateText,
      candidateEvidenceText,
    )
  ) {
    return false;
  }

  if (!hasPartialConceptCoverage(hints, candidateEvidenceText)) {
    return false;
  }

  return hasConceptGap(hints, candidateEvidenceText);
}

export function isWithinCheckpointFollowUpBudget(input: {
  state: ProbePolicyCheckpointState;
  maxFollowUpsPerCheckpoint: number;
  residualGapProbeRequired: boolean;
}): boolean {
  if (input.state.followUpCount < input.maxFollowUpsPerCheckpoint) {
    return true;
  }

  if (!input.residualGapProbeRequired) {
    return false;
  }

  const residualCap =
    input.maxFollowUpsPerCheckpoint + RESIDUAL_GAP_PROBE_EXTRA_BUDGET;

  return (
    input.state.followUpCount >= input.maxFollowUpsPerCheckpoint &&
    input.state.followUpCount < residualCap
  );
}

export function deriveProbeStatus(input: {
  checkpoint: AdaptiveCheckpointDefinition;
  state: ProbePolicyCheckpointState;
  hints: CheckpointEvaluationHints | null | undefined;
  questionMaxScore: number;
  candidateEvidenceText?: string;
  latestCandidateText?: string;
}): CheckpointProbeStatus {
  const { state } = input;

  if (state.status === 'covered' || state.status === 'skipped') {
    return 'closed';
  }

  if (residualGapProbeRequired(input)) {
    return 'open';
  }

  if (state.followUpCount > 0) {
    if (
      state.status === 'missed' ||
      (state.maxScore > 0 &&
        state.scoreAwarded >= state.maxScore * 0.75)
    ) {
      return 'closed';
    }

    return 'probed';
  }

  if (
    isTargetedTopicRefusal(input.latestCandidateText ?? '') &&
    state.status === 'missed'
  ) {
    return 'closed';
  }

  if (probeRequired(input)) {
    return 'open';
  }

  if (
    state.status === 'partial' ||
    state.status === 'unclear' ||
    (state.status === 'missed' && state.scoreAwarded > 0)
  ) {
    return 'provisional';
  }

  return 'closed';
}

export function getShallowAcceptFloorFraction(input: {
  hints: CheckpointEvaluationHints | null | undefined;
  tier: CheckpointComplexityTier;
  probeStatus: CheckpointProbeStatus;
}): number {
  const fromBank =
    input.hints?.probePolicy?.minScoreAfterShallowAccept ??
    input.hints?.probePolicy?.shallowAcceptMaxFraction;

  if (fromBank !== undefined) {
    return fromBank;
  }

  if (input.probeStatus === 'open') {
    return DEFAULT_MIN_SCORE_AFTER_SHALLOW_ACCEPT;
  }

  return TIER_SHALLOW_ACCEPT_FRACTION[input.tier];
}

export function getShallowAcceptFloorScore(
  maxScore: number,
  fraction: number,
): number {
  if (maxScore <= 0) {
    return 0;
  }

  return Number((maxScore * fraction).toFixed(2));
}

export function isProbePendingRationale(
  rationale: string | null | undefined,
): boolean {
  return /probe\s*=\s*pending/i.test(rationale ?? '');
}

export function appendProbePendingRationale(
  rationale: string | null | undefined,
  missingConcepts: string[],
): string {
  const base = (rationale ?? '').trim();
  const withoutProbe = base.replace(/\s*probe\s*=\s*\w+/gi, '').trim();
  const missingHint =
    missingConcepts.length > 0
      ? ` Missing mustConcepts not yet asked: ${missingConcepts.slice(0, 3).join(', ')}.`
      : ' Details not yet verified in dialogue.';
  const suffix = `depth=partial_knowledge, probe=pending, coverage=medium:${missingHint}`;

  return withoutProbe ? `${withoutProbe} ${suffix}` : suffix;
}

export function isExhaustedPartialForFollowUp(input: {
  state: ProbePolicyCheckpointState;
  checkpoint: AdaptiveCheckpointDefinition;
  hints: CheckpointEvaluationHints | null | undefined;
  questionMaxScore: number;
  candidateEvidenceText?: string;
  latestCandidateText?: string;
}): boolean {
  if (input.state.status !== 'partial' || input.state.maxScore <= 0) {
    return false;
  }

  if (
    probeRequired({
      checkpoint: input.checkpoint,
      state: input.state,
      hints: input.hints,
      questionMaxScore: input.questionMaxScore,
      candidateEvidenceText: input.candidateEvidenceText,
      latestCandidateText: input.latestCandidateText,
    })
  ) {
    return false;
  }

  if (
    residualGapProbeRequired({
      checkpoint: input.checkpoint,
      state: input.state,
      hints: input.hints,
      questionMaxScore: input.questionMaxScore,
      candidateEvidenceText: input.candidateEvidenceText,
      latestCandidateText: input.latestCandidateText,
    })
  ) {
    return false;
  }

  const depth = parseDepthFromRationale(input.state.rationale ?? null);
  const partialThreshold = input.state.maxScore * 0.5;
  return (
    input.state.scoreAwarded >= partialThreshold &&
    (depth === 'partial_knowledge' || depth === 'heard_of')
  );
}

export function hasPendingAdvancedProbe(input: {
  checkpoints: AdaptiveCheckpointDefinition[];
  checkpointStates: Array<
    ProbePolicyCheckpointState & { checkpointKey: string }
  >;
  questionMaxScore: number;
  candidateEvidenceText?: string;
  latestCandidateText?: string;
  checkpointEvidenceTextByKey?: Record<string, string>;
  maxFollowUpsPerCheckpoint?: number;
}): boolean {
  const stateByKey = new Map(
    input.checkpointStates.map((state) => [state.checkpointKey, state]),
  );

  return input.checkpoints.some((checkpoint) => {
    const state = stateByKey.get(checkpoint.checkpointKey);
    if (!state) {
      return false;
    }

    if (checkpoint.score < 2) {
      return false;
    }

    const evidence =
      input.checkpointEvidenceTextByKey?.[checkpoint.checkpointKey] ??
      input.candidateEvidenceText;

    return probeRequired({
      checkpoint,
      state,
      hints: checkpoint.evaluationHints,
      questionMaxScore: input.questionMaxScore,
      candidateEvidenceText: evidence,
      latestCandidateText: input.latestCandidateText,
    });
  });
}

export function hasPendingResidualGapProbe(input: {
  checkpoints: AdaptiveCheckpointDefinition[];
  checkpointStates: Array<
    ProbePolicyCheckpointState & { checkpointKey: string }
  >;
  questionMaxScore: number;
  latestCandidateText?: string;
  checkpointEvidenceTextByKey?: Record<string, string>;
  maxFollowUpsPerCheckpoint: number;
}): boolean {
  const stateByKey = new Map(
    input.checkpointStates.map((state) => [state.checkpointKey, state]),
  );

  return input.checkpoints.some((checkpoint) => {
    const state = stateByKey.get(checkpoint.checkpointKey);
    if (!state) {
      return false;
    }

    const evidence =
      input.checkpointEvidenceTextByKey?.[checkpoint.checkpointKey] ??
      input.latestCandidateText ??
      '';

    const needsResidual = residualGapProbeRequired({
      checkpoint,
      state,
      hints: checkpoint.evaluationHints,
      questionMaxScore: input.questionMaxScore,
      candidateEvidenceText: evidence,
      latestCandidateText: input.latestCandidateText,
    });

    return isWithinCheckpointFollowUpBudget({
      state,
      maxFollowUpsPerCheckpoint: input.maxFollowUpsPerCheckpoint,
      residualGapProbeRequired: needsResidual,
    });
  });
}

export function hasPendingProbe(input: {
  checkpoints: AdaptiveCheckpointDefinition[];
  checkpointStates: Array<
    ProbePolicyCheckpointState & { checkpointKey: string }
  >;
  questionMaxScore: number;
  candidateEvidenceText?: string;
  latestCandidateText?: string;
  checkpointEvidenceTextByKey?: Record<string, string>;
  maxFollowUpsPerCheckpoint: number;
}): boolean {
  return (
    hasPendingAdvancedProbe(input) ||
    hasPendingResidualGapProbe(input)
  );
}

export function compareProbePriority(
  left: {
    checkpoint: AdaptiveCheckpointDefinition;
    state: ProbePolicyCheckpointState;
    hints: CheckpointEvaluationHints | null | undefined;
  },
  right: {
    checkpoint: AdaptiveCheckpointDefinition;
    state: ProbePolicyCheckpointState;
    hints: CheckpointEvaluationHints | null | undefined;
  },
  questionMaxScore: number,
  leftCandidateEvidenceText: string,
  rightCandidateEvidenceText: string = leftCandidateEvidenceText,
): number {
  const leftRequired = probeRequired({
    checkpoint: left.checkpoint,
    state: left.state,
    hints: left.hints,
    questionMaxScore,
    candidateEvidenceText: leftCandidateEvidenceText,
  });
  const rightRequired = probeRequired({
    checkpoint: right.checkpoint,
    state: right.state,
    hints: right.hints,
    questionMaxScore,
    candidateEvidenceText: rightCandidateEvidenceText,
  });

  if (leftRequired !== rightRequired) {
    return leftRequired ? -1 : 1;
  }

  const leftResidual = residualGapProbeRequired({
    checkpoint: left.checkpoint,
    state: left.state,
    hints: left.hints,
    questionMaxScore,
    candidateEvidenceText: leftCandidateEvidenceText,
  });
  const rightResidual = residualGapProbeRequired({
    checkpoint: right.checkpoint,
    state: right.state,
    hints: right.hints,
    questionMaxScore,
    candidateEvidenceText: rightCandidateEvidenceText,
  });

  if (leftResidual !== rightResidual) {
    return leftResidual ? -1 : 1;
  }

  const leftGap = hasConceptGap(left.hints, leftCandidateEvidenceText) ? 1 : 0;
  const rightGap = hasConceptGap(right.hints, rightCandidateEvidenceText) ? 1 : 0;
  const leftWeight = left.checkpoint.score * (leftGap + 1);
  const rightWeight = right.checkpoint.score * (rightGap + 1);

  return rightWeight - leftWeight;
}

/** Resolve candidate-facing probe phrases from bank `probeConceptGroups`. */
export function resolveProbePhrasesForCandidate(
  hints: CheckpointEvaluationHints | null | undefined,
  missingMustConcepts: string[],
  maxPhrases = 2,
): string | null {
  const groups = hints?.probeConceptGroups ?? [];
  if (groups.length === 0 || missingMustConcepts.length === 0) {
    return null;
  }

  const missingLower = missingMustConcepts.map((concept) =>
    concept.trim().toLowerCase(),
  );
  const phrases: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    const groupStillMissing = group.match.some((stem) => {
      const stemLower = stem.trim().toLowerCase();
      return missingLower.some(
        (missing) =>
          missing === stemLower ||
          missing.includes(stemLower) ||
          stemLower.includes(missing),
      );
    });

    if (groupStillMissing && group.ask.trim().length > 0 && !seen.has(group.ask)) {
      seen.add(group.ask);
      phrases.push(group.ask.trim());
    }
  }

  if (phrases.length === 0) {
    return null;
  }

  return phrases.slice(0, maxPhrases).join(', ');
}

export function buildProbeFollowUpQuestion(input: {
  checkpointTitle: string;
  missingMustConcepts: string[];
  hints?: CheckpointEvaluationHints | null;
  seed?: number;
  previousFollowUpQuestions?: string[];
  answerTone?: FollowUpAnswerTone;
}): string {
  const seed = input.seed ?? input.missingMustConcepts.length;
  const previous = input.previousFollowUpQuestions ?? [];
  const tone = input.answerTone ?? 'good';
  const acknowledgment = pickProbeAcknowledgment(tone, seed, previous);
  const stem = pickProbeQuestionStem(seed + 1, previous);

  const conceptList = resolveProbePhrasesForCandidate(
    input.hints,
    input.missingMustConcepts,
  );

  if (!conceptList) {
    if (tone === 'weak') {
      return `${acknowledgment} Давайте разберём технические детали — что сможете добавить?`;
    }
    return `${acknowledgment} Можете уточнить технические детали?`;
  }

  return `${acknowledgment} ${stem} ${conceptList}?`;
}

export function buildResidualGapFollowUpQuestion(input: {
  missingMustConcepts: string[];
  hints?: CheckpointEvaluationHints | null;
  seed?: number;
  previousFollowUpQuestions?: string[];
}): string {
  const seed = input.seed ?? input.missingMustConcepts.length;
  const previous = input.previousFollowUpQuestions ?? [];
  const acknowledgment = pickResidualAcknowledgment(seed, previous);

  const conceptList = resolveProbePhrasesForCandidate(
    input.hints,
    input.missingMustConcepts,
  );

  if (!conceptList) {
    return `${acknowledgment} Можете добавить ещё детали по этой теме?`;
  }

  return `${acknowledgment} А ${conceptList} — что сможете добавить?`;
}
