import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  AdaptiveCheckpointReviewByAttemptQuery,
  AdaptiveCheckpointReviewByAttemptQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export const adaptiveCheckpointReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adaptiveCheckpointReviewByAttempt: builder.query<
      AdaptiveCheckpointReviewByAttemptQuery['adaptiveCheckpointReviewByAttempt'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.AdaptiveCheckpointReviewByAttempt,
        variables: {
          attemptId,
        } satisfies AdaptiveCheckpointReviewByAttemptQueryVariables,
      }),
      transformResponse: (response: AdaptiveCheckpointReviewByAttemptQuery) =>
        response.adaptiveCheckpointReviewByAttempt,
    }),
  }),
});

export const { useAdaptiveCheckpointReviewByAttemptQuery } =
  adaptiveCheckpointReviewApi;
