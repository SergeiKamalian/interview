import type { AdaptiveCheckpointDefinition } from '../types/adaptive-interview-context.types';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import {
  computeProbePriority,
  type ProbePriorityResult,
} from './probe-priority.util';
import {
  RESIDUAL_GAP_PROBE_EXTRA_BUDGET,
} from '../types/checkpoint-probe-policy.type';
import {
  probeRequired,
  residualGapProbeRequired,
  resolveComplexityTier,
  type ProbePolicyCheckpointState,
} from './probe-policy.util';

export type FollowUpBudgetConfig = {
  maxFollowUpsPerQuestion: number;
  maxFollowUpsHeavyCheckpoint: number;
  heavyCheckpointWeightRatio: number;
  minPriorityToProbe: number;
};

export type BudgetAllocatorCandidate = {
  checkpointKey: string;
  checkpoint: AdaptiveCheckpointDefinition;
  state: ProbePolicyCheckpointState;
  hints: CheckpointEvaluationHints | null | undefined;
  candidateEvidenceText: string;
  isProbeRequired: boolean;
  isResidualGapRequired: boolean;
  priorityResult: ProbePriorityResult;
  maxFollowUpsCap: number;
};

export type FollowUpBudgetAllocation = {
  canProbe: boolean;
  selectedCheckpointKey?: string;
  reason: string;
  remainingBudget: number;
  skippedLowPriority: string[];
  rankedCandidates: Array<{
    checkpointKey: string;
    priority: number;
    rank: number;
  }>;
};

export function resolveMinPriorityToProbe(
  hints: CheckpointEvaluationHints | null | undefined,
  config: FollowUpBudgetConfig,
): number {
  return hints?.probePolicy?.minPriorityToProbe ?? config.minPriorityToProbe;
}

export function maxFollowUpsForCheckpoint(input: {
  checkpoint: AdaptiveCheckpointDefinition;
  hints: CheckpointEvaluationHints | null | undefined;
  questionMaxScore: number;
  config: FollowUpBudgetConfig;
}): number {
  const bankCap = input.hints?.probePolicy?.maxFollowUps;
  if (bankCap !== undefined) {
    return bankCap;
  }

  const tier = resolveComplexityTier(
    input.hints,
    input.checkpoint.score,
    input.questionMaxScore,
  );

  if (tier === 'mention' || tier === 'basic') {
    return 0;
  }

  const weightRatio =
    input.questionMaxScore > 0
      ? input.checkpoint.score / input.questionMaxScore
      : 0;

  if (
    input.checkpoint.score >= 2 ||
    weightRatio >= input.config.heavyCheckpointWeightRatio ||
    tier === 'advanced' ||
    tier === 'expert'
  ) {
    return input.config.maxFollowUpsHeavyCheckpoint;
  }

  return 1;
}

