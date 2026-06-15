import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  InterviewTranscriptQuery,
  InterviewTranscriptQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export const interviewTranscriptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    interviewTranscript: builder.query<
      InterviewTranscriptQuery['interviewTranscript'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.InterviewTranscript,
        variables: { attemptId } satisfies InterviewTranscriptQueryVariables,
      }),
      transformResponse: (response: InterviewTranscriptQuery) =>
        response.interviewTranscript,
    }),
  }),
});

export const { useInterviewTranscriptQuery } = interviewTranscriptApi;
