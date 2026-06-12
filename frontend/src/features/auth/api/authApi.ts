import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  LoginMutationVariables,
  LogoutMutation,
  MeQuery,
  RefreshTokensMutation,
  RegisterMutationVariables,
} from '@shared/api/graphql/generated/graphql';
import type {
  AuthPayload,
  LoginInput,
  MePayload,
  RegisterInput,
} from '../model/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthPayload, LoginInput>({
      query: (input) => ({
        ...GraphqlOperations.Login,
        variables: { input } satisfies LoginMutationVariables,
      }),
      transformResponse: (response: { login: AuthPayload }) => response.login,
    }),
    register: builder.mutation<AuthPayload, RegisterInput>({
      query: (input) => ({
        ...GraphqlOperations.Register,
        variables: { input } satisfies RegisterMutationVariables,
      }),
      transformResponse: (response: { register: AuthPayload }) =>
        response.register,
    }),
    me: builder.query<MePayload, void>({
      query: () => GraphqlOperations.Me,
      transformResponse: (response: MeQuery) => response.me,
    }),
    refreshTokens: builder.mutation<{ accessToken: string; tokenType: string }, void>({
      query: () => ({
        ...GraphqlOperations.RefreshTokens,
        skipRefreshRetry: true,
      }),
      transformResponse: (response: RefreshTokensMutation) =>
        response.refreshTokens,
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        ...GraphqlOperations.Logout,
        skipRefreshRetry: true,
      }),
      transformResponse: (response: LogoutMutation) => response.logout,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLazyMeQuery,
  useRefreshTokensMutation,
  useLogoutMutation,
} = authApi;
