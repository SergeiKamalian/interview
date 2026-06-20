export const INTERVIEW_STATUSES = [
  'draft',
  'active',
  'paused',
  'archived',
] as const;

export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];
