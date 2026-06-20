import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CompanyInterviewSummariesQuery,
  CompanyInterviewSummariesQueryVariables,
  CompanyInterviewsQuery,
  CompanyInterviewsQueryVariables,
  CompareInterviewCandidatesMutation,
  CompareInterviewCandidatesMutationVariables,
  InterviewAttemptsPageQuery,
  InterviewAttemptsPageQueryVariables,
  InterviewDetailsQuery,
  InterviewDetailsQueryVariables,
} from '@shared/api/graphql/generated/graphql';
import type {
  CompanyInterviewSummariesFilters,
  CompanyInterviewSummariesResult,
  CompanyInterviewsFilters,
  CompanyInterviewsResult,
  InterviewAttemptsPageFilters,
  InterviewAttemptsPageResult,
} from '../model/interview.types';

export const interviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyInterviewSummaries: builder.query<
      CompanyInterviewSummariesResult,
      CompanyInterviewSummariesFilters | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.CompanyInterviewSummaries,
        variables: {
          filters: filters ?? undefined,
        } satisfies CompanyInterviewSummariesQueryVariables,
      }),
      transformResponse: (response: CompanyInterviewSummariesQuery) =>
        response.companyInterviewSummaries,
      providesTags: ['Interview'],
    }),
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
    compareInterviewCandidates: builder.mutation<
      CompareInterviewCandidatesMutation['compareInterviewCandidates'],
      CompareInterviewCandidatesMutationVariables['input']
    >({
      query: (input) => ({
        ...GraphqlOperations.CompareInterviewCandidates,
        variables: { input } satisfies CompareInterviewCandidatesMutationVariables,
      }),
      transformResponse: (response: CompareInterviewCandidatesMutation) =>
        response.compareInterviewCandidates,
    }),
    interviewAttemptsPage: builder.query<
      InterviewAttemptsPageResult,
      { interviewId: string; filters?: InterviewAttemptsPageFilters }
    >({
      query: ({ interviewId, filters }) => ({
        ...GraphqlOperations.InterviewAttemptsPage,
        variables: {
          interviewId,
          filters,
        } satisfies InterviewAttemptsPageQueryVariables,
      }),
      transformResponse: (response: InterviewAttemptsPageQuery) =>
        response.interviewAttemptsPage,
      providesTags: (_result, _error, { interviewId }) => [
        { type: 'Interview', id: `${interviewId}-attempts-page` },
      ],
    }),
  }),
});

export const {
  useCompareInterviewCandidatesMutation,
  useCompanyInterviewSummariesQuery,
  useCompanyInterviewsQuery,
  useInterviewAttemptsPageQuery,
  useInterviewDetailsQuery,
} = interviewsApi;
