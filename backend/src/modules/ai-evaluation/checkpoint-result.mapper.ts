import type { UpsertCheckpointResultData } from './entities/checkpoint-result.entity';
import type { CheckpointDefinition } from './types/checkpoint-evaluation.types';
import type { CheckpointEvaluationResultItem } from './types/evaluation.types';

const PARTIAL_SCORE_RATIO = 0.5;
const MET_SCORE_RATIO = 0.85;

export function mapCheckpointResultsForStorage(
  checkpoints: CheckpointDefinition[],
  checkpointResults: CheckpointEvaluationResultItem[],
): UpsertCheckpointResultData[] {
  const resultsByKey = new Map(
    checkpointResults.map((result) => [result.checkpointKey, result]),
  );

  return checkpoints.map((checkpoint) => {
    const result = resultsByKey.get(checkpoint.checkpointKey);
    if (!result) {
      return {
        checkpointKey: checkpoint.checkpointKey,
        matched: false,
        scoreAwarded: 0,
        evidenceQuote: null,
      };
    }

    const scoreAwarded = resolveStoredScoreAwarded(checkpoint.score, result);

    return {
      checkpointKey: checkpoint.checkpointKey,
      matched:
        scoreAwarded >= checkpoint.score * MET_SCORE_RATIO ||
        result.status === 'met',
      scoreAwarded: roundScore(scoreAwarded),
      evidenceQuote: result.evidenceQuote || null,
    };
  });
}

function resolveStoredScoreAwarded(
  maxCheckpointScore: number,
  result: CheckpointEvaluationResultItem,
): number {
  if (
    typeof result.scoreAwarded === 'number' &&
    Number.isFinite(result.scoreAwarded)
  ) {
    return Math.min(maxCheckpointScore, Math.max(0, result.scoreAwarded));
  }

  return awardCheckpointScore(maxCheckpointScore, result.status);
}

function awardCheckpointScore(
  maxCheckpointScore: number,
  status: CheckpointEvaluationResultItem['status'],
): number {
  if (status === 'met') {
    return maxCheckpointScore;
  }

  if (status === 'partially_met') {
    return maxCheckpointScore * PARTIAL_SCORE_RATIO;
  }

  return 0;
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
