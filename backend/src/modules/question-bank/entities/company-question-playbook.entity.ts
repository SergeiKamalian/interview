import type { QuestionLevel } from '../types/question-level.enum';

export type CompanyQuestionPlaybookEntity = {
  id: number;
  companyId: number;
  name: string;
  professionId: number;
  level: QuestionLevel;
  skillIds: number[] | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyQuestionPlaybookItemEntity = {
  id: number;
  playbookId: number;
  questionId: number;
  sortOrder: number;
  isPinned: boolean;
};
