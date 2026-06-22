import type { AnswerExampleType } from '../types/answer-example-type.enum';

export type OverrideAnswerExampleEntity = {
  exampleType: AnswerExampleType;
  exampleText: string;
  sortOrder: number;
  checkpointKey: string | null;
};

export type CompanyQuestionOverrideEntity = {
  id: number;
  companyId: number;
  sourceQuestionId: number;
  extraMustConcepts: string[] | null;
  extraFalseClaims: string[] | null;
  extraAnswerExamples: OverrideAnswerExampleEntity[] | null;
  topicWeightOverride: number | null;
  createdAt: Date;
  updatedAt: Date;
};
