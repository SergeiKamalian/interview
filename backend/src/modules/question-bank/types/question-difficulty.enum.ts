export const QUESTION_DIFFICULTIES = [
  'basic',
  'intermediate',
  'advanced',
] as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];
