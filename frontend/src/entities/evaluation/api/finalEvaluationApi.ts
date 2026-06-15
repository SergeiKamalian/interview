import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  FinalEvaluationByAttemptQuery,
  FinalEvaluationByAttemptQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export const finalEvaluationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    finalEvaluationByAttempt: builder.query<
      FinalEvaluationByAttemptQuery['finalEvaluationByAttempt'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.FinalEvaluationByAttempt,
        variables: { attemptId } satisfies FinalEvaluationByAttemptQueryVariables,
      }),
      transformResponse: (response: FinalEvaluationByAttemptQuery) =>
        response.finalEvaluationByAttempt,
    }),
  }),
});

export const { useFinalEvaluationByAttemptQuery } = finalEvaluationApi;
