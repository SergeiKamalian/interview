import type { MessageKind } from '../types/message-kind.type';

export const MESSAGE_ROLES = ['ai', 'candidate'] as const;

export type MessageRole = (typeof MESSAGE_ROLES)[number];

export type InterviewMessageEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  interviewQuestionId: number | null;
  role: MessageRole;
  messageKind: MessageKind | null;
  parentMessageId: number | null;
  targetCheckpointKey: string | null;
  content: string;
  sequenceOrder: number;
  createdAt: Date;
};
