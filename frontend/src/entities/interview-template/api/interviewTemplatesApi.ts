import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CompanyInterviewTemplatesFilterInput,
  CompanyInterviewTemplatesQuery,
  CompanyInterviewTemplatesQueryVariables,
  CreateInterviewFromTemplateMutation,
  CreateInterviewFromTemplateMutationVariables,
  CreateInterviewTemplateFromInterviewMutation,
  CreateInterviewTemplateFromInterviewMutationVariables,
  CreateInterviewTemplateInput,
  CreateInterviewTemplateMutation,
  CreateInterviewTemplateMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export type InterviewTemplate =
  CompanyInterviewTemplatesQuery['companyInterviewTemplates']['items'][number];

export type InterviewTemplatesResult =
  CompanyInterviewTemplatesQuery['companyInterviewTemplates'];

export type CreatedInterviewFromTemplate =
  CreateInterviewFromTemplateMutation['createInterviewFromTemplate'];

export const interviewTemplatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyInterviewTemplates: builder.query<
      InterviewTemplatesResult,
      CompanyInterviewTemplatesFilterInput | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.CompanyInterviewTemplates,
        variables: {
          filters: filters ?? undefined,
        } satisfies CompanyInterviewTemplatesQueryVariables,
      }),
      transformResponse: (response: CompanyInterviewTemplatesQuery) =>
        response.companyInterviewTemplates,
      providesTags: ['InterviewTemplate'],
    }),
    createInterviewTemplate: builder.mutation<
      InterviewTemplate,
      CreateInterviewTemplateInput
    >({
      query: (input) => ({
        ...GraphqlOperations.CreateInterviewTemplate,
        variables: { input } satisfies CreateInterviewTemplateMutationVariables,
      }),
      transformResponse: (response: CreateInterviewTemplateMutation) =>
        response.createInterviewTemplate,
      invalidatesTags: ['InterviewTemplate'],
    }),
    createInterviewFromTemplate: builder.mutation<
      CreatedInterviewFromTemplate,
      string
    >({
      query: (templateId) => ({
        ...GraphqlOperations.CreateInterviewFromTemplate,
        variables: {
          templateId,
        } satisfies CreateInterviewFromTemplateMutationVariables,
      }),
      transformResponse: (response: CreateInterviewFromTemplateMutation) =>
        response.createInterviewFromTemplate,
      invalidatesTags: ['Interview'],
    }),
    createInterviewTemplateFromInterview: builder.mutation<
      InterviewTemplate,
      { interviewId: string; title?: string }
    >({
      query: ({ interviewId, title }) => ({
        ...GraphqlOperations.CreateInterviewTemplateFromInterview,
        variables: {
          interviewId,
          title: title?.trim() || undefined,
        } satisfies CreateInterviewTemplateFromInterviewMutationVariables,
      }),
      transformResponse: (
        response: CreateInterviewTemplateFromInterviewMutation,
      ) => response.createInterviewTemplateFromInterview,
      invalidatesTags: ['InterviewTemplate'],
    }),
  }),
});

export const {
  useCompanyInterviewTemplatesQuery,
  useCreateInterviewTemplateMutation,
  useCreateInterviewFromTemplateMutation,
  useCreateInterviewTemplateFromInterviewMutation,
} = interviewTemplatesApi;
