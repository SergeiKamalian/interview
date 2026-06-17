import type { CheckpointEvaluationHints } from '../../adaptive-interview/types/checkpoint-evaluation-hints.type';

export type QuestionCheckpointEntity = {
  id: number;
  questionId: number;
  checkpointKey: string;
  title: string;
  expected: string;
  evaluationHints: CheckpointEvaluationHints | null;
  score: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
