import type { CandidateAnswerDisposition } from './candidate-answer-disposition.type';
import type { AdaptiveAiSuggestedFollowUp } from './adaptive-ai-conversation.types';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';

export type PerTurnCheckpointEvaluationStatus = Extract<
  CheckpointStateStatus,
  'covered' | 'partial' | 'missed' | 'unclear'
>;

export type PerTurnCheckpointEvaluationJsonItem = {
  checkpoint_key: string;
  status: PerTurnCheckpointEvaluationStatus;
  score_awarded: number;
  confidence: number;
  evidence_summary: string | null;
  rationale: string;
};

export type PerTurnCheckpointEvaluationJsonResponse = {
  candidate_disposition: CandidateAnswerDisposition;
  checkpoint_results: PerTurnCheckpointEvaluationJsonItem[];
  suggested_follow_up?: PerTurnSuggestedFollowUpJson | null;
};

export type PerTurnSuggestedFollowUpJson = {
  checkpoint_key: string;
  follow_up_question: string;
  reason: string;
};

export type PerTurnCheckpointEvaluationResult = {
  checkpointKey: string;
  status: PerTurnCheckpointEvaluationStatus;
  scoreAwarded: number;
  confidence: number;
  evidenceSummary: string | null;
  rationale: string;
};

export type PerTurnCheckpointEvaluationAiResponse = {
  candidateDisposition: CandidateAnswerDisposition;
  checkpointResults: PerTurnCheckpointEvaluationResult[];
};

export type PerTurnEvaluationValidationResult =
  | {
      status: 'valid';
      data: PerTurnCheckpointEvaluationAiResponse;
    }
  | {
      status: 'invalid_ai_response';
      errors: string[];
      rawContent: string;
    };

export type PerTurnCheckpointEvaluatorRunResult =
  | {
      status: 'valid';
      repairAttempted: boolean;
      candidateDisposition: CandidateAnswerDisposition;
      checkpointResults: PerTurnCheckpointEvaluationResult[];
      suggestedFollowUp?: AdaptiveAiSuggestedFollowUp | null;
      model: string;
      latencyMs: number;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  | {
      status: 'invalid_ai_response';
      repairAttempted: boolean;
      errors: string[];
      model: string;
      latencyMs: number;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  | {
      status: 'provider_error';
      message: string;
    };
