import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  QuestionBankFilterInput,
  QuestionBankListQuery,
  QuestionBankQuery,
  QuestionQuery,
} from '@shared/api/graphql/generated/graphql';
import type {
  QuestionBankListResult,
  QuestionDetail,
} from '@entities/question/model/types';

export type QuestionBankFilters = QuestionBankFilterInput;

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
    questionBankList: builder.query<QuestionBankListResult, void>({
      query: () => ({
        ...GraphqlOperations.QuestionBankList,
        variables: {
          filters: { limit: QUESTION_BANK_LIST_LIMIT, offset: 0 },
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
  }),
});

export const {
  useQuestionBankQuery,
  useQuestionBankListQuery,
  useQuestionByIdQuery,
} = questionBankApi;
