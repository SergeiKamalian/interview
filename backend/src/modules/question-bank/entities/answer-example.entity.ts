import type { AnswerExampleType } from '../types/answer-example-type.enum';

export type AnswerExampleEntity = {
  id: number;
  questionId: number;
  exampleType: AnswerExampleType;
  exampleText: string;
  sortOrder: number;
  createdAt: Date;
};
