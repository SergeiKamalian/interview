import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  ApplyPlaybookToInterviewDraftMutation,
  ApplyPlaybookToInterviewDraftMutationVariables,
  ArchiveCompanyQuestionPlaybookMutation,
  ArchiveCompanyQuestionPlaybookMutationVariables,
  CompanyQuestionPlaybooksQuery,
  CreateCompanyQuestionPlaybookInput,
  CreateCompanyQuestionPlaybookMutation,
  CreateCompanyQuestionPlaybookMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export type CompanyQuestionPlaybook =
  CompanyQuestionPlaybooksQuery['companyQuestionPlaybooks'][number];

export type ApplyPlaybookResult =
  ApplyPlaybookToInterviewDraftMutation['applyPlaybookToInterviewDraft'];

export const companyQuestionPlaybookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyQuestionPlaybooks: builder.query<CompanyQuestionPlaybook[], void>({
      query: () => ({
        ...GraphqlOperations.CompanyQuestionPlaybooks,
        variables: {},
      }),
      transformResponse: (response: CompanyQuestionPlaybooksQuery) =>
        response.companyQuestionPlaybooks,
      providesTags: ['QuestionBank'],
    }),
    createCompanyQuestionPlaybook: builder.mutation<
      CreateCompanyQuestionPlaybookMutation['createCompanyQuestionPlaybook'],
      CreateCompanyQuestionPlaybookInput
    >({
      query: (input) => ({
        ...GraphqlOperations.CreateCompanyQuestionPlaybook,
        variables: { input } satisfies CreateCompanyQuestionPlaybookMutationVariables,
      }),
      transformResponse: (response: CreateCompanyQuestionPlaybookMutation) =>
        response.createCompanyQuestionPlaybook,
      invalidatesTags: ['QuestionBank'],
    }),
    archiveCompanyQuestionPlaybook: builder.mutation<boolean, string>({
      query: (id) => ({
        ...GraphqlOperations.ArchiveCompanyQuestionPlaybook,
        variables: { id } satisfies ArchiveCompanyQuestionPlaybookMutationVariables,
      }),
      transformResponse: (response: ArchiveCompanyQuestionPlaybookMutation) =>
        response.archiveCompanyQuestionPlaybook,
      invalidatesTags: ['QuestionBank'],
    }),
    applyPlaybookToInterviewDraft: builder.mutation<
      ApplyPlaybookResult,
      ApplyPlaybookToInterviewDraftMutationVariables
    >({
      query: (variables) => ({
        ...GraphqlOperations.ApplyPlaybookToInterviewDraft,
        variables,
      }),
      transformResponse: (response: ApplyPlaybookToInterviewDraftMutation) =>
        response.applyPlaybookToInterviewDraft,
    }),
  }),
});

export const {
  useCompanyQuestionPlaybooksQuery,
  useCreateCompanyQuestionPlaybookMutation,
  useArchiveCompanyQuestionPlaybookMutation,
  useApplyPlaybookToInterviewDraftMutation,
} = companyQuestionPlaybookApi;
