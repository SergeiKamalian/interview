import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createInterviewRealtimeClient,
  joinInterviewAttemptRoom,
  subscribeInterviewEvents,
} from '@shared/api/realtime/interviewRealtimeClient';
import type {
  InterviewRealtimeEvent,
  InterviewRealtimePhase,
  InterviewStreamingMessage,
} from '@shared/api/realtime/types';

type UseInterviewRealtimeInput = {
  publicToken: string;
  attemptId: string;
  enabled?: boolean;
  onResync?: () => void | Promise<void>;
};

function mapEventToPhase(
  eventType: InterviewRealtimeEvent['eventType'],
): InterviewRealtimePhase {
  switch (eventType) {
    case 'answer.received':
      return 'answer_received';
    case 'ai.evaluation_started':
      return 'ai_analyzing';
    case 'ai.follow_up_planned':
      return 'follow_up_planned';
    case 'ai.message.stream_started':
    case 'ai.message.stream_delta':
      return 'message_streaming';
    case 'ai.message.stream_completed':
      return 'message_incoming';
    case 'message.appended':
      return 'message_incoming';
    case 'question.completed':
      return 'question_completed';
    case 'attempt.completed':
      return 'attempt_completed';
    case 'evaluation.ready':
      return 'evaluation_ready';
    case 'adaptive.error_recovered':
      return 'recovered';
    default:
      return 'idle';
  }
}

function applyStreamEvent(
  current: InterviewStreamingMessage | null,
  event: InterviewRealtimeEvent,
): InterviewStreamingMessage | null {
  const stream = event.stream;
  if (!stream?.streamId) {
    return current;
  }

  if (event.eventType === 'ai.message.stream_started') {
    return {
      streamId: stream.streamId,
      role: 'ai',
      content: '',
      messageKind: event.messageKind ?? null,
    };
  }

  if (event.eventType === 'ai.message.stream_delta') {
    if (current?.streamId !== stream.streamId) {
      return {
        streamId: stream.streamId,
        role: 'ai',
        content: stream.contentSoFar ?? stream.delta ?? '',
        messageKind: event.messageKind ?? null,
      };
    }

    return {
      ...current,
      content: stream.contentSoFar ?? `${current.content}${stream.delta ?? ''}`,
      messageKind: event.messageKind ?? current.messageKind,
    };
  }

  if (event.eventType === 'ai.message.stream_completed') {
    if (current?.streamId !== stream.streamId) {
      return {
        streamId: stream.streamId,
        role: 'ai',
        content: stream.content ?? stream.contentSoFar ?? '',
        messageKind: event.messageKind ?? null,
      };
    }

    return {
      ...current,
      content: stream.content ?? stream.contentSoFar ?? current.content,
    };
  }

  return current;
}

export function useInterviewRealtime(input: UseInterviewRealtimeInput) {
  const { publicToken, attemptId, enabled = true, onResync } = input;
  const [phase, setPhase] = useState<InterviewRealtimePhase>('idle');
  const [lastEvent, setLastEvent] = useState<InterviewRealtimeEvent | null>(
    null,
  );
  const [streamingMessage, setStreamingMessage] =
    useState<InterviewStreamingMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const socketRef = useRef(
    enabled ? createInterviewRealtimeClient() : null,
  );

  const markAnswerSending = useCallback(() => {
    setPhase('answer_sending');
    setStreamingMessage(null);
  }, []);

  const resetPhase = useCallback(() => {
    setPhase('idle');
    setStreamingMessage(null);
  }, []);

  useEffect(() => {
    if (!enabled || !publicToken || !attemptId) {
      return;
    }

    const socket = socketRef.current ?? createInterviewRealtimeClient();
    socketRef.current = socket;
    let unsubscribeEvents: (() => void) | null = null;
    let disposed = false;

    const connect = async () => {
      if (!socket.connected) {
        socket.connect();
      }

      await new Promise<void>((resolve, reject) => {
        if (socket.connected) {
          resolve();
          return;
        }

        socket.once('connect', () => resolve());
        socket.once('connect_error', (error) => reject(error));
      });

      if (disposed) {
        return;
      }

      setIsConnected(true);
      await joinInterviewAttemptRoom(socket, { publicToken, attemptId });

      unsubscribeEvents = subscribeInterviewEvents(socket, (event) => {
        if (seenEventIdsRef.current.has(event.eventId)) {
          return;
        }

        seenEventIdsRef.current.add(event.eventId);
        setLastEvent(event);
        setPhase(mapEventToPhase(event.eventType));

        if (
          event.eventType === 'ai.message.stream_started' ||
          event.eventType === 'ai.message.stream_delta' ||
          event.eventType === 'ai.message.stream_completed'
        ) {
          setStreamingMessage((current) => applyStreamEvent(current, event));
        }

        if (event.eventType === 'message.appended') {
          setStreamingMessage(null);
        }
      });

      socket.on('reconnect', () => {
        void onResync?.();
      });
    };

    void connect().catch(() => {
      setIsConnected(false);
    });

    return () => {
      disposed = true;
      unsubscribeEvents?.();
      socket.off('reconnect');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [attemptId, enabled, onResync, publicToken]);

  const statusLabel = useMemo(() => {
    switch (phase) {
      case 'answer_sending':
        return 'Отправляем ответ…';
      case 'answer_received':
        return 'Ответ получен';
      case 'ai_analyzing':
        return 'AI анализирует ответ…';
      case 'follow_up_planned':
        return 'Готовим уточняющий вопрос…';
      case 'message_streaming':
        return 'AI печатает ответ…';
      case 'message_incoming':
        return 'Новое сообщение…';
      case 'recovered':
        return 'Продолжаем интервью…';
      case 'question_completed':
        return 'Вопрос завершён';
      case 'attempt_completed':
        return 'Интервью завершено';
      case 'evaluation_ready':
        return 'Оценка готова';
      default:
        return null;
    }
  }, [phase]);

  return {
    phase,
    statusLabel,
    lastEvent,
    streamingMessage,
    isConnected,
    markAnswerSending,
    resetPhase,
  };
}
