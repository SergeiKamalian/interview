import type { AdaptiveCheckpointDefinition } from './adaptive-interview-context.types';
import type { AdaptiveAiSuggestedFollowUp } from './adaptive-ai-conversation.types';
import type { AdaptiveInterviewContextPacket } from './adaptive-interview-context.types';
import type { CheckpointStateStatus } from './checkpoint-state-status.type';

export type FollowUpPlannerJsonResponse = {
  follow_up_question: string;
  reason: string;
};

export type FollowUpPlannerAiResponse = {
  followUpQuestion: string;
  reason: string;
};

export type FollowUpPlannerValidationResult =
  | { status: 'valid'; data: FollowUpPlannerAiResponse }
  | { status: 'invalid_ai_response'; errors: string[]; rawContent: string };

export type FollowUpPolicyCheckpointCandidate = {
  checkpointKey: string;
  title: string;
  expected: string;
  weight: number;
  sortOrder: number;
  status: CheckpointStateStatus;
  scoreAwarded: number;
  maxScore: number;
  followUpCount: number;
};

import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';

export type FollowUpPolicyInput = {
  questionMaxScore: number;
  checkpoints: AdaptiveCheckpointDefinition[];
  checkpointStates: Array<{
    checkpointKey: string;
    status: CheckpointStateStatus;
    scoreAwarded: number;
    maxScore: number;
    followUpCount: number;
    needsManualReview: boolean;
    rationale?: string | null;
  }>;
  followUpsUsedForQuestion: number;
  maxFollowUpsPerQuestion: number;
  maxFollowUpsPerCheckpoint: number;
  maxFollowUpsHeavyCheckpoint?: number;
  heavyCheckpointWeightRatio?: number;
  minPriorityToProbe?: number;
  questionScoreSufficientRatio: number;
  lowWeightCheckpointRatio: number;
  stagnationLimit?: number;
  recentScoreDeltas?: number[];
  latestCandidateAnswer?: string | null;
  /** Cumulative candidate text per checkpoint (main + targeted follow-ups). */
  checkpointEvidenceTextByKey?: Record<string, string>;
  candidateDispositionFromAi?: CandidateAnswerDisposition | null;
  candidateTurnKind?: CandidateTurnKind | null;
  stickyTargetCheckpointKey?: string | null;
  latestCheckpointResults?: Array<{
    checkpointKey: string;
    status: CheckpointStateStatus;
    scoreAwarded: number;
    rationale?: string | null;
  }>;
  questionText?: string;
  localTurns?: AdaptiveInterviewContextPacket['localTurns'];
  previousFollowUpQuestions?: string[];
  isFollowUpAnswer?: boolean;
};

export type FollowUpPolicyDecision =
  | {
      shouldAskFollowUp: false;
      reason: string;
    }
  | {
      shouldAskFollowUp: true;
      targetCheckpointKey: string;
      checkpointTitle: string;
      checkpointExpected: string;
      reason: string;
      followUpKind?: 'depth_probe' | 'residual_probe' | 'topic_redirect' | 'clarification_redirect' | 'generic';
      missingMustConcepts?: string[];
      answeredCheckpointKey?: string | null;
    };

export type FollowUpPlannerOptions = {
  context?: AdaptiveInterviewContextPacket;
  suggestedFollowUp?: AdaptiveAiSuggestedFollowUp | null;
  candidateDispositionFromAi?: CandidateAnswerDisposition | null;
  candidateTurnKind?: CandidateTurnKind | null;
  followUpsUsedForQuestion?: number;
  avoidLlmFallback?: boolean;
  recentScoreDeltas?: number[];
  latestCheckpointResults?: Array<{
    checkpointKey: string;
    status: CheckpointStateStatus;
    scoreAwarded: number;
    rationale?: string | null;
  }>;
};

export type FollowUpPlannerRunResult =
  | { status: 'no_follow_up'; reason: string }
  | {
      status: 'planned';
      followUpId: number;
      checkpointKey: string;
      followUpQuestion: string;
      reason: string;
      usedTemplate: boolean;
      repairAttempted: boolean;
    }
  | { status: 'provider_error'; message: string; usedTemplate: boolean };
