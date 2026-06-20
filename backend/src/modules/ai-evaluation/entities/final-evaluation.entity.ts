import type { QuestionLevel } from '../../question-bank/types/question-level.enum';
import type {
  FinalEvaluationCategory,
  HireRecommendation,
} from '../types/evaluation.types';

export type AchievedLevelMethod = 'evidence' | 'estimate';

export type FinalEvaluationEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  totalScore: number;
  category: FinalEvaluationCategory;
  hireRecommendation: HireRecommendation;
  achievedLevel: QuestionLevel | null;
  achievedLevelMethod: AchievedLevelMethod | null;
  summary: string;
  detailedSummary: string | null;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  rawResponse: Record<string, unknown> | null;
  needsManualReview: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertFinalEvaluationData = {
  companyId: number;
  interviewAttemptId: number;
  totalScore: number;
  category: FinalEvaluationCategory;
  hireRecommendation: HireRecommendation;
  achievedLevel: QuestionLevel | null;
  achievedLevelMethod: AchievedLevelMethod | null;
  summary: string;
  detailedSummary: string | null;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  rawResponse: Record<string, unknown>;
  needsManualReview: boolean;
};
