import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CandidateReportQuery,
  CandidateReportQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export const candidateReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    candidateReport: builder.query<
      CandidateReportQuery['candidateReport'],
      string
    >({
      query: (candidateId) => ({
        ...GraphqlOperations.CandidateReport,
        variables: { candidateId } satisfies CandidateReportQueryVariables,
      }),
      transformResponse: (response: CandidateReportQuery) =>
        response.candidateReport,
      providesTags: (_result, _error, candidateId) => [
        { type: 'Candidate', id: candidateId },
      ],
    }),
  }),
});

export const { useCandidateReportQuery } = candidateReportApi;
