import { useCallback, useEffect, useRef } from 'react';
import { env } from '@shared/config/env';

const LOADING_PHASES = new Set([
  'answer_sending',
  'answer_received',
  'ai_analyzing',
  'follow_up_planned',
]);

function resolveThinkingSoundUrl(): string {
  const base = env.apiUrl.replace(/\/$/, '');
  return base ? `${base}/api/media/thinking-sound` : '/api/media/thinking-sound';
}

export function useInterviewThinkingSound(phase: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const playedInCycleRef = useRef(false);
  const loadPromiseRef = useRef<Promise<string | null> | null>(null);

  const ensureLoaded = useCallback(async (): Promise<string | null> => {
    if (objectUrlRef.current) {
      return objectUrlRef.current;
    }

    if (!loadPromiseRef.current) {
      loadPromiseRef.current = fetch(resolveThinkingSoundUrl(), {
        cache: 'no-store',
      })
        .then(async (response) => {
          if (!response.ok) {
            return null;
          }

          const blob = await response.blob();
          if (blob.size === 0) {
            return null;
          }

          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          return url;
        })
        .catch(() => null);
    }

    return loadPromiseRef.current;
  }, []);

  const stopThinking = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }, []);

  const startThinking = useCallback(async () => {
    const url = await ensureLoaded();
    if (!url) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.loop = false;
    audio.volume = 0.85;

    if (audio.src !== url) {
      audio.src = url;
    }

    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, [ensureLoaded]);

  useEffect(() => {
    if (!LOADING_PHASES.has(phase)) {
      playedInCycleRef.current = false;
      stopThinking();
      return;
    }

    if (playedInCycleRef.current) {
      return;
    }

    playedInCycleRef.current = true;
    void startThinking();
  }, [phase, startThinking, stopThinking]);

  useEffect(
    () => () => {
      stopThinking();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      loadPromiseRef.current = null;
    },
    [stopThinking],
  );

  return {
    preloadThinkingSound: ensureLoaded,
    startThinking,
    stopThinking,
  };
}
