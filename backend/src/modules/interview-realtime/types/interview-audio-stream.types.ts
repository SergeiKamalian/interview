export type InterviewAudioStreamPayload = {
  streamId: string;
  mimeType: string;
  chunkIndex?: number;
  audioBase64?: string;
  audioBase64Final?: string;
};

export type StreamAiAudioInput = {
  attemptId: number;
  interviewQuestionId: number;
  messageKind: string;
  streamId: string;
  text: string;
};
