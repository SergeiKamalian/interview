export const QUESTION_SCOPES = ['global', 'company', 'all'] as const;

export type QuestionScope = (typeof QUESTION_SCOPES)[number];
