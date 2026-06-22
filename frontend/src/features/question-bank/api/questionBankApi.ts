import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  ArchiveQuestionMutation,
  ArchiveQuestionMutationVariables,
  CreateQuestionInput,
  CreateQuestionMutation,
  CreateQuestionMutationVariables,
  DraftInterviewFromJobDescriptionInput,
  DraftInterviewFromJobDescriptionMutation,
  DraftInterviewFromJobDescriptionMutationVariables,
  ProfessionsQuery,
  QuestionBankFilterInput,
  QuestionBankListQuery,
  QuestionBankQuery,
  QuestionQuery,
  SkillsQuery,
  SuggestInterviewQuestionsInput,
  SuggestInterviewQuestionsMutation,
  SuggestInterviewQuestionsMutationVariables,
  TopicsQuery,
  UpdateQuestionInput,
  UpdateQuestionMutation,
  UpdateQuestionMutationVariables,
} from '@shared/api/graphql/generated/graphql';
import type {
  QuestionBankListResult,
  QuestionDetail,
} from '@entities/question/model/types';

export type QuestionBankFilters = QuestionBankFilterInput;

export type Profession = ProfessionsQuery['professions'][number];
export type Skill = SkillsQuery['skills'][number];
export type Topic = TopicsQuery['topics'][number];

export type SkillsQueryArgs = { professionId?: string };
export type TopicsQueryArgs = { skillId?: string; professionId?: string };

export type SuggestQuestionsArgs = SuggestInterviewQuestionsInput;
export type SuggestedQuestions =
  SuggestInterviewQuestionsMutation['suggestInterviewQuestions'];

export type JobDescriptionDraftArgs = DraftInterviewFromJobDescriptionInput;
export type JobDescriptionDraft =
  DraftInterviewFromJobDescriptionMutation['draftInterviewFromJobDescription'];

/** Must stay in sync with backend `@Max` on `QuestionBankFilterInput.limit`. */
const QUESTION_BANK_LIST_LIMIT = 2000;

export const questionBankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    questionBank: builder.query<QuestionBankListResult, QuestionBankFilters | void>({
      query: (filters) => ({
        ...GraphqlOperations.QuestionBank,
        variables: { filters: filters ?? { limit: 50, offset: 0 } },
      }),
      transformResponse: (response: QuestionBankQuery) => response.questionBank,
      providesTags: ['QuestionBank'],
    }),
    questionBankList: builder.query<
      QuestionBankListResult,
      QuestionBankFilters | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.QuestionBankList,
        variables: {
          filters: {
            limit: QUESTION_BANK_LIST_LIMIT,
            offset: 0,
            ...filters,
          },
        },
      }),
      transformResponse: (response: QuestionBankListQuery) =>
        response.questionBank,
      providesTags: ['QuestionBank'],
    }),
    questionById: builder.query<QuestionDetail | null, string>({
      query: (id) => ({
        ...GraphqlOperations.Question,
        variables: { id },
      }),
      transformResponse: (response: QuestionQuery) => response.question ?? null,
      providesTags: (_result, _error, id) => [{ type: 'QuestionBank', id }],
    }),
    professions: builder.query<Profession[], void>({
      query: () => ({
        ...GraphqlOperations.Professions,
        variables: {},
      }),
      transformResponse: (response: ProfessionsQuery) => response.professions,
      providesTags: ['QuestionBank'],
    }),
    skills: builder.query<Skill[], SkillsQueryArgs | void>({
      query: (args) => ({
        ...GraphqlOperations.Skills,
        variables: { professionId: args?.professionId ?? null },
      }),
      transformResponse: (response: SkillsQuery) => response.skills,
      providesTags: ['QuestionBank'],
    }),
    topics: builder.query<Topic[], TopicsQueryArgs | void>({
      query: (args) => ({
        ...GraphqlOperations.Topics,
        variables: {
          skillId: args?.skillId ?? null,
          professionId: args?.professionId ?? null,
        },
      }),
      transformResponse: (response: TopicsQuery) => response.topics,
      providesTags: ['QuestionBank'],
    }),
    suggestInterviewQuestions: builder.mutation<
      SuggestedQuestions,
      SuggestQuestionsArgs
    >({
      query: (input) => ({
        ...GraphqlOperations.SuggestInterviewQuestions,
        variables: { input } satisfies SuggestInterviewQuestionsMutationVariables,
      }),
      transformResponse: (response: SuggestInterviewQuestionsMutation) =>
        response.suggestInterviewQuestions,
    }),
    draftInterviewFromJobDescription: builder.mutation<
      JobDescriptionDraft,
      JobDescriptionDraftArgs
    >({
      query: (input) => ({
        ...GraphqlOperations.DraftInterviewFromJobDescription,
        variables: {
          input,
        } satisfies DraftInterviewFromJobDescriptionMutationVariables,
      }),
      transformResponse: (response: DraftInterviewFromJobDescriptionMutation) =>
        response.draftInterviewFromJobDescription,
    }),
    createQuestion: builder.mutation<
      { id: string },
      CreateQuestionInput
    >({
      query: (input) => ({
        ...GraphqlOperations.CreateQuestion,
        variables: { input } satisfies CreateQuestionMutationVariables,
      }),
      transformResponse: (response: CreateQuestionMutation) =>
        response.createQuestion,
      invalidatesTags: ['QuestionBank'],
    }),
    updateQuestion: builder.mutation<
      { id: string },
      UpdateQuestionInput
    >({
      query: (input) => ({
        ...GraphqlOperations.UpdateQuestion,
        variables: { input } satisfies UpdateQuestionMutationVariables,
      }),
      transformResponse: (response: UpdateQuestionMutation) =>
        response.updateQuestion,
      invalidatesTags: (_result, _error, input) => [
        'QuestionBank',
        { type: 'QuestionBank', id: input.id },
      ],
    }),
    archiveQuestion: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        ...GraphqlOperations.ArchiveQuestion,
        variables: { id } satisfies ArchiveQuestionMutationVariables,
      }),
      transformResponse: (response: ArchiveQuestionMutation) =>
        response.archiveQuestion,
      invalidatesTags: ['QuestionBank'],
    }),
  }),
});

export const {
  useQuestionBankQuery,
  useQuestionBankListQuery,
  useQuestionByIdQuery,
  useProfessionsQuery,
  useSkillsQuery,
  useTopicsQuery,
  useSuggestInterviewQuestionsMutation,
  useDraftInterviewFromJobDescriptionMutation,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useArchiveQuestionMutation,
} = questionBankApi;
