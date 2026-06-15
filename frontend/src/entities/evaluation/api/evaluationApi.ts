import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  EvaluateInterviewAttemptMutation,
  EvaluateInterviewAttemptMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export const evaluationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    evaluateInterviewAttempt: builder.mutation<
      EvaluateInterviewAttemptMutation['evaluateInterviewAttempt'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.EvaluateInterviewAttempt,
        variables: { attemptId } satisfies EvaluateInterviewAttemptMutationVariables,
      }),
      transformResponse: (response: EvaluateInterviewAttemptMutation) =>
        response.evaluateInterviewAttempt,
      invalidatesTags: ['Interview', 'Candidate'],
    }),
  }),
});

export const { useEvaluateInterviewAttemptMutation } = evaluationApi;
