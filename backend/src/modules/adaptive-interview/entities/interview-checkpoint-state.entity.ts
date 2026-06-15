import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';

export type InterviewCheckpointStateEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  interviewQuestionId: number;
  checkpointKey: string;
  status: CheckpointStateStatus;
  scoreAwarded: number;
  maxScore: number;
  confidence: number | null;
  evidenceSummary: string | null;
  evidenceMessageIds: number[] | null;
  rationale: string | null;
  followUpCount: number;
  needsManualReview: boolean;
  createdAt: Date;
  updatedAt: Date;
};
