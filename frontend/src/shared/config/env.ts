type Env = {
  readonly graphqlUrl: string;
  readonly apiUrl: string;
  readonly appName: string;
};

function readEnv(): Env {
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;
  const apiUrl = import.meta.env.VITE_API_URL ?? '';
  const appName = import.meta.env.VITE_APP_NAME ?? 'AI Interviewer';

  if (import.meta.env.DEV && !graphqlUrl) {
    throw new Error('Missing VITE_GRAPHQL_URL in development environment');
  }

  return {
    graphqlUrl: graphqlUrl ?? '/graphql',
    apiUrl,
    appName,
  };
}

export const env = readEnv();
