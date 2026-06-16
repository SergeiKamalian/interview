import { env } from '@shared/config/env';

export type UploadInterviewAudioInput = {
  publicToken: string;
  attemptId: string;
  blob: Blob;
  mimeType: string;
  durationSec: number;
};

export type UploadInterviewAudioResponse = {
  mediaAssetId: string;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSec: number | null;
};

function resolveUploadUrl(): string {
  const base = env.apiUrl.replace(/\/$/, '');
  return base ? `${base}/api/uploads/audio` : '/api/uploads/audio';
}

export async function uploadInterviewAudio(
  input: UploadInterviewAudioInput,
): Promise<UploadInterviewAudioResponse> {
  const formData = new FormData();
  formData.append('publicToken', input.publicToken);
  formData.append('attemptId', input.attemptId);
  formData.append('durationSec', String(input.durationSec));
  formData.append(
    'audioFile',
    input.blob,
    `answer-${Date.now()}.${resolveExtension(input.mimeType)}`,
  );

  const response = await fetch(resolveUploadUrl(), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Upload failed (${response.status})`);
  }

  return (await response.json()) as UploadInterviewAudioResponse;
}

function resolveExtension(mimeType: string): string {
  switch (mimeType) {
    case 'audio/mpeg':
      return 'mp3';
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav';
    case 'audio/ogg':
      return 'ogg';
    case 'audio/mp4':
      return 'm4a';
    default:
      return 'webm';
  }
}
