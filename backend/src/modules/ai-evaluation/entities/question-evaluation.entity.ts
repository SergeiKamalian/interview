export type QuestionEvaluationEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  interviewMessageId: number;
  interviewQuestionId: number;
  score: number;
  maxScore: number;
  shortSummary: string | null;
  review: string | null;
  rawResponse: Record<string, unknown> | null;
  needsManualReview: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertQuestionEvaluationData = {
  companyId: number;
  interviewAttemptId: number;
  interviewMessageId: number;
  interviewQuestionId: number;
  score: number;
  maxScore: number;
  shortSummary: string | null;
  review: string | null;
  rawResponse: Record<string, unknown>;
  needsManualReview: boolean;
};
