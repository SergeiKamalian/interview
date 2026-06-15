import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CheckpointResultsByAttemptQuery,
  CheckpointResultsByAttemptQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export const checkpointResultsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkpointResultsByAttempt: builder.query<
      CheckpointResultsByAttemptQuery['checkpointResultsByAttempt'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.CheckpointResultsByAttempt,
        variables: { attemptId } satisfies CheckpointResultsByAttemptQueryVariables,
      }),
      transformResponse: (response: CheckpointResultsByAttemptQuery) =>
        response.checkpointResultsByAttempt,
    }),
  }),
});

export const { useCheckpointResultsByAttemptQuery } = checkpointResultsApi;