export function allocateFollowUpBudget(input: {
  candidates: BudgetAllocatorCandidate[];
  followUpsUsedForQuestion: number;
  config: FollowUpBudgetConfig;
  stickyTargetCheckpointKey?: string | null;
  questionScoreSufficient?: boolean;
}): FollowUpBudgetAllocation {
  const remainingBudget = Math.max(
    0,
    input.config.maxFollowUpsPerQuestion - input.followUpsUsedForQuestion,
  );

  if (remainingBudget <= 0) {
    return {
      canProbe: false,
      reason: 'question_follow_up_limit_reached',
      remainingBudget: 0,
      skippedLowPriority: [],
      rankedCandidates: [],
    };
  }

  if (input.candidates.length === 0) {
    return {
      canProbe: false,
      reason: 'no_eligible_checkpoints',
      remainingBudget,
      skippedLowPriority: [],
      rankedCandidates: [],
    };
  }

  const enriched = input.candidates.map((candidate) => {
    const minPriority = resolveMinPriorityToProbe(candidate.hints, input.config);
    return { ...candidate, minPriority };
  });

  const sorted = [...enriched].sort((left, right) =>
    compareBudgetCandidates(
      left,
      right,
      input.stickyTargetCheckpointKey,
      input.config.minPriorityToProbe,
    ),
  );

  const skippedLowPriority = sorted
    .filter(
      (candidate) =>
        candidate.priorityResult.priority < candidate.minPriority &&
        !candidate.isProbeRequired &&
        !candidate.isResidualGapRequired,
    )
    .map((candidate) => candidate.checkpointKey);

  const rankedCandidates = sorted.map((candidate, index) => ({
    checkpointKey: candidate.checkpointKey,
    priority: candidate.priorityResult.priority,
    rank: index + 1,
  }));

  const probeRequiredCandidates = sorted.filter(
    (candidate) => candidate.isProbeRequired,
  );
  const reservedProbeRequiredKey =
    probeRequiredCandidates.length > 0 && remainingBudget >= 1
      ? probeRequiredCandidates[0]!.checkpointKey
      : null;

  for (const candidate of sorted) {
    const { priorityResult, minPriority } = candidate;

    if (candidate.state.followUpCount >= effectiveFollowUpCap(candidate)) {
      continue;
    }

    const belowPriority =
      priorityResult.priority < minPriority &&
      !candidate.isProbeRequired &&
      !candidate.isResidualGapRequired;

    if (belowPriority) {
      continue;
    }

    if (
      input.questionScoreSufficient &&
      belowPriority &&
      !candidate.isProbeRequired
    ) {
      continue;
    }

    const isReservedChoice =
      reservedProbeRequiredKey === null ||
      candidate.checkpointKey === reservedProbeRequiredKey ||
      !candidate.isProbeRequired;

    if (!isReservedChoice) {
      continue;
    }

    const reason = candidate.isProbeRequired
      ? 'budget_allocated_probe_required'
      : candidate.isResidualGapRequired
        ? 'budget_allocated_residual_gap'
        : 'budget_allocated_priority';

    return {
      canProbe: true,
      selectedCheckpointKey: candidate.checkpointKey,
      reason,
      remainingBudget,
      skippedLowPriority,
      rankedCandidates,
    };
  }

  if (skippedLowPriority.length > 0) {
    return {
      canProbe: false,
      reason: 'low_probe_priority',
      remainingBudget,
      skippedLowPriority,
      rankedCandidates,
    };
  }

  return {
    canProbe: false,
    reason: input.questionScoreSufficient
      ? 'sufficient_question_score'
      : 'checkpoint_follow_up_cap_reached',
    remainingBudget,
    skippedLowPriority,
    rankedCandidates,
  };
}

export function hasPendingRequiredProbe(input: {
  candidates: BudgetAllocatorCandidate[];
}): boolean {
  return input.candidates.some(
    (candidate) => candidate.isProbeRequired || candidate.isResidualGapRequired,
  );
}

export function hasProbeRequiredAbovePriority(input: {
  candidates: BudgetAllocatorCandidate[];
  config: FollowUpBudgetConfig;
}): boolean {
  return input.candidates.some((candidate) => {
    if (!candidate.isProbeRequired) {
      return false;
    }

    const minPriority = resolveMinPriorityToProbe(
      candidate.hints,
      input.config,
    );

    return candidate.priorityResult.priority >= minPriority;
  });
}

function compareBudgetCandidates(
  left: BudgetAllocatorCandidate & { minPriority: number },
  right: BudgetAllocatorCandidate & { minPriority: number },
  stickyTargetCheckpointKey: string | null | undefined,
  defaultMinPriority: number,
): number {
  const stickyKey = stickyTargetCheckpointKey;
  if (stickyKey) {
    const leftSticky =
      left.checkpointKey === stickyKey &&
      (left.isProbeRequired || left.isResidualGapRequired);
    const rightSticky =
      right.checkpointKey === stickyKey &&
      (right.isProbeRequired || right.isResidualGapRequired);

    if (leftSticky !== rightSticky) {
      return leftSticky ? -1 : 1;
    }
  }

  if (left.isProbeRequired !== right.isProbeRequired) {
    return left.isProbeRequired ? -1 : 1;
  }

  if (left.isResidualGapRequired !== right.isResidualGapRequired) {
    return left.isResidualGapRequired ? -1 : 1;
  }

  const leftBelow =
    left.priorityResult.priority < left.minPriority &&
    !left.isProbeRequired &&
    !left.isResidualGapRequired;
  const rightBelow =
    right.priorityResult.priority < right.minPriority &&
    !right.isProbeRequired &&
    !right.isResidualGapRequired;

  if (leftBelow !== rightBelow) {
    return leftBelow ? 1 : -1;
  }

  if (right.priorityResult.priority !== left.priorityResult.priority) {
    return right.priorityResult.priority - left.priorityResult.priority;
  }

  return left.checkpoint.sortOrder - right.checkpoint.sortOrder;
}

