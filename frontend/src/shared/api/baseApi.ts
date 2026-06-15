import { createApi } from '@reduxjs/toolkit/query/react';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type { HelloQuery } from '@shared/api/graphql/generated/graphql';
import { graphqlBaseQuery } from './graphqlBaseQuery';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: graphqlBaseQuery,
  tagTypes: ['Health', 'QuestionBank', 'Interview', 'Candidate', 'Analytics'],
  endpoints: (builder) => ({
    getHello: builder.query<{ hello: string }, void>({
      query: () => GraphqlOperations.Hello,
      transformResponse: (response: HelloQuery) => ({ hello: response.hello }),
      providesTags: ['Health'],
    }),
  }),
});

export const { useGetHelloQuery } = baseApi;
