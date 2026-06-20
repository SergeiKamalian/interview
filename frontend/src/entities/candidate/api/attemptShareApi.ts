import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  AttemptShareLinkQuery,
  CreateAttemptShareLinkMutation,
  RevokeAttemptShareLinkMutation,
} from '@shared/api/graphql/generated/graphql';

export const attemptShareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    attemptShareLink: builder.query<
      AttemptShareLinkQuery['attemptShareLink'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.AttemptShareLink,
        variables: { attemptId },
      }),
      transformResponse: (response: AttemptShareLinkQuery) =>
        response.attemptShareLink,
      providesTags: (_result, _error, attemptId) => [
        { type: 'Interview', id: `share-${attemptId}` },
      ],
    }),
    createAttemptShareLink: builder.mutation<
      CreateAttemptShareLinkMutation['createAttemptShareLink'],
      { attemptId: string; expiresInDays?: number | null }
    >({
      query: ({ attemptId, expiresInDays }) => ({
        ...GraphqlOperations.CreateAttemptShareLink,
        variables: {
          input: { attemptId, expiresInDays: expiresInDays ?? null },
        },
      }),
      transformResponse: (response: CreateAttemptShareLinkMutation) =>
        response.createAttemptShareLink,
      invalidatesTags: (_result, _error, { attemptId }) => [
        { type: 'Interview', id: `share-${attemptId}` },
      ],
    }),
    revokeAttemptShareLink: builder.mutation<boolean, string>({
      query: (attemptId) => ({
        ...GraphqlOperations.RevokeAttemptShareLink,
        variables: { attemptId },
      }),
      transformResponse: (response: RevokeAttemptShareLinkMutation) =>
        response.revokeAttemptShareLink,
      invalidatesTags: (_result, _error, attemptId) => [
        { type: 'Interview', id: `share-${attemptId}` },
      ],
    }),
  }),
});

export const {
  useAttemptShareLinkQuery,
  useCreateAttemptShareLinkMutation,
  useRevokeAttemptShareLinkMutation,
} = attemptShareApi;
