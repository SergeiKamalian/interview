import type { AdaptiveCheckpointDefinition } from '../types/adaptive-interview-context.types';
import type {
  CheckpointComplexityTier,
  CheckpointEvaluationHints,
} from '../types/checkpoint-evaluation-hints.type';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import {
  countMatchedMustConcepts,
  resolveComplexityTier,
} from './probe-policy.util';

const TIER_MULTIPLIER: Record<CheckpointComplexityTier, number> = {
  mention: 0.3,
  basic: 0.6,
  core_plus: 0.8,
  intermediate: 1.0,
  advanced: 1.2,
  expert: 1.3,
};

const UNCERTAINTY_MULTIPLIER: Record<CheckpointStateStatus, number> = {
  unclear: 1.0,
  partial: 0.9,
  missed: 0.7,
  covered: 0.5,
  skipped: 0.5,
  unseen: 0.5,
};

export type ProbePriorityResult = {
  priority: number;
  gapScore: number;
  tier: CheckpointComplexityTier;
  reasons: string[];
};

export function computeGapScore(
  hints: CheckpointEvaluationHints | null | undefined,
  candidateText: string,
): number {
  const mustConcepts = hints?.mustConcepts ?? [];
  if (mustConcepts.length === 0) {
    return 1;
  }

  const minMatched = hints?.minMatchedConcepts ?? 1;
  const matched = countMatchedMustConcepts(hints, candidateText);
  const raw = 1 - matched / minMatched;

  return Math.min(1, Math.max(0, raw));
}

export function computeProbePriority(input: {
  checkpoint: AdaptiveCheckpointDefinition;
  state: { status: CheckpointStateStatus | string };
  hints: CheckpointEvaluationHints | null | undefined;
  questionMaxScore: number;
  candidateEvidenceText: string;
}): ProbePriorityResult {
  const weightRatio =
    input.questionMaxScore > 0
      ? input.checkpoint.score / input.questionMaxScore
      : 0;
  const gapScore = computeGapScore(input.hints, input.candidateEvidenceText);
  const tier = resolveComplexityTier(
    input.hints,
    input.checkpoint.score,
    input.questionMaxScore,
  );
  const tierMultiplier = TIER_MULTIPLIER[tier];
  const uncertaintyMultiplier =
    UNCERTAINTY_MULTIPLIER[input.state.status as CheckpointStateStatus] ?? 0.8;

  const priority =
    weightRatio * gapScore * tierMultiplier * uncertaintyMultiplier;

  const reasons = [
    `weight_ratio=${weightRatio.toFixed(3)}`,
    `gap=${gapScore.toFixed(3)}`,
    `tier=${tier}(${tierMultiplier})`,
    `status=${input.state.status}(${uncertaintyMultiplier})`,
  ];

  return { priority, gapScore, tier, reasons };
}

export function isHighPriorityForStagnationBypass(
  priorityResult: Pick<ProbePriorityResult, 'gapScore' | 'tier' | 'priority'>,
  minPriorityToProbe: number,
): boolean {
  return (
    priorityResult.tier === 'advanced' ||
    priorityResult.tier === 'expert' ||
    priorityResult.gapScore >= 0.5 ||
    priorityResult.priority >= minPriorityToProbe * 2
  );
}
