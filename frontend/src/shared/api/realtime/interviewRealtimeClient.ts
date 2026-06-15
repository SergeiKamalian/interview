import { io, type Socket } from 'socket.io-client';
import type { InterviewRealtimeEvent } from './types';

const DEFAULT_SOCKET_PATH = '/socket.io';

function resolveRealtimeBaseUrl(): string {
  const configured = import.meta.env.VITE_REALTIME_BASE_URL as string | undefined;
  if (configured?.trim()) {
    return configured.trim().replace(/\/$/, '');
  }

  return window.location.origin;
}

export function createInterviewRealtimeClient(): Socket {
  return io(`${resolveRealtimeBaseUrl()}/interview`, {
    path: DEFAULT_SOCKET_PATH,
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 8,
  });
}

export function joinInterviewAttemptRoom(
  socket: Socket,
  input: {
    publicToken: string;
    attemptId: string;
    lastEventId?: string | null;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const onJoined = () => {
      cleanup();
      resolve();
    };
    const onError = (payload: { code?: string; message?: string }) => {
      cleanup();
      reject(new Error(payload.message ?? payload.code ?? 'JOIN_DENIED'));
    };

    const cleanup = () => {
      socket.off('interview.joined', onJoined);
      socket.off('interview.error', onError);
    };

    socket.on('interview.joined', onJoined);
    socket.on('interview.error', onError);
    socket.emit('join', input);
  });
}

export function subscribeInterviewEvents(
  socket: Socket,
  onEvent: (event: InterviewRealtimeEvent) => void,
): () => void {
  const handler = (event: InterviewRealtimeEvent) => {
    onEvent(event);
  };

  socket.on('interview.event', handler);

  return () => {
    socket.off('interview.event', handler);
  };
}
