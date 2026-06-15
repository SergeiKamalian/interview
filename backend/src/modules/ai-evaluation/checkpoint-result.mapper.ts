import type { UpsertCheckpointResultData } from './entities/checkpoint-result.entity';
import type { CheckpointDefinition } from './types/checkpoint-evaluation.types';
import type { CheckpointEvaluationResultItem } from './types/evaluation.types';

const PARTIAL_SCORE_RATIO = 0.5;

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

    return {
      checkpointKey: checkpoint.checkpointKey,
      matched: result.status === 'met' || result.status === 'partially_met',
      scoreAwarded: roundScore(
        awardCheckpointScore(checkpoint.score, result.status),
      ),
      evidenceQuote: result.evidenceQuote || null,
    };
  });
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
