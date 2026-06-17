import type { InterviewAnswerExampleEntity } from '../../interview-core/entities/interview-answer-example.entity';
import type { AdaptiveCheckpointDefinition } from '../types/adaptive-interview-context.types';

export function attachSnapshotExamplesToCheckpoints(
  checkpoints: Array<{
    checkpointKey: string;
    title: string;
    expected: string;
    score: number;
    sortOrder: number;
    evaluationHints: AdaptiveCheckpointDefinition['evaluationHints'];
  }>,
  examples: InterviewAnswerExampleEntity[],
): AdaptiveCheckpointDefinition[] {
  const questionGoodExamples = examples
    .filter((item) => item.exampleType === 'good' && !item.checkpointKey)
    .map((item) => item.exampleText);
  const questionBadExamples = examples
    .filter((item) => item.exampleType === 'bad' && !item.checkpointKey)
    .map((item) => item.exampleText);

  return checkpoints.map((checkpoint) => {
    const goodExamples = examples
      .filter(
        (item) =>
          item.exampleType === 'good' &&
          item.checkpointKey === checkpoint.checkpointKey,
      )
      .map((item) => item.exampleText);
    const badExamples = examples
      .filter(
        (item) =>
          item.exampleType === 'bad' &&
          item.checkpointKey === checkpoint.checkpointKey,
      )
      .map((item) => item.exampleText);

    return {
      ...checkpoint,
      goodExamples,
      badExamples,
      questionGoodExamples,
      questionBadExamples,
    };
  });
}
