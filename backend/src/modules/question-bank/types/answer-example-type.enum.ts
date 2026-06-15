export const ANSWER_EXAMPLE_TYPES = ['good', 'bad'] as const;

export type AnswerExampleType = (typeof ANSWER_EXAMPLE_TYPES)[number];
