import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CompanyInterviewsQuery,
  CompanyInterviewsQueryVariables,
  InterviewDetailsQuery,
  InterviewDetailsQueryVariables,
} from '@shared/api/graphql/generated/graphql';
import type {
  CompanyInterviewsFilters,
  CompanyInterviewsResult,
} from '../model/interview.types';

export const interviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyInterviews: builder.query<
      CompanyInterviewsResult,
      CompanyInterviewsFilters | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.CompanyInterviews,
        variables: {
          filters: filters ?? undefined,
        } satisfies CompanyInterviewsQueryVariables,
      }),
      transformResponse: (response: CompanyInterviewsQuery) =>
        response.companyInterviews,
      providesTags: ['Interview'],
    }),
    interviewDetails: builder.query<
      InterviewDetailsQuery['interviewDetails'],
      string
    >({
      query: (interviewId) => ({
        ...GraphqlOperations.InterviewDetails,
        variables: { interviewId } satisfies InterviewDetailsQueryVariables,
      }),
      transformResponse: (response: InterviewDetailsQuery) =>
        response.interviewDetails,
      providesTags: (_result, _error, interviewId) => [
        { type: 'Interview', id: interviewId },
      ],
    }),
  }),
});

export const { useCompanyInterviewsQuery, useInterviewDetailsQuery } =
  interviewsApi;
