import type { GraphqlOperationDef } from './operations.registry';

const PERSISTED_QUERY_NOT_FOUND = 'PERSISTED_QUERY_NOT_FOUND';
const APQ_WARM_CACHE_KEY = 'graphql_apq_warm_hashes';

export type GraphqlRequestPayload = {
  operationName: string;
  variables?: Record<string, unknown>;
  query?: string;
  extensions?: {
    persistedQuery: {
      version: 1;
      sha256Hash: string;
    };
  };
};

function readWarmHashes(): Set<string> {
  try {
    const raw = sessionStorage.getItem(APQ_WARM_CACHE_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

function writeWarmHashes(hashes: Set<string>): void {
  sessionStorage.setItem(APQ_WARM_CACHE_KEY, JSON.stringify([...hashes]));
}

function markHashWarm(sha256Hash: string): void {
  const hashes = readWarmHashes();
  hashes.add(sha256Hash);
  writeWarmHashes(hashes);
}

function markHashCold(sha256Hash: string): void {
  const hashes = readWarmHashes();
  hashes.delete(sha256Hash);
  writeWarmHashes(hashes);
}

function isHashWarm(sha256Hash: string): boolean {
  return readWarmHashes().has(sha256Hash);
}

export function buildPersistedGraphqlPayload(input: {
  operation: GraphqlOperationDef;
  variables?: Record<string, unknown>;
  mode: 'hash-only' | 'register';
}): GraphqlRequestPayload {
  const payload: GraphqlRequestPayload = {
    operationName: input.operation.operationName,
    variables: input.variables ?? {},
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: input.operation.sha256Hash,
      },
    },
  };

  if (input.mode === 'register') {
    payload.query = input.operation.document;
  }

  return payload;
}

export function isPersistedQueryNotFound(errors: unknown): boolean {
  if (!Array.isArray(errors)) {
    return false;
  }

  return errors.some((error) => {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const extensions = (error as { extensions?: { code?: string } }).extensions;
    return extensions?.code === PERSISTED_QUERY_NOT_FOUND;
  });
}

async function sendPersistedRequest(input: {
  url: string;
  operation: GraphqlOperationDef;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  mode: 'hash-only' | 'register';
}): Promise<Response> {
  return fetch(input.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...input.headers,
    },
    credentials: input.credentials ?? 'include',
    body: JSON.stringify(
      buildPersistedGraphqlPayload({
        operation: input.operation,
        variables: input.variables,
        mode: input.mode,
      }),
    ),
  });
}

export async function executePersistedGraphqlRequest(input: {
  url: string;
  operation: GraphqlOperationDef;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}): Promise<Response> {
  const { sha256Hash } = input.operation;

  if (isHashWarm(sha256Hash)) {
    const hashOnlyResponse = await sendPersistedRequest({
      ...input,
      mode: 'hash-only',
    });

    const hashOnlyJson = (await hashOnlyResponse.clone().json()) as {
      errors?: unknown;
    };

    if (!isPersistedQueryNotFound(hashOnlyJson.errors)) {
      return hashOnlyResponse;
    }

    markHashCold(sha256Hash);
  }

  const registerResponse = await sendPersistedRequest({
    ...input,
    mode: 'register',
  });

  const registerJson = (await registerResponse.clone().json()) as {
    errors?: unknown;
  };

  if (!isPersistedQueryNotFound(registerJson.errors)) {
    markHashWarm(sha256Hash);
  }

  return registerResponse;
}
