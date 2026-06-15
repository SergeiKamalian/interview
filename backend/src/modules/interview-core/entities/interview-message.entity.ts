export const MESSAGE_ROLES = ['ai', 'candidate'] as const;

export type MessageRole = (typeof MESSAGE_ROLES)[number];

export type InterviewMessageEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  interviewQuestionId: number | null;
  role: MessageRole;
  content: string;
  sequenceOrder: number;
  createdAt: Date;
};
