import type { CheckpointResultEntity } from './entities/checkpoint-result.entity';
import type { FinalEvaluationEntity } from './entities/final-evaluation.entity';
import type { QuestionEvaluationEntity } from './entities/question-evaluation.entity';
import type { CheckpointResultType } from './graphql/checkpoint-result.type';
import {
  FinalEvaluationCategoryEnum,
  HireRecommendationEnum,
  type CategoryBreakdownType,
  type FinalEvaluationType,
} from './graphql/final-evaluation.type';
import type { QuestionEvaluationType } from './graphql/question-evaluation.type';

export function mapQuestionEvaluationToGraphql(
  entity: QuestionEvaluationEntity,
  checkpointResults: CheckpointResultType[] = [],
): QuestionEvaluationType {
  return {
    id: String(entity.id),
    interviewAttemptId: String(entity.interviewAttemptId),
    interviewMessageId: String(entity.interviewMessageId),
    interviewQuestionId: String(entity.interviewQuestionId),
    score: entity.score,
    maxScore: entity.maxScore,
    shortSummary: entity.shortSummary,
    review: entity.review,
    needsManualReview: entity.needsManualReview,
    createdAt: entity.createdAt.getTime(),
    checkpointResults,
  };
}

export function mapCheckpointResultToGraphql(
  entity: CheckpointResultEntity,
): CheckpointResultType {
  return {
    id: String(entity.id),
    checkpointKey: entity.checkpointKey,
    matched: entity.matched,
    scoreAwarded: entity.scoreAwarded,
    evidenceQuote: entity.evidenceQuote,
  };
}

export function mapFinalEvaluationToGraphql(
  entity: FinalEvaluationEntity,
  deterministicScore?: unknown,
): FinalEvaluationType {
  const breakdown = extractBreakdown(deterministicScore);

  return {
    id: String(entity.id),
    interviewAttemptId: String(entity.interviewAttemptId),
    totalScore: entity.totalScore,
    category: entity.category as FinalEvaluationCategoryEnum,
    hireRecommendation: entity.hireRecommendation as HireRecommendationEnum,
    summary: entity.summary,
    detailedSummary: entity.detailedSummary,
    strengths: entity.strengths,
    weaknesses: entity.weaknesses,
    risks: entity.risks,
    needsManualReview: entity.needsManualReview,
    categoryBreakdown: breakdown,
  };
}

function extractBreakdown(
  deterministicScore: unknown,
): CategoryBreakdownType[] {
  if (!deterministicScore || typeof deterministicScore !== 'object') {
    return [];
  }

  const breakdown = (deterministicScore as { breakdown?: unknown }).breakdown;
  if (!Array.isArray(breakdown)) {
    return [];
  }

  return breakdown
    .filter((item): item is CategoryBreakdownType => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'categoryKey' in item &&
        'categoryLabel' in item
      );
    })
    .map((item) => ({
      categoryKey: String(item.categoryKey),
      categoryLabel: String(item.categoryLabel),
      scoreNormalized: Number(item.scoreNormalized),
      weight: Number(item.weight),
      contribution: Number(item.contribution),
    }));
}
