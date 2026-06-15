export const QUESTION_LEVELS = ['junior', 'middle', 'senior', 'lead'] as const;

export type QuestionLevel = (typeof QUESTION_LEVELS)[number];
