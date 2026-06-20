import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CreateInterviewInput as GeneratedCreateInterviewInput,
  CreateInterviewMutation,
  CreateInterviewMutationVariables,
  PublishInterviewMutation,
  PublishInterviewMutationVariables,
} from '@shared/api/graphql/generated/graphql';

/** Full create input (all interview config fields), sourced from the schema. */
export type CreateInterviewInput = GeneratedCreateInterviewInput;

export type CreatedInterview = {
  id: string;
  title: string;
  jobRole: string;
  level: string;
  status: string;
  publicToken: string;
  publicUrl: string;
  questionCount: number;
};

export const interviewCreateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInterview: builder.mutation<CreatedInterview, CreateInterviewInput>({
      query: (input) => ({
        ...GraphqlOperations.CreateInterview,
        variables: { input } satisfies CreateInterviewMutationVariables,
      }),
      transformResponse: (response: CreateInterviewMutation) =>
        response.createInterview,
      invalidatesTags: ['Interview'],
    }),
    publishInterview: builder.mutation<
      { id: string; status: string; publicUrl: string; publicToken: string },
      string
    >({
      query: (id) => ({
        ...GraphqlOperations.PublishInterview,
        variables: { id } satisfies PublishInterviewMutationVariables,
      }),
      transformResponse: (response: PublishInterviewMutation) =>
        response.publishInterview,
      invalidatesTags: (_result, _error, id) => [
        'Interview',
        { type: 'Interview', id },
      ],
    }),
  }),
});

export const {
  useCreateInterviewMutation,
  usePublishInterviewMutation,
} = interviewCreateApi;
