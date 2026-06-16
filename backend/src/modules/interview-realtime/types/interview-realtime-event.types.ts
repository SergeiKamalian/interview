import type { InterviewAudioStreamPayload } from './interview-audio-stream.types';
import type { InterviewMessageStreamPayload } from './interview-message-stream.types';

export const INTERVIEW_REALTIME_EVENT_TYPES = [
  'answer.received',
  'ai.evaluation_started',
  'ai.follow_up_planned',
  'ai.message.stream_started',
  'ai.message.stream_delta',
  'ai.message.stream_completed',
  'ai.audio.stream_started',
  'ai.audio.stream_chunk',
  'ai.audio.stream_completed',
  'message.appended',
  'question.completed',
  'attempt.completed',
  'evaluation.ready',
  'adaptive.error_recovered',
] as const;

export type InterviewRealtimeEventType =
  (typeof INTERVIEW_REALTIME_EVENT_TYPES)[number];

export type InterviewRealtimeEvent = {
  eventId: string;
  eventType: InterviewRealtimeEventType;
  attemptId: string;
  interviewQuestionId?: string | null;
  messageId?: string | null;
  followUpId?: string | null;
  sequenceOrder?: number | null;
  messageKind?: string | null;
  stream?: InterviewMessageStreamPayload | null;
  audio?: InterviewAudioStreamPayload | null;
  createdAt: string;
};

export type JoinInterviewRoomPayload = {
  publicToken: string;
  attemptId: string;
  lastEventId?: string | null;
};
