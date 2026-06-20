import type { AppDispatch } from '@app/store';
import { finalEvaluationApi } from '@entities/evaluation/api/finalEvaluationApi';
import type { FinalEvaluationByAttemptQuery } from '@shared/api/graphql/generated/graphql';
import type { AttemptExportTableItem } from './attemptExport.types';

export async function fetchExportEvaluations(
  dispatch: AppDispatch,
  attempts: AttemptExportTableItem[],
): Promise<
  Map<string, FinalEvaluationByAttemptQuery['finalEvaluationByAttempt']>
> {
  const evaluations = new Map<
    string,
    FinalEvaluationByAttemptQuery['finalEvaluationByAttempt']
  >();

  await Promise.all(
    attempts.map(async (attempt) => {
      if (attempt.evaluationStatus !== 'ready') {
        evaluations.set(attempt.attemptId, null);
        return;
      }

      try {
        const evaluation = await dispatch(
          finalEvaluationApi.endpoints.finalEvaluationByAttempt.initiate(
            attempt.attemptId,
          ),
        ).unwrap();

        evaluations.set(attempt.attemptId, evaluation);
      } catch {
        evaluations.set(attempt.attemptId, null);
      }
    }),
  );

  return evaluations;
}
