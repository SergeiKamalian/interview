import type { CheckpointEvaluationAiResponse } from './evaluation.types';

export type {
  AiResponseValidationFailure,
  AiResponseValidationResult,
  AiResponseValidationStatus,
  AiResponseValidationSuccess,
  CheckpointEvaluationAiResponse,
  CheckpointEvaluationResultItem,
  CheckpointEvaluationStatus,
  FinalEvaluationCategory,
  FinalEvaluationNarrativeAiResponse,
  FinalEvaluationNarrativeJsonResponse,
  HireRecommendation,
} from './evaluation.types';

export type CheckpointDefinition = {
  checkpointKey: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
};

export type TranscriptFragment = {
  role: 'ai' | 'candidate' | 'system';
  content: string;
};

export type CheckpointEvaluationContext = {
  interviewQuestionId: number;
  interviewId: number;
  attemptId: number;
  companyId: number;
  questionText: string;
  idealAnswer: string;
  maxScore: number;
  sourceQuestionId: number | null;
  checkpoints: CheckpointDefinition[];
  candidateAnswer: string;
  candidateMessageId: number;
  transcriptFragments: TranscriptFragment[];
};

export type CheckpointEvaluationPromptMetadata = {
  promptKey: string;
  promptVersion: string;
};

export type CheckpointEvaluationRequest = {
  context: CheckpointEvaluationContext;
  metadata: CheckpointEvaluationPromptMetadata;
  systemPrompt: string;
  userPrompt: string;
};

export type CheckpointEvaluationRunResult =
  | {
      status: 'valid';
      rawContent: string;
      response: CheckpointEvaluationAiResponse;
      metadata: CheckpointEvaluationPromptMetadata;
      model: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      latencyMs: number;
      repairAttempted: boolean;
    }
  | {
      status: 'invalid_ai_response';
      rawContent: string;
      errors: string[];
      metadata: CheckpointEvaluationPromptMetadata;
      model: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      latencyMs: number;
      repairAttempted: boolean;
    };
