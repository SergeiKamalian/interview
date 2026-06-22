import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  ArchiveCompanySkillMutation,
  ArchiveCompanySkillMutationVariables,
  ArchiveCompanyTopicMutation,
  ArchiveCompanyTopicMutationVariables,
  CompanyQuestionOverrideQuery,
  CompanyQuestionOverrideQueryVariables,
  CreateCompanySkillInput,
  CreateCompanySkillMutation,
  CreateCompanySkillMutationVariables,
  CreateCompanyTopicInput,
  CreateCompanyTopicMutation,
  CreateCompanyTopicMutationVariables,
  ForkQuestionMutation,
  ForkQuestionMutationVariables,
  UpdateCompanySkillInput,
  UpdateCompanySkillMutation,
  UpdateCompanySkillMutationVariables,
  UpdateCompanyTopicInput,
  UpdateCompanyTopicMutation,
  UpdateCompanyTopicMutationVariables,
  UpsertCompanyQuestionOverrideInput,
  UpsertCompanyQuestionOverrideMutation,
  UpsertCompanyQuestionOverrideMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export type CompanyQuestionOverride =
  CompanyQuestionOverrideQuery['companyQuestionOverride'];

export const companyQuestionBankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    forkQuestion: builder.mutation<
      ForkQuestionMutation['forkQuestion'],
      string
    >({
      query: (sourceQuestionId) => ({
        ...GraphqlOperations.ForkQuestion,
        variables: {
          sourceQuestionId,
        } satisfies ForkQuestionMutationVariables,
      }),
      transformResponse: (response: ForkQuestionMutation) =>
        response.forkQuestion,
      invalidatesTags: ['QuestionBank'],
    }),
    companyQuestionOverride: builder.query<
      CompanyQuestionOverride,
      string
    >({
      query: (sourceQuestionId) => ({
        ...GraphqlOperations.CompanyQuestionOverride,
        variables: {
          sourceQuestionId,
        } satisfies CompanyQuestionOverrideQueryVariables,
      }),
      transformResponse: (response: CompanyQuestionOverrideQuery) =>
        response.companyQuestionOverride ?? null,
      providesTags: (_result, _error, sourceQuestionId) => [
        { type: 'QuestionBank', id: `override-${sourceQuestionId}` },
      ],
    }),
    upsertCompanyQuestionOverride: builder.mutation<
      UpsertCompanyQuestionOverrideMutation['upsertCompanyQuestionOverride'],
      UpsertCompanyQuestionOverrideInput
    >({
      query: (input) => ({
        ...GraphqlOperations.UpsertCompanyQuestionOverride,
        variables: { input } satisfies UpsertCompanyQuestionOverrideMutationVariables,
      }),
      transformResponse: (response: UpsertCompanyQuestionOverrideMutation) =>
        response.upsertCompanyQuestionOverride,
      invalidatesTags: (_result, _error, input) => [
        'QuestionBank',
        { type: 'QuestionBank', id: `override-${input.sourceQuestionId}` },
      ],
    }),
    createCompanySkill: builder.mutation<
      CreateCompanySkillMutation['createCompanySkill'],
      CreateCompanySkillInput
    >({
      query: (input) => ({
        ...GraphqlOperations.CreateCompanySkill,
        variables: { input } satisfies CreateCompanySkillMutationVariables,
      }),
      transformResponse: (response: CreateCompanySkillMutation) =>
        response.createCompanySkill,
      invalidatesTags: ['QuestionBank'],
    }),
    updateCompanySkill: builder.mutation<
      UpdateCompanySkillMutation['updateCompanySkill'],
      UpdateCompanySkillInput
    >({
      query: (input) => ({
        ...GraphqlOperations.UpdateCompanySkill,
        variables: { input } satisfies UpdateCompanySkillMutationVariables,
      }),
      transformResponse: (response: UpdateCompanySkillMutation) =>
        response.updateCompanySkill,
      invalidatesTags: ['QuestionBank'],
    }),
    archiveCompanySkill: builder.mutation<
      ArchiveCompanySkillMutation['archiveCompanySkill'],
      string
    >({
      query: (id) => ({
        ...GraphqlOperations.ArchiveCompanySkill,
        variables: { id } satisfies ArchiveCompanySkillMutationVariables,
      }),
      transformResponse: (response: ArchiveCompanySkillMutation) =>
        response.archiveCompanySkill,
      invalidatesTags: ['QuestionBank'],
    }),
    createCompanyTopic: builder.mutation<
      CreateCompanyTopicMutation['createCompanyTopic'],
      CreateCompanyTopicInput
    >({
      query: (input) => ({
        ...GraphqlOperations.CreateCompanyTopic,
        variables: { input } satisfies CreateCompanyTopicMutationVariables,
      }),
      transformResponse: (response: CreateCompanyTopicMutation) =>
        response.createCompanyTopic,
      invalidatesTags: ['QuestionBank'],
    }),
    updateCompanyTopic: builder.mutation<
      UpdateCompanyTopicMutation['updateCompanyTopic'],
      UpdateCompanyTopicInput
    >({
      query: (input) => ({
        ...GraphqlOperations.UpdateCompanyTopic,
        variables: { input } satisfies UpdateCompanyTopicMutationVariables,
      }),
      transformResponse: (response: UpdateCompanyTopicMutation) =>
        response.updateCompanyTopic,
      invalidatesTags: ['QuestionBank'],
    }),
    archiveCompanyTopic: builder.mutation<
      ArchiveCompanyTopicMutation['archiveCompanyTopic'],
      string
    >({
      query: (id) => ({
        ...GraphqlOperations.ArchiveCompanyTopic,
        variables: { id } satisfies ArchiveCompanyTopicMutationVariables,
      }),
      transformResponse: (response: ArchiveCompanyTopicMutation) =>
        response.archiveCompanyTopic,
      invalidatesTags: ['QuestionBank'],
    }),
  }),
});

export const {
  useForkQuestionMutation,
  useCompanyQuestionOverrideQuery,
  useUpsertCompanyQuestionOverrideMutation,
  useCreateCompanySkillMutation,
  useUpdateCompanySkillMutation,
  useArchiveCompanySkillMutation,
  useCreateCompanyTopicMutation,
  useUpdateCompanyTopicMutation,
  useArchiveCompanyTopicMutation,
} = companyQuestionBankApi;
