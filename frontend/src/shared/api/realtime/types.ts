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

export type InterviewMessageStreamPayload = {
  streamId: string;
  delta?: string;
  contentSoFar?: string;
  content?: string;
};

export type InterviewAudioStreamPayload = {
  streamId: string;
  mimeType: string;
  chunkIndex?: number;
  audioBase64?: string;
  audioBase64Final?: string;
};

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

export type InterviewStreamingMessage = {
  streamId: string;
  role: 'ai';
  content: string;
  messageKind: string | null;
};

export type InterviewRealtimePhase =
  | 'idle'
  | 'answer_sending'
  | 'answer_received'
  | 'ai_analyzing'
  | 'follow_up_planned'
  | 'message_streaming'
  | 'message_incoming'
  | 'question_completed'
  | 'attempt_completed'
  | 'evaluation_ready'
  | 'recovered';
