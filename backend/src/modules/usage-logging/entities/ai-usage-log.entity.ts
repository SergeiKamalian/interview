export type AiUsageLogStatus = 'success' | 'error' | 'invalid_response';

export type AiUsageLogEntity = {
  id: number;
  companyId: number;
  interviewAttemptId: number | null;
  interviewMessageId: number | null;
  provider: string;
  model: string;
  operationType: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  latencyMs: number | null;
  createdAt: Date;
};

export type CreateAiUsageLogInput = {
  companyId: number;
  interviewAttemptId?: number | null;
  interviewMessageId?: number | null;
  provider: string;
  model: string;
  operationType: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs?: number | null;
  status: AiUsageLogStatus;
  correlationId: string;
};

export type AiUsageCostSummary = {
  totalRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
};
