import type {
  FinalEvaluationCategory,
  HireRecommendation,
} from '../ai-evaluation/types/evaluation.types';

export type QuestionScoreInput = {
  interviewQuestionId: number;
  topicName: string | null;
  difficulty: string;
  level: string;
  score: number;
  maxScore: number;
  needsManualReview: boolean;
};

export type CategoryBreakdownItem = {
  categoryKey: string;
  categoryLabel: string;
  scoreNormalized: number;
  weight: number;
  contribution: number;
};

export type InterviewScoreResult = {
  totalScoreNormalized: number;
  totalScoreOutOfTen: number;
  category: FinalEvaluationCategory;
  hireRecommendation: HireRecommendation;
  breakdown: CategoryBreakdownItem[];
  needsManualReview: boolean;
};
