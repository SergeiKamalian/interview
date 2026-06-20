import type { InterviewQuestionSummaryEntity } from '../../adaptive-interview/entities/interview-question-summary.entity';
import type { InterviewQuestionEntity } from '../../interview-core/entities/interview-question.entity';
import type { QuestionScoreInput } from '../../scoring/scoring.types';
import type { QuestionEvaluationEntity } from '../entities/question-evaluation.entity';

/**
 * Builds the per-question `scoreInputs` (each carries the question's own `level`,
 * `maxScore`, etc.) from either adaptive summaries or legacy question evaluations.
 *
 * This is the single source of the mapping shared by:
 *  - the live final evaluation (FinalEvaluationService.evaluateAndPersistFinalEvaluation)
 *  - the deterministic achieved_level backfill (FinalEvaluationService.collectScoreInputs)
 *
 * It is intentionally pure (no DB / LLM): callers fetch the data and pass it in,
 * so both paths produce identical inputs without duplicating the mapping.
 */
export function buildScoreInputs(input: {
  useAdaptiveSummaries: boolean;
  adaptiveSummaries: InterviewQuestionSummaryEntity[];
  questionEvaluations: QuestionEvaluationEntity[];
  questionMetaById: Map<number, InterviewQuestionEntity>;
}): QuestionScoreInput[] {
  const { useAdaptiveSummaries, adaptiveSummaries, questionEvaluations } =
    input;

  if (useAdaptiveSummaries) {
    return adaptiveSummaries.map((summary) => {
      const question = input.questionMetaById.get(summary.interviewQuestionId);
      return {
        interviewQuestionId: summary.interviewQuestionId,
        topicName: question?.topicName ?? null,
        difficulty: question?.difficulty ?? 'intermediate',
        level: question?.level ?? 'middle',
        score: summary.score,
        maxScore: summary.maxScore,
        topicWeight: question?.topicWeight,
        needsManualReview: summary.needsManualReview,
      };
    });
  }

  return questionEvaluations.map((evaluation) => {
    const question = input.questionMetaById.get(evaluation.interviewQuestionId);
    return {
      interviewQuestionId: evaluation.interviewQuestionId,
      topicName: question?.topicName ?? null,
      difficulty: question?.difficulty ?? 'intermediate',
      level: question?.level ?? 'middle',
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      topicWeight: question?.topicWeight,
      needsManualReview: evaluation.needsManualReview,
    };
  });
}
