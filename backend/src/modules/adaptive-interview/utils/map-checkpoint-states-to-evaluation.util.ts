import type { CheckpointDefinition } from '../../ai-evaluation/types/checkpoint-evaluation.types';
import type { CheckpointEvaluationResultItem } from '../../ai-evaluation/types/evaluation.types';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';

export function mapCheckpointStateToEvaluationResult(
  state: InterviewCheckpointStateEntity,
): CheckpointEvaluationResultItem {
  return {
    checkpointKey: state.checkpointKey,
    status: mapAdaptiveStatusToEvaluationStatus(state.status),
    confidence: state.confidence ?? 0,
    reasoningShort:
      state.rationale?.trim() || state.evidenceSummary?.trim() || 'No rationale',
    evidenceQuote: state.evidenceSummary?.trim() || '',
    scoreAwarded: state.scoreAwarded,
  };
}

export function mapCheckpointStatesToEvaluationResults(
  states: InterviewCheckpointStateEntity[],
): CheckpointEvaluationResultItem[] {
  return states
    .filter((state) => state.status !== 'unseen')
    .map((state) => mapCheckpointStateToEvaluationResult(state));
}

export function mapSnapshotCheckpointsToDefinitions(
  checkpoints: Array<{
    checkpointKey: string;
    title: string;
    expected: string;
    score: number;
    sortOrder: number;
  }>,
): CheckpointDefinition[] {
  return checkpoints.map((checkpoint) => ({
    checkpointKey: checkpoint.checkpointKey,
    title: checkpoint.title,
    expected: checkpoint.expected,
    score: checkpoint.score,
    sortOrder: checkpoint.sortOrder,
  }));
}

function mapAdaptiveStatusToEvaluationStatus(
  status: InterviewCheckpointStateEntity['status'],
): CheckpointEvaluationResultItem['status'] {
  switch (status) {
    case 'covered':
      return 'met';
    case 'partial':
      return 'partially_met';
    case 'missed':
    case 'unclear':
    case 'skipped':
    case 'unseen':
    default:
      return 'not_met';
  }
}
