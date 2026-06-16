export type AudioRecorderStatus =
  | 'idle'
  | 'recording'
  | 'recorded'
  | 'uploading'
  | 'error';

export type AudioRecordingResult = {
  blob: Blob;
  mimeType: string;
  durationSec: number;
  previewUrl: string;
};

export const DEFAULT_MAX_RECORDING_SEC = 180;
