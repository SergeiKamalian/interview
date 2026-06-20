import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CompanyReviewQueueQuery,
  CompanyReviewQueueQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export type CompanyReviewQueueFilters = {
  search?: string;
  evaluationStatus?: string;
  shortlistedOnly?: boolean;
  manualReviewOnly?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
  sortDirection?: string;
};

export const reviewQueueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyReviewQueue: builder.query<
      CompanyReviewQueueQuery['companyReviewQueue'],
      CompanyReviewQueueFilters | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.CompanyReviewQueue,
        variables: {
          filters: filters ?? undefined,
        } satisfies CompanyReviewQueueQueryVariables,
      }),
      transformResponse: (response: CompanyReviewQueueQuery) =>
        response.companyReviewQueue,
      providesTags: ['Candidate'],
    }),
  }),
});

export const { useCompanyReviewQueueQuery } = reviewQueueApi;
