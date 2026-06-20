import type { QuestionLevel } from '../../question-bank/types/question-level.enum';
import type { InterviewStatus } from '../types/interview-status.enum';
import type {
  AiTone,
  ProbingDepth,
  ScoringStrictness,
} from '../types/interview-config.enum';
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
  interviewerName: string | null;
  welcomeMessageTemplate: string | null;
  aiTone: AiTone;
  probingDepth: ProbingDepth;
  scoringStrictness: ScoringStrictness;
  expiresAt: Date | null;
  maxCompletions: number | null;
  allowRetake: boolean;
  timeLimitMinutes: number | null;
  passingScore: number | null;
  requirePhone: boolean;
  requireLinkedin: boolean;
  requireGithub: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InterviewWithQuestionsEntity = InterviewEntity & {
  questions: InterviewQuestionWithCheckpointsEntity[];
};
