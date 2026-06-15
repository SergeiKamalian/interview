import type {
  FinalEvaluationCategory,
  HireRecommendation,
} from '../types/evaluation.types';

export type FinalEvaluationEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  totalScore: number;
  category: FinalEvaluationCategory;
  hireRecommendation: HireRecommendation;
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
  summary: string;
  detailedSummary: string | null;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  rawResponse: Record<string, unknown>;
  needsManualReview: boolean;
};
