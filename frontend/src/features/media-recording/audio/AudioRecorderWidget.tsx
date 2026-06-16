import { Button } from '@shared/ui';
import { useAudioRecorder } from './useAudioRecorder';

type AudioRecorderWidgetProps = {
  enabled?: boolean;
  isSubmitting?: boolean;
  onSubmitRecording: (input: {
    blob: Blob;
    mimeType: string;
    durationSec: number;
  }) => Promise<void>;
};

function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function AudioRecorderWidget({
  enabled = true,
  isSubmitting = false,
  onSubmitRecording,
}: AudioRecorderWidgetProps) {
  const {
    status,
    elapsedSec,
    maxDurationSec,
    recording,
    errorMessage,
    startRecording,
    stopRecording,
    resetRecording,
    markUploading,
    markUploadFinished,
  } = useAudioRecorder({ enabled });

  const isBusy = isSubmitting || status === 'uploading';
  const canStart = enabled && (status === 'idle' || status === 'error');
  const canStop = status === 'recording';
  const canRetry = status === 'recorded' || status === 'error';
  const canSubmit = status === 'recorded' && recording !== null;

  const handleSubmit = async () => {
    if (!recording) {
      return;
    }

    markUploading();
    try {
      await onSubmitRecording({
        blob: recording.blob,
        mimeType: recording.mimeType,
        durationSec: recording.durationSec,
      });
      resetRecording();
    } catch {
      markUploadFinished();
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Голосовой ответ</p>
          <p className="text-xs text-slate-500">
            Максимум {formatDuration(maxDurationSec)}
          </p>
        </div>
        <p className="font-mono text-sm text-slate-700">
          {formatDuration(elapsedSec)}
        </p>
      </div>

      {status === 'recording' ? (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Идёт запись…
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {recording?.previewUrl ? (
        <audio controls src={recording.previewUrl} className="w-full" />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canStart ? (
          <Button
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => void startRecording()}
          >
            Начать запись
          </Button>
        ) : null}

        {canStop ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={() => stopRecording()}
          >
            Остановить
          </Button>
        ) : null}

        {canRetry ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isBusy}
            onClick={() => resetRecording()}
          >
            Перезаписать
          </Button>
        ) : null}

        {canSubmit ? (
          <Button
            type="button"
            size="sm"
            loading={isSubmitting}
            disabled={isBusy}
            onClick={() => void handleSubmit()}
          >
            Отправить голосовой ответ
          </Button>
        ) : null}
      </div>
    </div>
  );
}
