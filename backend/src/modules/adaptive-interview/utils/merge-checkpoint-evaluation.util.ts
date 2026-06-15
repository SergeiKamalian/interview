import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';

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
  const mergedScore = Math.min(
    input.maxScore,
    Math.max(input.currentScoreAwarded, input.incomingScoreAwarded),
  );

  let status: CheckpointStateStatus;
  if (mergedScore > input.currentScoreAwarded) {
    status = input.incomingStatus;
  } else if (mergedScore < input.currentScoreAwarded) {
    status = input.currentStatus;
  } else {
    status = pickHigherRankStatus(input.currentStatus, input.incomingStatus);
  }

  if (input.maxScore > 0 && mergedScore >= input.maxScore) {
    status = 'covered';
  } else if (mergedScore > 0 && status === 'missed') {
    status = 'partial';
  }

  const incomingWins = mergedScore > input.currentScoreAwarded;

  return {
    scoreAwarded: mergedScore,
    status,
    evidenceSummary: incomingWins
      ? input.incomingEvidenceSummary
      : input.currentEvidenceSummary ?? input.incomingEvidenceSummary,
    rationale: incomingWins
      ? input.incomingRationale
      : input.currentRationale ?? input.incomingRationale,
  };
}

function pickHigherRankStatus(
  left: CheckpointStateStatus,
  right: CheckpointStateStatus,
): CheckpointStateStatus {
  return (STATUS_RANK[right] ?? 0) >= (STATUS_RANK[left] ?? 0) ? right : left;
}
