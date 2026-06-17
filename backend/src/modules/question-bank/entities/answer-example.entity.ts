import type { AnswerExampleType } from '../types/answer-example-type.enum';

export type AnswerExampleEntity = {
  id: number;
  questionId: number;
  checkpointKey: string | null;
  exampleType: AnswerExampleType;
  exampleText: string;
  sortOrder: number;
  createdAt: Date;
};
