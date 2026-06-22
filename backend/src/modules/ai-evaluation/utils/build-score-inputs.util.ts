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

  const interviewQuestionIds = [...input.questionMetaById.keys()];

  if (useAdaptiveSummaries) {
    const summaryByQuestionId = new Map(
      adaptiveSummaries.map((summary) => [summary.interviewQuestionId, summary]),
    );
    const ids = [
      ...interviewQuestionIds,
      ...adaptiveSummaries
        .map((summary) => summary.interviewQuestionId)
        .filter((id) => !input.questionMetaById.has(id)),
    ];

    return ids.map((interviewQuestionId) => {
      const question = input.questionMetaById.get(interviewQuestionId);
      const summary = summaryByQuestionId.get(interviewQuestionId);

      return {
        interviewQuestionId,
        topicName: question?.topicName ?? null,
        difficulty: question?.difficulty ?? 'intermediate',
        level: question?.level ?? 'middle',
        score: summary?.score ?? 0,
        maxScore: summary?.maxScore ?? question?.maxScore ?? 0,
        topicWeight: question?.topicWeight,
        needsManualReview: summary?.needsManualReview ?? false,
      };
    });
  }

  const evaluationByQuestionId = new Map(
    questionEvaluations.map((evaluation) => [
      evaluation.interviewQuestionId,
      evaluation,
    ]),
  );
  const ids = [
    ...interviewQuestionIds,
    ...questionEvaluations
      .map((evaluation) => evaluation.interviewQuestionId)
      .filter((id) => !input.questionMetaById.has(id)),
  ];

  return ids.map((interviewQuestionId) => {
    const question = input.questionMetaById.get(interviewQuestionId);
    const evaluation = evaluationByQuestionId.get(interviewQuestionId);

    return {
      interviewQuestionId,
      topicName: question?.topicName ?? null,
      difficulty: question?.difficulty ?? 'intermediate',
      level: question?.level ?? 'middle',
      score: evaluation?.score ?? 0,
      maxScore: evaluation?.maxScore ?? question?.maxScore ?? 0,
      topicWeight: question?.topicWeight,
      needsManualReview: evaluation?.needsManualReview ?? false,
    };
  });
}
