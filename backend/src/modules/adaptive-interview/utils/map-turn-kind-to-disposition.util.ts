import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type {
  CandidateTurnClassification,
  CandidateTurnClassifierJsonResponse,
  CandidateTurnKind,
  TopicOpenerReadiness,
} from '../types/candidate-turn-classifier.types';

export function mapTurnKindToDisposition(
  turnKind: CandidateTurnKind,
): CandidateAnswerDisposition {
  switch (turnKind) {
    case 'scope_clarification':
    case 'format_clarification':
      return 'asked_for_scope';
    case 'decline_whole':
    case 'decline_scoped':
    case 'topic_refusal':
      return 'declined';
    case 'confused':
      return 'confused';
    case 'off_topic':
      return 'off_topic';
    case 'substantive_answer':
    default:
      return 'engaged';
  }
}

export function normalizeCandidateTurnClassification(
  payload: CandidateTurnClassifierJsonResponse,
): CandidateTurnClassification {
  const openerReadiness = normalizeOpenerReadiness(payload.opener_readiness);

  return {
    turnKind: payload.turn_kind,
    confidence: payload.confidence,
    reason: payload.reason.trim(),
    openerReadiness,
    disposition: mapTurnKindToDisposition(payload.turn_kind),
  };
}

function normalizeOpenerReadiness(
  value: TopicOpenerReadiness | null | undefined,
): TopicOpenerReadiness | null {
  if (value === 'ready' || value === 'uncertain' || value === 'declined') {
    return value;
  }

  return null;
}

export function isScopeClarificationTurnKind(
  turnKind: CandidateTurnKind,
): boolean {
  return (
    turnKind === 'scope_clarification' || turnKind === 'format_clarification'
  );
}

export function isTargetedRefusalTurnKind(
  turnKind: CandidateTurnKind | null | undefined,
): boolean {
  return turnKind === 'decline_scoped' || turnKind === 'topic_refusal';
}

export function isWholeDeclineTurnKind(
  turnKind: CandidateTurnKind | null | undefined,
): boolean {
  return turnKind === 'decline_whole';
}
