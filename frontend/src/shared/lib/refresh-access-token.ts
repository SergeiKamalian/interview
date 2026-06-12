import { executePersistedGraphqlRequest } from '@shared/api/graphql/persisted-request';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import { env } from '@shared/config/env';

type RefreshResponse = {
  data?: {
    refreshTokens?: {
      accessToken: string;
      tokenType: string;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: { code?: string };
  }>;
};

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await executePersistedGraphqlRequest({
      url: env.graphqlUrl,
      operation: GraphqlOperations.RefreshTokens,
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as RefreshResponse;

    if (json.errors?.length || !json.data?.refreshTokens?.accessToken) {
      return null;
    }

    return json.data.refreshTokens.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