function effectiveFollowUpCap(candidate: BudgetAllocatorCandidate): number {
  if (
    candidate.isResidualGapRequired &&
    candidate.state.followUpCount >= candidate.maxFollowUpsCap
  ) {
    return candidate.maxFollowUpsCap + RESIDUAL_GAP_PROBE_EXTRA_BUDGET;
  }

  return candidate.maxFollowUpsCap;
}

export function buildBudgetAllocatorCandidate(input: {
  checkpoint: AdaptiveCheckpointDefinition;
  state: ProbePolicyCheckpointState & { checkpointKey: string };
  questionMaxScore: number;
  candidateEvidenceText: string;
  latestCandidateText?: string;
  candidateTurnKind?: CandidateTurnKind | null;
  config: FollowUpBudgetConfig;
}): BudgetAllocatorCandidate {
  const hints = input.checkpoint.evaluationHints;
  const priorityResult = computeProbePriority({
    checkpoint: input.checkpoint,
    state: input.state,
    hints,
    questionMaxScore: input.questionMaxScore,
    candidateEvidenceText: input.candidateEvidenceText,
  });
  const probeInput = {
    checkpoint: input.checkpoint,
    state: input.state,
    hints,
    questionMaxScore: input.questionMaxScore,
    candidateEvidenceText: input.candidateEvidenceText,
    latestCandidateText: input.latestCandidateText ?? input.candidateEvidenceText,
    candidateTurnKind: input.candidateTurnKind,
  };

  return {
    checkpointKey: input.state.checkpointKey,
    checkpoint: input.checkpoint,
    state: input.state,
    hints,
    candidateEvidenceText: input.candidateEvidenceText,
    isProbeRequired: probeRequired(probeInput),
    isResidualGapRequired: residualGapProbeRequired(probeInput),
    priorityResult,
    maxFollowUpsCap: maxFollowUpsForCheckpoint({
      checkpoint: input.checkpoint,
      hints,
      questionMaxScore: input.questionMaxScore,
      config: input.config,
    }),
  };
}

export function describeCheckpointCapLabel(input: {
  checkpoint: AdaptiveCheckpointDefinition;
  hints: CheckpointEvaluationHints | null | undefined;
  questionMaxScore: number;
  config: FollowUpBudgetConfig;
}): string {
  const cap = maxFollowUpsForCheckpoint({
    checkpoint: input.checkpoint,
    hints: input.hints,
    questionMaxScore: input.questionMaxScore,
    config: input.config,
  });
  const tier = resolveComplexityTier(
    input.hints,
    input.checkpoint.score,
    input.questionMaxScore,
  );

  if (cap === 0) {
    return `0 (${tier}, shallow only)`;
  }

  const weightRatio =
    input.questionMaxScore > 0
      ? input.checkpoint.score / input.questionMaxScore
      : 0;
  const isHeavy =
    cap >= input.config.maxFollowUpsHeavyCheckpoint &&
    (input.checkpoint.score >= 2 ||
      weightRatio >= input.config.heavyCheckpointWeightRatio ||
      tier === 'advanced' ||
      tier === 'expert');

  return isHeavy
    ? `${cap} (heavy, weight=${input.checkpoint.score})`
    : `${cap} (${tier}, weight=${input.checkpoint.score})`;
}
