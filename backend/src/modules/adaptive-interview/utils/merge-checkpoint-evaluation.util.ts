import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import type { EvaluationEvidenceSource } from '../types/evaluation-evidence-source.type';
import { getFollowUpEvidenceWeightConfig } from '../config/follow-up-evidence-weight.config';

const STATUS_RANK: Record<CheckpointStateStatus, number> = {
  covered: 5,
  partial: 4,
  unclear: 3,
  missed: 2,
  skipped: 1,
  unseen: 0,
};

export type MergeCheckpointEvaluationInput = {
  currentScoreAwarded: number;
  currentStatus: CheckpointStateStatus;
  currentEvidenceSummary: string | null;
  currentRationale: string | null;
  incomingScoreAwarded: number;
  incomingStatus: CheckpointStateStatus;
  incomingEvidenceSummary: string | null;
  incomingRationale: string | null;
  maxScore: number;
  evidenceSource?: EvaluationEvidenceSource;
  /** Dedicated follow-up for this checkpoint — allow stronger score uplift. */
  relaxFollowUpWeight?: boolean;
  /** When true, a worse incoming turn may reduce the merged score (false claim / refusal). */
  incomingAllowsScoreDecrease?: boolean;
};

export type MergeCheckpointEvaluationResult = {
  scoreAwarded: number;
  status: CheckpointStateStatus;
  evidenceSummary: string | null;
  rationale: string | null;
};

export function mergeCheckpointEvaluation(
  input: MergeCheckpointEvaluationInput,
): MergeCheckpointEvaluationResult {
  const weightedIncoming = applyFollowUpEvidenceWeight(
    input.currentScoreAwarded,
    input.incomingScoreAwarded,
    input.maxScore,
    input.evidenceSource,
    input.relaxFollowUpWeight,
  );

  const allowsDecrease = incomingAllowsScoreDecrease(input);

  const mergedScore =
    allowsDecrease && weightedIncoming < input.currentScoreAwarded
      ? Math.min(input.maxScore, weightedIncoming)
      : Math.min(
          input.maxScore,
          Math.max(input.currentScoreAwarded, weightedIncoming),
        );

  let status: CheckpointStateStatus;
  if (mergedScore > input.currentScoreAwarded) {
    status = input.incomingStatus;
  } else if (mergedScore < input.currentScoreAwarded) {
    status = input.incomingStatus;
  } else {
    status = pickHigherRankStatus(input.currentStatus, input.incomingStatus);
  }

  if (mergedScore <= 0) {
    status = 'missed';
  } else if (input.maxScore > 0 && mergedScore >= input.maxScore) {
    status = 'covered';
  } else if (status === 'covered' || status === 'missed') {
    status = 'partial';
  }

  const incomingWins =
    mergedScore > input.currentScoreAwarded ||
    (allowsDecrease && mergedScore < input.currentScoreAwarded);

  return {
    scoreAwarded: mergedScore,
    status,
    evidenceSummary: incomingWins
      ? input.incomingEvidenceSummary
      : (input.currentEvidenceSummary ?? input.incomingEvidenceSummary),
    rationale: incomingWins
      ? input.incomingRationale
      : (input.currentRationale ?? input.incomingRationale),
  };
}

export function incomingAllowsScoreDecrease(
  input: Pick<
    MergeCheckpointEvaluationInput,
    'incomingRationale' | 'incomingAllowsScoreDecrease'
  >,
): boolean {
  if (input.incomingAllowsScoreDecrease) {
    return true;
  }

  const rationale = input.incomingRationale ?? '';
  return (
    /depth\s*=\s*false_claim/i.test(rationale) ||
    /semantic guard capped/i.test(rationale) ||
    /score capped:.*false_claim/i.test(rationale) ||
    /explicit refusal in latest answer/i.test(rationale)
  );
}

export function applyFollowUpEvidenceWeight(
  currentScore: number,
  incomingScore: number,
  maxScore: number,
  evidenceSource?: EvaluationEvidenceSource,
  relaxFollowUpWeight = false,
): number {
  if (evidenceSource !== 'follow_up_answer' || incomingScore <= currentScore) {
    return incomingScore;
  }

  const { scoreDeltaCap, maxRelativeBoost } = getFollowUpEvidenceWeightConfig();
  const delta = incomingScore - currentScore;

  if (relaxFollowUpWeight) {
    if (currentScore <= 0) {
      return Math.min(maxScore, incomingScore);
    }

    const relaxedCap = Math.min(delta, maxScore * 0.75);
    return Math.min(maxScore, currentScore + relaxedCap);
  }

  if (currentScore <= 0) {
    const cappedDelta = Math.min(delta, scoreDeltaCap * maxScore);
    return currentScore + cappedDelta;
  }

  const cappedDelta = Math.min(delta, currentScore * maxRelativeBoost);
  return Math.min(maxScore, currentScore + cappedDelta);
}

function pickHigherRankStatus(
  left: CheckpointStateStatus,
  right: CheckpointStateStatus,
): CheckpointStateStatus {
  return (STATUS_RANK[right] ?? 0) >= (STATUS_RANK[left] ?? 0) ? right : left;
}
