export type AdaptiveOpenAiResponseState = {
  provider: 'openai';
  api: 'responses';
  model: string;
  promptVersion: string;
  lastResponseId: string;
  attemptId: number;
  interviewQuestionId: number;
  turnCount: number;
  createdAt: string;
  updatedAt: string;
};
