import type { QuestionLevel } from '../../question-bank/types/question-level.enum';
import type { InterviewStatus } from '../types/interview-status.enum';
import type { InterviewQuestionWithCheckpointsEntity } from './interview-question.entity';

export type InterviewEntity = {
  id: number;
  companyId: number;
  createdByUserId: number | null;
  title: string;
  jobRole: string;
  professionId: number | null;
  level: QuestionLevel;
  interviewLanguage: string;
  questionCount: number;
  jobDescription: string | null;
  publicToken: string;
  status: InterviewStatus;
  isVideoEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InterviewWithQuestionsEntity = InterviewEntity & {
  questions: InterviewQuestionWithCheckpointsEntity[];
};
