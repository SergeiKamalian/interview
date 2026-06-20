import type { CheckpointEvaluationHints } from './checkpoint-evaluation-hints.type';
import type {
  AiTone,
  ProbingDepth,
  ScoringStrictness,
} from '../../interview-core/types/interview-config.enum';

export type AdaptiveLocalTurn = {
  sequenceOrder: number;
  role: 'ai' | 'candidate';
  content: string;
  messageKind?:
    | 'main_answer'
    | 'follow_up_answer'
    | 'topic_opener_answer'
    | null;
  targetCheckpointKey?: string | null;
};

export type AdaptiveEvidenceSnippet = {
  checkpointKey: string;
  summary: string;
};

export type AdaptiveCheckpointStateSnapshot = {
  checkpointKey: string;
  status: string;
  scoreAwarded: number;
  maxScore: number;
  followUpCount: number;
  rationale?: string | null;
};

export type AdaptiveCheckpointDefinition = {
  checkpointKey: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
  evaluationHints?: CheckpointEvaluationHints | null;
  goodExamples?: string[];
  badExamples?: string[];
  questionGoodExamples?: string[];
  questionBadExamples?: string[];
};

export type AdaptiveFollowUpLimits = {
  maxPerQuestion: number;
  maxPerCheckpoint: number;
  usedForQuestion: number;
};

export type AdaptiveInterviewContextPacket = {
  interviewQuestionId: number;
  interviewId: number;
  attemptId: number;
  companyId: number;
  aiTone: AiTone;
  probingDepth: ProbingDepth;
  scoringStrictness: ScoringStrictness;
  timeLimitMinutes: number | null;
  questionText: string;
  referenceAnswer: string;
  maxScore: number;
  checkpoints: AdaptiveCheckpointDefinition[];
  badAnswerExamples: string[];
  latestCandidateAnswer: string;
  latestCandidateMessageId: number | null;
  latestAnswerMessageKind?:
    | 'main_answer'
    | 'follow_up_answer'
    | 'topic_opener_answer'
    | null;
  targetCheckpointKey?: string | null;
  checkpointStates: AdaptiveCheckpointStateSnapshot[];
  evidenceSnippets: AdaptiveEvidenceSnippet[];
  localTurns: AdaptiveLocalTurn[];
  followUpLimits: AdaptiveFollowUpLimits;
};

export type BuildAdaptiveInterviewContextInput = {
  interviewQuestionId: number;
  interviewId: number;
  attemptId: number;
  companyId: number;
  aiTone: AiTone;
  probingDepth: ProbingDepth;
  scoringStrictness: ScoringStrictness;
  timeLimitMinutes: number | null;
  questionText: string;
  shortAnswer: string;
  idealAnswer: string;
  maxScore: number;
  checkpoints: AdaptiveCheckpointDefinition[];
  questionMessages: Array<{
    id: number;
    role: 'ai' | 'candidate';
    content: string;
    sequenceOrder: number;
    interviewQuestionId: number | null;
    messageKind?: string | null;
    targetCheckpointKey?: string | null;
  }>;
  checkpointStates: Array<{
    checkpointKey: string;
    status: string;
    scoreAwarded: number;
    maxScore: number;
    followUpCount: number;
    evidenceSummary: string | null;
    rationale?: string | null;
  }>;
  badAnswerExamples?: string[];
  limits: {
    localTurnLimit: number;
    maxFollowUpsPerQuestion: number;
    maxFollowUpsPerCheckpoint: number;
    maxTextLength: number;
    maxCandidateAnswerLength: number;
    maxReferenceAnswerLength: number;
  };
};
