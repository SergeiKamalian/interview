import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  MatchingCandidatesForLevelQuery,
  MatchingCandidatesForLevelQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export type MatchingCandidatesArgs = MatchingCandidatesForLevelQueryVariables;

export const talentPoolApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    matchingCandidatesForLevel: builder.query<
      MatchingCandidatesForLevelQuery['matchingCandidatesForLevel'],
      MatchingCandidatesArgs
    >({
      query: ({ level, professionId, skillIds }) => ({
        ...GraphqlOperations.MatchingCandidatesForLevel,
        variables: {
          level,
          professionId,
          skillIds,
        } satisfies MatchingCandidatesForLevelQueryVariables,
      }),
      transformResponse: (response: MatchingCandidatesForLevelQuery) =>
        response.matchingCandidatesForLevel,
      providesTags: ['Candidate'],
    }),
  }),
});

export const { useMatchingCandidatesForLevelQuery } = talentPoolApi;
