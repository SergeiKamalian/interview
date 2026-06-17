import type { AnswerExampleType } from '../../question-bank/types/answer-example-type.enum';

export type InterviewAnswerExampleEntity = {
  id: number;
  interviewQuestionId: number;
  checkpointKey: string | null;
  exampleType: AnswerExampleType;
  exampleText: string;
  sortOrder: number;
  createdAt: Date;
};
