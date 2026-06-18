import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import {
  isTargetedRefusalTurnKind,
  isWholeDeclineTurnKind,
} from './map-turn-kind-to-disposition.util';

/** Classifier disposition drives follow-up skip; no regex on policy path. */
export function shouldSkipFollowUps(input: {
  aiDisposition?: CandidateAnswerDisposition | null;
  candidateTurnKind?: CandidateTurnKind | null;
  /** Follow-ups already used on this main question (planned/asked/answered). */
  followUpsUsedForQuestion?: number;
}): boolean {
  if (isWholeDeclineTurnKind(input.candidateTurnKind)) {
    return true;
  }

  if (isTargetedRefusalTurnKind(input.candidateTurnKind)) {
    return false;
  }

  if (input.aiDisposition === 'declined') {
    if (input.candidateTurnKind) {
      return isWholeDeclineTurnKind(input.candidateTurnKind);
    }

    return true;
  }

  if (input.aiDisposition === 'confused') {
    return (input.followUpsUsedForQuestion ?? 0) >= 1;
  }

  if (input.aiDisposition === 'misunderstood_question') {
    return false;
  }

  if (input.aiDisposition === 'asked_for_scope') {
    return false;
  }

  return false;
}

export function resolveSkipFollowUpReason(input: {
  aiDisposition?: CandidateAnswerDisposition | null;
  candidateTurnKind?: CandidateTurnKind | null;
}): string {
  if (isWholeDeclineTurnKind(input.candidateTurnKind)) {
    return 'candidate_declined_knowledge';
  }

  if (input.aiDisposition === 'declined') {
    return 'candidate_declined_knowledge_ai';
  }

  if (input.aiDisposition === 'confused') {
    return 'candidate_confused_ai';
  }

  return 'candidate_declined_knowledge';
}

export type { CandidateAnswerDisposition };
