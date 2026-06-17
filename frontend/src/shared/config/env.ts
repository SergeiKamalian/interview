type Env = {
  readonly graphqlUrl: string;
  readonly apiUrl: string;
  readonly appName: string;
  readonly interviewAudioEnabled: boolean;
};

function readEnv(): Env {
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;
  const apiUrl = import.meta.env.VITE_API_URL ?? '';
  const appName = import.meta.env.VITE_APP_NAME ?? 'AI Interviewer';
  const interviewAudioEnabled =
    import.meta.env.VITE_INTERVIEW_AUDIO_ENABLED !== 'false';

  if (import.meta.env.DEV && !graphqlUrl) {
    throw new Error('Missing VITE_GRAPHQL_URL in development environment');
  }

  return {
    graphqlUrl: graphqlUrl ?? '/graphql',
    apiUrl,
    appName,
    interviewAudioEnabled,
  };
}

export const env = readEnv();
