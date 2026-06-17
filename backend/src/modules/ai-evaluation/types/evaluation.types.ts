export type AiResponseValidationStatus = 'valid' | 'invalid_ai_response';

export type CheckpointEvaluationStatus = 'met' | 'partially_met' | 'not_met';

export type CheckpointEvaluationJsonItem = {
  checkpoint_key: string;
  status: CheckpointEvaluationStatus;
  confidence: number;
  evidence_quote: string;
  reasoning_short: string;
};

export type CheckpointEvaluationJsonResponse = {
  checkpoints: CheckpointEvaluationJsonItem[];
};

export type CheckpointEvaluationResultItem = {
  checkpointKey: string;
  status: CheckpointEvaluationStatus;
  confidence: number;
  evidenceQuote: string;
  reasoningShort: string;
  scoreAwarded?: number;
};

export type CheckpointEvaluationAiResponse = {
  checkpoints: CheckpointEvaluationResultItem[];
};

export type FinalEvaluationCategory =
  | 'weak'
  | 'basic'
  | 'average'
  | 'good'
  | 'strong';

export type HireRecommendation =
  | 'strong_reject'
  | 'reject'
  | 'maybe'
  | 'invite'
  | 'strong_invite';

export type FinalEvaluationNarrativeJsonResponse = {
  summary: string;
  detailed_summary: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
};

export type FinalEvaluationNarrativeAiResponse = {
  summary: string;
  detailedSummary: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
};

export type AiResponseValidationSuccess<T> = {
  status: 'valid';
  data: T;
};

export type AiResponseValidationFailure = {
  status: 'invalid_ai_response';
  errors: string[];
  rawContent: string;
};

export type AiResponseValidationResult<T> =
  | AiResponseValidationSuccess<T>
  | AiResponseValidationFailure;
