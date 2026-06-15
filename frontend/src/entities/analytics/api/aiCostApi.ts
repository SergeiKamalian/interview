import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  AiCostAnalyticsQuery,
  AiCostAnalyticsQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export const aiCostApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiCostAnalytics: builder.query<
      AiCostAnalyticsQuery['aiCostAnalytics'],
      AiCostAnalyticsQueryVariables['filters'] | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.AiCostAnalytics,
        variables: { filters },
      }),
      transformResponse: (response: AiCostAnalyticsQuery) =>
        response.aiCostAnalytics,
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useAiCostAnalyticsQuery } = aiCostApi;
