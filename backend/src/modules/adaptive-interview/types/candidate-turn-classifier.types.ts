import type { CandidateAnswerDisposition } from './candidate-answer-disposition.type';

export type CandidateTurnMessageKind =
  | 'main_answer'
  | 'follow_up_answer'
  | 'topic_opener_answer';

export type CandidateTurnKind =
  | 'substantive_answer'
  | 'scope_clarification'
  | 'format_clarification'
  | 'decline_whole'
  | 'decline_scoped'
  | 'topic_refusal'
  | 'confused'
  | 'off_topic';

export type CandidateTurnConfidence = 'high' | 'low';

export type TopicOpenerReadiness = 'ready' | 'uncertain' | 'declined';

export type CandidateTurnClassifierInput = {
  messageKind: CandidateTurnMessageKind;
  mainQuestionText: string;
  lastInterviewerMessage?: string | null;
  targetCheckpointTitle?: string | null;
  targetCheckpointKey?: string | null;
  localTurns?: Array<{ role: 'ai' | 'candidate'; content: string }>;
  candidateAnswer: string;
  attemptId?: number;
  interviewQuestionId?: number;
};

export type CandidateTurnClassifierJsonResponse = {
  turn_kind: CandidateTurnKind;
  confidence: CandidateTurnConfidence;
  reason: string;
  opener_readiness?: TopicOpenerReadiness | null;
};

export type CandidateTurnClassification = {
  turnKind: CandidateTurnKind;
  confidence: CandidateTurnConfidence;
  reason: string;
  openerReadiness: TopicOpenerReadiness | null;
  disposition: CandidateAnswerDisposition;
};

export type CandidateTurnClassifierValidationResult =
  | { status: 'valid'; data: CandidateTurnClassification }
  | { status: 'invalid'; errors: string[]; rawContent: string };

export type CandidateTurnClassifierRunResult =
  | { status: 'valid'; classification: CandidateTurnClassification; rawContent: string }
  | { status: 'invalid'; errors: string[]; rawContent: string }
  | { status: 'failed'; error: string };

export type CandidateTurnClassifierGoldenCase = {
  id: string;
  description: string;
  input: {
    message_kind: CandidateTurnMessageKind;
    main_question_text: string;
    last_interviewer_message?: string | null;
    target_checkpoint_title?: string | null;
    target_checkpoint_key?: string | null;
    local_turns?: Array<{ role: 'ai' | 'candidate'; content: string }>;
    candidate_answer: string;
  };
  expected: {
    turn_kind: CandidateTurnKind;
    disposition: CandidateAnswerDisposition;
    opener_readiness?: TopicOpenerReadiness | null;
  };
};

export type CandidateTurnClassifierGoldenDataset = {
  version: string;
  cases: CandidateTurnClassifierGoldenCase[];
};
