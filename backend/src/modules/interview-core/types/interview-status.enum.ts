export const INTERVIEW_STATUSES = ['draft', 'active', 'archived'] as const;

export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];
