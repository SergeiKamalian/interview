export type MediaType = 'audio' | 'video';

export type MediaAssetEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  interviewMessageId: number | null;
  mediaType: MediaType;
  storageBucket: string;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number;
  durationMs: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMediaAssetInput = {
  companyId: number;
  interviewAttemptId: number;
  interviewMessageId?: number | null;
  mediaType: MediaType;
  storageBucket: string;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number;
  durationMs?: number | null;
};
