import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CreateInterviewMutation,
  CreateInterviewMutationVariables,
  PublishInterviewMutation,
  PublishInterviewMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export type CreateInterviewInput = {
  title: string;
  jobRole: string;
  level: 'junior' | 'middle' | 'senior' | 'lead';
  interviewLanguage?: string;
  jobDescription?: string;
  questionIds: string[];
};

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
      invalidatesTags: ['Interview'],
    }),
  }),
});

export const {
  useCreateInterviewMutation,
  usePublishInterviewMutation,
} = interviewCreateApi;
