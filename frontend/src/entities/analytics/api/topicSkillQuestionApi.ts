import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  TopicSkillQuestionAnalyticsQuery,
  TopicSkillQuestionAnalyticsQueryVariables,
} from '@shared/api/graphql/generated/graphql';

export const topicSkillQuestionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    topicSkillQuestionAnalytics: builder.query<
      TopicSkillQuestionAnalyticsQuery['topicSkillQuestionAnalytics'],
      TopicSkillQuestionAnalyticsQueryVariables['filters'] | void
    >({
      query: (filters) => ({
        ...GraphqlOperations.TopicSkillQuestionAnalytics,
        variables: { filters },
      }),
      transformResponse: (response: TopicSkillQuestionAnalyticsQuery) =>
        response.topicSkillQuestionAnalytics,
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useTopicSkillQuestionAnalyticsQuery } = topicSkillQuestionApi;
