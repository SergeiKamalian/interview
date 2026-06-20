import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  BeginInterviewAttemptMutation,
  BeginInterviewAttemptMutationVariables,
  CompleteInterviewAttemptMutation,
  CompleteInterviewAttemptMutationVariables,
  InterviewSessionQuery,
  InterviewSessionQueryVariables,
  PublicInterviewQuery,
  PublicInterviewQueryVariables,
  StartInterviewPreviewMutation,
  StartInterviewPreviewMutationVariables,
  StartPublicInterviewMutation,
  StartPublicInterviewMutationVariables,
  SubmitInterviewAnswerMutation,
  SubmitInterviewAnswerMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export const publicInterviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    publicInterview: builder.query<
      PublicInterviewQuery['publicInterview'],
      string
    >({
      query: (publicToken) => ({
        ...GraphqlOperations.PublicInterview,
        variables: { publicToken } satisfies PublicInterviewQueryVariables,
      }),
      transformResponse: (response: PublicInterviewQuery) =>
        response.publicInterview,
    }),
    startPublicInterview: builder.mutation<
      StartPublicInterviewMutation['startPublicInterview'],
      StartPublicInterviewMutationVariables['input']
    >({
      query: (input) => ({
        ...GraphqlOperations.StartPublicInterview,
        variables: { input },
      }),
      transformResponse: (response: StartPublicInterviewMutation) =>
        response.startPublicInterview,
    }),
    startInterviewPreview: builder.mutation<
      StartInterviewPreviewMutation['startInterviewPreview'],
      string
    >({
      query: (interviewId) => ({
        ...GraphqlOperations.StartInterviewPreview,
        variables: {
          interviewId,
        } satisfies StartInterviewPreviewMutationVariables,
      }),
      transformResponse: (response: StartInterviewPreviewMutation) =>
        response.startInterviewPreview,
    }),
    interviewSession: builder.query<
      InterviewSessionQuery['interviewSession'],
      { publicToken: string; attemptId: string }
    >({
      query: ({ publicToken, attemptId }) => ({
        ...GraphqlOperations.InterviewSession,
        variables: { publicToken, attemptId } satisfies InterviewSessionQueryVariables,
      }),
      transformResponse: (response: InterviewSessionQuery) =>
        response.interviewSession,
    }),
    beginInterviewAttempt: builder.mutation<
      BeginInterviewAttemptMutation['beginInterviewAttempt'],
      BeginInterviewAttemptMutationVariables['input']
    >({
      query: (input) => ({
        ...GraphqlOperations.BeginInterviewAttempt,
        variables: { input },
      }),
      transformResponse: (response: BeginInterviewAttemptMutation) =>
        response.beginInterviewAttempt,
    }),
    submitInterviewAnswer: builder.mutation<
      SubmitInterviewAnswerMutation['submitInterviewAnswer'],
      SubmitInterviewAnswerMutationVariables['input']
    >({
      query: (input) => ({
        ...GraphqlOperations.SubmitInterviewAnswer,
        variables: { input },
      }),
      transformResponse: (response: SubmitInterviewAnswerMutation) =>
        response.submitInterviewAnswer,
    }),
    completeInterviewAttempt: builder.mutation<
      CompleteInterviewAttemptMutation['completeInterviewAttempt'],
      CompleteInterviewAttemptMutationVariables
    >({
      query: ({ publicToken, attemptId }) => ({
        ...GraphqlOperations.CompleteInterviewAttempt,
        variables: { publicToken, attemptId },
      }),
      transformResponse: (response: CompleteInterviewAttemptMutation) =>
        response.completeInterviewAttempt,
    }),
  }),
});

export const {
  usePublicInterviewQuery,
  useStartPublicInterviewMutation,
  useStartInterviewPreviewMutation,
  useInterviewSessionQuery,
  useBeginInterviewAttemptMutation,
  useSubmitInterviewAnswerMutation,
  useCompleteInterviewAttemptMutation,
} = publicInterviewApi;
