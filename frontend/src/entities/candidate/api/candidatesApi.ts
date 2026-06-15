import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CompanyCandidatesQuery,
  CompanyCandidatesQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export type CompanyCandidatesFilters = {
  search?: string;
  skillCode?: string;
  topicCode?: string;
  minScore?: number;
  maxScore?: number;
  shortlistedOnly?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
  sortDirection?: string;
};

export const candidatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyCandidates: builder.query<
      CompanyCandidatesQuery['companyCandidates'],
      CompanyCandidatesFilters | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.CompanyCandidates,
        variables: {
          filters: filters ?? undefined,
        } satisfies CompanyCandidatesQueryVariables,
      }),
      transformResponse: (response: CompanyCandidatesQuery) =>
        response.companyCandidates,
      providesTags: ['Candidate'],
    }),
  }),
});

export const { useCompanyCandidatesQuery } = candidatesApi;
