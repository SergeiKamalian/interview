export const ATTEMPT_STATUSES = [
  'pending',
  'in_progress',
  'completed',
  'abandoned',
] as const;

export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export type InterviewAttemptEntity = {
  id: number;
  companyId: number;
  interviewId: number;
  candidateId: number;
  status: AttemptStatus;
  isShortlisted: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
