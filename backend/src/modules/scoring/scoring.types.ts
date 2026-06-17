import type {
  FinalEvaluationCategory,
  HireRecommendation,
} from '../ai-evaluation/types/evaluation.types';
import type { StrengthCategory } from './scoring.constants';

export type QuestionScoreInput = {
  interviewQuestionId: number;
  topicName: string | null;
  difficulty: string;
  level: string;
  score: number;
  maxScore: number;
  topicWeight?: number;
  needsManualReview: boolean;
};

export type TopicSessionEvaluation = {
  topic: string;
  score: number;
  weight: number;
  weightedScore: number;
  strengthCategory: StrengthCategory;
};

export type CategoryBreakdownItem = {
  categoryKey: string;
  categoryLabel: string;
  scoreNormalized: number;
  weight: number;
  contribution: number;
};

export type InterviewScoreResult = {
  finalScore: number;
  totalScoreNormalized: number;
  totalScoreOutOfTen: number;
  totalWeight: number;
  averageScore: number;
  strengthCategory: StrengthCategory;
  category: FinalEvaluationCategory;
  hireRecommendation: HireRecommendation;
  topics: TopicSessionEvaluation[];
  breakdown: CategoryBreakdownItem[];
  needsManualReview: boolean;
};
