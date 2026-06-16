import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  InterviewAudioStreamPayload,
  InterviewRealtimeEvent,
} from '@shared/api/realtime/types';

export type InterviewAiAudioState = {
  streamId: string;
  mimeType: string;
  status: 'buffering' | 'ready' | 'playing' | 'ended' | 'error';
  objectUrl: string | null;
};

function decodeBase64Chunk(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function buildObjectUrl(
  chunks: Uint8Array[],
  mimeType: string,
): string | null {
  if (chunks.length === 0) {
    return null;
  }

  const blob = new Blob(chunks as BlobPart[], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function useInterviewAiAudio() {
  const [audioState, setAudioState] = useState<InterviewAiAudioState | null>(
    null,
  );
  const chunkBuffersRef = useRef<Map<string, Uint8Array[]>>(new Map());
  const mimeTypesRef = useRef<Map<string, string>>(new Map());
  const objectUrlsRef = useRef<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const revokeObjectUrl = useCallback((streamId: string) => {
    const existing = objectUrlsRef.current.get(streamId);
    if (existing) {
      URL.revokeObjectURL(existing);
      objectUrlsRef.current.delete(streamId);
    }
  }, []);

  const playStream = useCallback((streamId: string, objectUrl: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.pause();
    audio.src = objectUrl;
    audio.currentTime = 0;

    setAudioState((current) =>
      current?.streamId === streamId
        ? { ...current, status: 'playing', objectUrl }
        : current,
    );

    void audio.play().catch(() => {
      setAudioState((current) =>
        current?.streamId === streamId
          ? { ...current, status: 'ready', objectUrl }
          : current,
      );
    });
  }, []);

  const appendChunk = useCallback((audio: InterviewAudioStreamPayload) => {
    if (!audio.audioBase64) {
      return;
    }

    const chunks = chunkBuffersRef.current.get(audio.streamId) ?? [];
    chunks.push(decodeBase64Chunk(audio.audioBase64));
    chunkBuffersRef.current.set(audio.streamId, chunks);
    mimeTypesRef.current.set(audio.streamId, audio.mimeType);
  }, []);

  const finalizeStream = useCallback(
    (audio: InterviewAudioStreamPayload, autoPlay: boolean) => {
      const existingChunks = chunkBuffersRef.current.get(audio.streamId) ?? [];

      if (existingChunks.length === 0 && audio.audioBase64Final) {
        appendChunk({
          ...audio,
          audioBase64: audio.audioBase64Final,
        });
      }

      const mimeType =
        audio.mimeType ??
        mimeTypesRef.current.get(audio.streamId) ??
        'audio/mpeg';
      const chunks = chunkBuffersRef.current.get(audio.streamId) ?? [];
      revokeObjectUrl(audio.streamId);
      const objectUrl = buildObjectUrl(chunks, mimeType);

      if (objectUrl) {
        objectUrlsRef.current.set(audio.streamId, objectUrl);
      }

      setAudioState({
        streamId: audio.streamId,
        mimeType,
        status: objectUrl ? 'ready' : 'error',
        objectUrl,
      });

      if (objectUrl && autoPlay) {
        playStream(audio.streamId, objectUrl);
      }
    },
    [appendChunk, playStream, revokeObjectUrl],
  );

  const handleAudioEvent = useCallback(
    (event: InterviewRealtimeEvent) => {
      const audio = event.audio;
      if (!audio?.streamId) {
        return;
      }

      if (event.eventType === 'ai.audio.stream_started') {
        revokeObjectUrl(audio.streamId);
        chunkBuffersRef.current.set(audio.streamId, []);
        mimeTypesRef.current.set(audio.streamId, audio.mimeType);
        setAudioState({
          streamId: audio.streamId,
          mimeType: audio.mimeType,
          status: 'buffering',
          objectUrl: null,
        });
        return;
      }

      if (event.eventType === 'ai.audio.stream_chunk') {
        appendChunk(audio);
        return;
      }

      if (event.eventType === 'ai.audio.stream_completed') {
        finalizeStream(audio, true);
      }
    },
    [appendChunk, finalizeStream, revokeObjectUrl],
  );

  const replayAiAudio = useCallback(
    (streamId?: string | null) => {
      const targetStreamId = streamId ?? audioState?.streamId;
      if (!targetStreamId) {
        return;
      }

      audioRef.current?.pause();

      const objectUrl =
        objectUrlsRef.current.get(targetStreamId) ?? audioState?.objectUrl;
      if (!objectUrl) {
        return;
      }

      playStream(targetStreamId, objectUrl);
    },
    [audioState?.objectUrl, audioState?.streamId, playStream],
  );

  const resetAiAudio = useCallback(() => {
    for (const streamId of objectUrlsRef.current.keys()) {
      revokeObjectUrl(streamId);
    }

    chunkBuffersRef.current.clear();
    mimeTypesRef.current.clear();
    audioRef.current?.pause();
    setAudioState(null);
  }, [revokeObjectUrl]);

  useEffect(() => {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      setAudioState((current) =>
        current ? { ...current, status: 'ended' } : current,
      );
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(
    () => () => {
      for (const streamId of objectUrlsRef.current.keys()) {
        revokeObjectUrl(streamId);
      }
    },
    [revokeObjectUrl],
  );

  return {
    audioState,
    handleAudioEvent,
    replayAiAudio,
    resetAiAudio,
  };
}
