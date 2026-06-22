export const QUESTION_STATUSES = ['draft', 'published'] as const;

export type QuestionStatus = (typeof QUESTION_STATUSES)[number];
