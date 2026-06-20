import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  ArchiveInterviewMutation,
  ArchiveInterviewMutationVariables,
  ManagedInterviewQuery,
  ManagedInterviewQueryVariables,
  PauseInterviewMutation,
  PauseInterviewMutationVariables,
  ResumeInterviewMutation,
  ResumeInterviewMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export type ManagedInterview = ManagedInterviewQuery['interview'];

export const interviewManageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    managedInterview: builder.query<ManagedInterview, string>({
      query: (id) => ({
        ...GraphqlOperations.ManagedInterview,
        variables: { id } satisfies ManagedInterviewQueryVariables,
      }),
      transformResponse: (response: ManagedInterviewQuery) =>
        response.interview,
      providesTags: (_result, _error, id) => [{ type: 'Interview', id }],
    }),
    pauseInterview: builder.mutation<
      PauseInterviewMutation['pauseInterview'],
      string
    >({
      query: (id) => ({
        ...GraphqlOperations.PauseInterview,
        variables: { id } satisfies PauseInterviewMutationVariables,
      }),
      transformResponse: (response: PauseInterviewMutation) =>
        response.pauseInterview,
      invalidatesTags: (_result, _error, id) => [
        'Interview',
        { type: 'Interview', id },
      ],
    }),
    resumeInterview: builder.mutation<
      ResumeInterviewMutation['resumeInterview'],
      string
    >({
      query: (id) => ({
        ...GraphqlOperations.ResumeInterview,
        variables: { id } satisfies ResumeInterviewMutationVariables,
      }),
      transformResponse: (response: ResumeInterviewMutation) =>
        response.resumeInterview,
      invalidatesTags: (_result, _error, id) => [
        'Interview',
        { type: 'Interview', id },
      ],
    }),
    archiveInterview: builder.mutation<
      ArchiveInterviewMutation['archiveInterview'],
      string
    >({
      query: (id) => ({
        ...GraphqlOperations.ArchiveInterview,
        variables: { id } satisfies ArchiveInterviewMutationVariables,
      }),
      transformResponse: (response: ArchiveInterviewMutation) =>
        response.archiveInterview,
      invalidatesTags: (_result, _error, id) => [
        'Interview',
        { type: 'Interview', id },
      ],
    }),
  }),
});

export const {
  useManagedInterviewQuery,
  usePauseInterviewMutation,
  useResumeInterviewMutation,
  useArchiveInterviewMutation,
} = interviewManageApi;
