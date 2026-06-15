export type InterviewQuestionSummaryEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  interviewQuestionId: number;
  score: number;
  maxScore: number;
  summary: string;
  strengths: string[] | null;
  weaknesses: string[] | null;
  unclearCheckpoints: string[] | null;
  followUpCount: number;
  needsManualReview: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertInterviewQuestionSummaryData = {
  companyId: number;
  interviewAttemptId: number;
  interviewQuestionId: number;
  score: number;
  maxScore: number;
  summary: string;
  strengths: string[] | null;
  weaknesses: string[] | null;
  unclearCheckpoints: string[] | null;
  followUpCount: number;
  needsManualReview: boolean;
};
