import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  CommitCompanyQuestionImportMutation,
  CommitCompanyQuestionImportMutationVariables,
  QuestionStatus,
} from '@shared/api/graphql/generated/graphql';
import { env } from '@shared/config/env';
import { refreshAccessToken } from '@shared/lib/refresh-access-token';
import { tokenStorage } from '@shared/lib/token-storage';
import type {
  CompanyQuestionImportCommitResult,
  CompanyQuestionImportPreview,
} from '../model/types';

function resolvePreviewUrl(): string {
  const base = env.apiUrl.replace(/\/$/, '');
  return base
    ? `${base}/api/company/question-bank/import/preview`
    : '/api/company/question-bank/import/preview';
}

async function fetchImportPreview(
  file: File,
  accessToken: string | null,
): Promise<Response> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(resolvePreviewUrl(), {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });
}

async function parsePreviewError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
    if (body.error) {
      return body.error;
    }
  } catch {
    // fall through
  }

  return `Preview failed (${response.status})`;
}

export async function previewCompanyQuestionImport(
  file: File,
): Promise<CompanyQuestionImportPreview> {
  let accessToken = tokenStorage.get();
  let response = await fetchImportPreview(file, accessToken);

  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      tokenStorage.set(refreshed);
      accessToken = refreshed;
      response = await fetchImportPreview(file, accessToken);
    }
  }

  if (!response.ok) {
    throw new Error(await parsePreviewError(response));
  }

  return (await response.json()) as CompanyQuestionImportPreview;
}

export type CommitCompanyQuestionImportArgs = {
  importToken: string;
  status?: QuestionStatus;
};

export const companyQuestionImportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    commitCompanyQuestionImport: builder.mutation<
      CompanyQuestionImportCommitResult,
      CommitCompanyQuestionImportArgs
    >({
      query: ({ importToken, status }) => ({
        ...GraphqlOperations.CommitCompanyQuestionImport,
        variables: {
          input: {
            importToken,
            ...(status ? { status } : {}),
          },
        } satisfies CommitCompanyQuestionImportMutationVariables,
      }),
      transformResponse: (response: CommitCompanyQuestionImportMutation) =>
        response.commitCompanyQuestionImport,
      invalidatesTags: ['QuestionBank'],
    }),
  }),
});

export const { useCommitCompanyQuestionImportMutation } =
  companyQuestionImportApi;
