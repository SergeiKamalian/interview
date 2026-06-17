import type { CheckpointEvaluationHints } from '../../adaptive-interview/types/checkpoint-evaluation-hints.type';

export type InterviewQuestionCheckpointEntity = {
  id: number;
  interviewQuestionId: number;
  checkpointKey: string;
  title: string;
  expected: string;
  evaluationHints: CheckpointEvaluationHints | null;
  score: number;
  sortOrder: number;
  createdAt: Date;
};
