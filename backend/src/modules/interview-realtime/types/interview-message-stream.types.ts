export type InterviewMessageStreamPayload = {
  streamId: string;
  delta?: string;
  contentSoFar?: string;
  content?: string;
};

export type StreamAiMessageInput = {
  attemptId: number;
  interviewQuestionId: number;
  messageKind: string;
};
