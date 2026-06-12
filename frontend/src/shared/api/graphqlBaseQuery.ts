import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { logout } from '@features/auth/model/authSlice';
import type { GraphqlOperationDef } from '@shared/api/graphql/operations.registry';
import { executePersistedGraphqlRequest } from '@shared/api/graphql/persisted-request';
import { refreshAccessToken } from '@shared/lib/refresh-access-token';
import { tokenStorage } from '@shared/lib/token-storage';
import { env } from '@shared/config/env';

export type GraphqlBaseQueryArgs = GraphqlOperationDef & {
  variables?: Record<string, unknown>;
  skipRefreshRetry?: boolean;
};

type GraphqlError = {
  message: string;
  extensions?: {
    code?: string;
  };
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: GraphqlError[];
};

type GraphqlRequestError = {
  message: string;
  status?: number;
  codes: string[];
};

function isAuthFailure(error: GraphqlRequestError): boolean {
  if (
    error.codes.some((code) =>
      [
        'UNAUTHENTICATED',
        'ACCESS_TOKEN_EXPIRED',
        'ACCESS_TOKEN_INVALID',
      ].includes(code),
    )
  ) {
    return true;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('unauthorized') ||
    message.includes('expired') ||
    message.includes('invalid access token')
  );
}

function shouldAttemptRefresh(error: GraphqlRequestError): boolean {
  const message = error.message.toLowerCase();
  return (
    error.codes.includes('ACCESS_TOKEN_EXPIRED') ||
    message.includes('access token expired') ||
    message.includes('expired access token')
  );
}

async function executeGraphqlRequest(
  args: GraphqlBaseQueryArgs,
  accessToken: string | null,
): Promise<
  { data: unknown } | { error: GraphqlRequestError }
> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await executePersistedGraphqlRequest({
    url: env.graphqlUrl,
    operation: args,
    variables: args.variables,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    return {
      error: {
        message: `GraphQL HTTP error: ${response.status}`,
        status: response.status,
        codes: [],
      },
    };
  }

  const json = (await response.json()) as GraphqlResponse<unknown>;

  if (json.errors?.length) {
    return {
      error: {
        message: json.errors.map((item) => item.message).join(', '),
        codes: json.errors
          .map((item) => item.extensions?.code)
          .filter((code): code is string => Boolean(code)),
      },
    };
  }

  return { data: json.data };
}

export const graphqlBaseQuery: BaseQueryFn<
  GraphqlBaseQueryArgs,
  unknown,
  { message: string; status?: number }
> = async (args, api) => {
  const initialToken = tokenStorage.get();
  let result = await executeGraphqlRequest(args, initialToken);

  if (
    'error' in result &&
    initialToken &&
    !args.skipRefreshRetry &&
    shouldAttemptRefresh(result.error)
  ) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      tokenStorage.set(newAccessToken);
      result = await executeGraphqlRequest(
        { ...args, skipRefreshRetry: true },
        newAccessToken,
      );
    }
  }

  if ('error' in result) {
    if (isAuthFailure(result.error)) {
      tokenStorage.clear();
      api.dispatch(logout());
    }

    return {
      error: {
        message: result.error.message,
        status: result.error.status,
      },
    };
  }

  return { data: result.data };
};
