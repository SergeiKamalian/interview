import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  QuestionBankFilterInput,
  QuestionBankQuery,
  QuestionBankQueryVariables,
} from '@shared/api/graphql/generated/graphql';
import type { QuestionBankListResult } from '@entities/question/model/types';

export type QuestionBankFilters = QuestionBankFilterInput;

export const questionBankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    questionBank: builder.query<QuestionBankListResult, QuestionBankFilters | void>({
      query: (filters) => ({
        ...GraphqlOperations.QuestionBank,
        variables: { filters: filters ?? { limit: 50, offset: 0 } } satisfies QuestionBankQueryVariables,
      }),
      transformResponse: (response: QuestionBankQuery) => response.questionBank,
      providesTags: ['QuestionBank'],
    }),
  }),
});

export const { useQuestionBankQuery } = questionBankApi;
