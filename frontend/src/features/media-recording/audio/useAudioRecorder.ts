import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_MAX_RECORDING_SEC,
  type AudioRecorderStatus,
  type AudioRecordingResult,
} from './audioRecorder.types';

type UseAudioRecorderOptions = {
  enabled?: boolean;
  maxDurationSec?: number;
};

function pickRecorderMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
  ];

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }

  return '';
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { enabled = true, maxDurationSec = DEFAULT_MAX_RECORDING_SEC } =
    options;
  const [status, setStatus] = useState<AudioRecorderStatus>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [recording, setRecording] = useState<AudioRecordingResult | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStreamTracks = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    clearTimer();
    stopStreamTracks();
    revokePreviewUrl();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    setElapsedSec(0);
    setRecording(null);
    setErrorMessage(null);
    setStatus('idle');
  }, [clearTimer, revokePreviewUrl, stopStreamTracks]);

  const finalizeRecording = useCallback(() => {
    const mimeType =
      mediaRecorderRef.current?.mimeType ||
      pickRecorderMimeType() ||
      'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const startedAt = startedAtRef.current ?? Date.now();
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

    revokePreviewUrl();
    const previewUrl = URL.createObjectURL(blob);
    previewUrlRef.current = previewUrl;

    setRecording({
      blob,
      mimeType,
      durationSec,
      previewUrl,
    });
    setStatus('recorded');
    clearTimer();
    stopStreamTracks();
    mediaRecorderRef.current = null;
  }, [clearTimer, revokePreviewUrl, stopStreamTracks]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return;
    }

    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (!enabled) {
      return;
    }

    resetRecording();
    setStatus('recording');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setElapsedSec(0);

      const mimeType = pickRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setStatus('error');
        setErrorMessage('Не удалось записать аудио.');
        resetRecording();
      };

      recorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          setStatus('error');
          setErrorMessage('Запись пустая. Попробуйте ещё раз.');
          return;
        }

        finalizeRecording();
      };

      recorder.start(250);
      timerRef.current = window.setInterval(() => {
        const startedAt = startedAtRef.current ?? Date.now();
        const nextElapsed = Math.floor((Date.now() - startedAt) / 1000);
        setElapsedSec(nextElapsed);

        if (nextElapsed >= maxDurationSec) {
          stopRecording();
        }
      }, 250);
    } catch {
      setStatus('error');
      setErrorMessage('Не удалось начать запись. Проверьте доступ к микрофону.');
      resetRecording();
    }
  }, [
    enabled,
    finalizeRecording,
    maxDurationSec,
    resetRecording,
    stopRecording,
  ]);

  const markUploading = useCallback(() => {
    setStatus('uploading');
  }, []);

  const markUploadFinished = useCallback(() => {
    setStatus('recorded');
  }, []);

  useEffect(
    () => () => {
      clearTimer();
      stopStreamTracks();
      revokePreviewUrl();
    },
    [clearTimer, revokePreviewUrl, stopStreamTracks],
  );

  return {
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
  };
}
