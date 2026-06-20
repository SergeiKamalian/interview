import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  AttemptReviewDecisionHistoryQuery,
  AttemptReviewNotesQuery,
  CreateAttemptReviewNoteMutation,
  MarkAttemptReviewStartedMutation,
  SetAttemptAiVerdictMutation,
  SetAttemptCompanyDecisionMutation,
  UpdateAttemptReviewNoteMutation,
} from '@shared/api/graphql/generated/graphql';

export const attemptReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    attemptReviewDecisionHistory: builder.query<
      AttemptReviewDecisionHistoryQuery['attemptReviewDecisionHistory'],
      { attemptId: string; page?: number; pageSize?: number }
    >({
      query: ({ attemptId, page = 1, pageSize = 20 }) => ({
        ...GraphqlOperations.AttemptReviewDecisionHistory,
        variables: {
          attemptId,
          filters: { page, pageSize },
        },
      }),
      transformResponse: (response: AttemptReviewDecisionHistoryQuery) =>
        response.attemptReviewDecisionHistory,
      providesTags: (_result, _error, { attemptId }) => [
        { type: 'Interview', id: `${attemptId}-decision-history` },
      ],
    }),
    attemptReviewNotes: builder.query<
      AttemptReviewNotesQuery['attemptReviewNotes'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.AttemptReviewNotes,
        variables: { attemptId },
      }),
      transformResponse: (response: AttemptReviewNotesQuery) =>
        response.attemptReviewNotes,
      providesTags: (_result, _error, attemptId) => [
        { type: 'Interview', id: `notes-${attemptId}` },
      ],
    }),
    createAttemptReviewNote: builder.mutation<
      CreateAttemptReviewNoteMutation['createAttemptReviewNote'],
      { attemptId: string; body: string }
    >({
      query: ({ attemptId, body }) => ({
        ...GraphqlOperations.CreateAttemptReviewNote,
        variables: { input: { attemptId, body } },
      }),
      transformResponse: (response: CreateAttemptReviewNoteMutation) =>
        response.createAttemptReviewNote,
      invalidatesTags: (_result, _error, { attemptId }) => [
        { type: 'Interview', id: `notes-${attemptId}` },
        'Interview',
      ],
    }),
    updateAttemptReviewNote: builder.mutation<
      UpdateAttemptReviewNoteMutation['updateAttemptReviewNote'],
      { noteId: string; body: string }
    >({
      query: ({ noteId, body }) => ({
        ...GraphqlOperations.UpdateAttemptReviewNote,
        variables: { input: { noteId, body } },
      }),
      transformResponse: (response: UpdateAttemptReviewNoteMutation) =>
        response.updateAttemptReviewNote,
      invalidatesTags: (result) => [
        { type: 'Interview', id: `notes-${result?.attemptId ?? 'unknown'}` },
        'Interview',
      ],
    }),
    markAttemptReviewStarted: builder.mutation<
      MarkAttemptReviewStartedMutation['markAttemptReviewStarted'],
      string
    >({
      query: (attemptId) => ({
        ...GraphqlOperations.MarkAttemptReviewStarted,
        variables: { attemptId },
      }),
      transformResponse: (response: MarkAttemptReviewStartedMutation) =>
        response.markAttemptReviewStarted,
      invalidatesTags: (_result, _error, attemptId) => [
        'Interview',
        { type: 'Interview', id: attemptId },
        { type: 'Interview', id: `${attemptId}-decision-history` },
      ],
    }),
    setAttemptAiVerdict: builder.mutation<
      SetAttemptAiVerdictMutation['setAttemptAiVerdict'],
      { attemptId: string; verdict: 'agree' | 'disagree'; reason?: string }
    >({
      query: ({ attemptId, verdict, reason }) => ({
        ...GraphqlOperations.SetAttemptAiVerdict,
        variables: {
          input: { attemptId, verdict, reason: reason ?? null },
        },
      }),
      transformResponse: (response: SetAttemptAiVerdictMutation) =>
        response.setAttemptAiVerdict,
      invalidatesTags: (_result, _error, { attemptId }) => [
        'Interview',
        { type: 'Interview', id: attemptId },
        { type: 'Interview', id: `${attemptId}-decision-history` },
      ],
    }),
    setAttemptCompanyDecision: builder.mutation<
      SetAttemptCompanyDecisionMutation['setAttemptCompanyDecision'],
      {
        attemptId: string;
        decision: 'shortlist' | 'reject' | 'invite_live' | 'hold';
        reason?: string;
      }
    >({
      query: ({ attemptId, decision, reason }) => ({
        ...GraphqlOperations.SetAttemptCompanyDecision,
        variables: {
          input: { attemptId, decision, reason: reason ?? null },
        },
      }),
      transformResponse: (response: SetAttemptCompanyDecisionMutation) =>
        response.setAttemptCompanyDecision,
      invalidatesTags: (_result, _error, { attemptId }) => [
        'Interview',
        { type: 'Interview', id: attemptId },
        { type: 'Interview', id: `${attemptId}-decision-history` },
      ],
    }),
  }),
});

export const {
  useAttemptReviewDecisionHistoryQuery,
  useAttemptReviewNotesQuery,
  useCreateAttemptReviewNoteMutation,
  useUpdateAttemptReviewNoteMutation,
  useMarkAttemptReviewStartedMutation,
  useSetAttemptAiVerdictMutation,
  useSetAttemptCompanyDecisionMutation,
} = attemptReviewApi;
