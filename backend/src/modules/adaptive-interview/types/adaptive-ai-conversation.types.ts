export type AdaptiveAiConversationRole = 'system' | 'user' | 'assistant';

export type AdaptiveAiConversationMessage = {
  role: AdaptiveAiConversationRole;
  content: string;
};

export type AdaptiveAiConversationSession = {
  messages: AdaptiveAiConversationMessage[];
  promptVersion: string;
  turnCount: number;
};

export type AdaptiveAiSuggestedFollowUp = {
  checkpointKey: string;
  followUpQuestion: string;
  reason: string;
};
