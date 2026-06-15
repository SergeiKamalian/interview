export type InterviewFollowUpEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  interviewQuestionId: number;
  checkpointKey: string;
  followUpQuestionMessageId: number | null;
  candidateAnswerMessageId: number | null;
  questionText: string;
  reason: string;
  status: 'planned' | 'asked' | 'answered' | 'skipped' | 'failed';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateInterviewFollowUpData = {
  companyId: number;
  interviewAttemptId: number;
  interviewQuestionId: number;
  checkpointKey: string;
  questionText: string;
  reason: string;
  status: 'planned' | 'asked' | 'answered' | 'skipped' | 'failed';
  sortOrder: number;
};
