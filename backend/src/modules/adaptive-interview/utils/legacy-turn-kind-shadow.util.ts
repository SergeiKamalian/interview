import type {
  CandidateTurnClassifierInput,
  CandidateTurnKind,
  TopicOpenerReadiness,
} from '../types/candidate-turn-classifier.types';
import {
  legacyClassifyTopicOpenerResponse,
  legacyIsAnswerFormatClarification,
  legacyIsCandidateAskingForScope,
  legacyIsCandidateDecliningKnowledge,
  legacyIsFullQuestionDecline,
  legacyIsScopedTopicDecline,
  legacyIsTargetedTopicRefusal,
} from './legacy-intent-regex.util';

export type LegacyTurnKindShadow = {
  turnKind: CandidateTurnKind | null;
  openerReadiness: TopicOpenerReadiness | null;
  signals: string[];
};

/** Best-effort legacy regex classification for shadow/divergence logging only. */
export function inferLegacyTurnKindShadow(
  input: CandidateTurnClassifierInput,
): LegacyTurnKindShadow {
  const answer = input.candidateAnswer.trim();
  const signals: string[] = [];

  if (!answer) {
    return { turnKind: 'off_topic', openerReadiness: null, signals: ['empty_answer'] };
  }

  if (input.messageKind === 'topic_opener_answer') {
    const readiness = legacyClassifyTopicOpenerResponse(answer);
    signals.push(`topic_opener:${readiness}`);

    if (readiness === 'declined') {
      return {
        turnKind: 'decline_whole',
        openerReadiness: 'declined',
        signals,
      };
    }

    return {
      turnKind: 'substantive_answer',
      openerReadiness: readiness,
      signals,
    };
  }

  if (legacyIsFullQuestionDecline(answer)) {
    signals.push('legacyIsFullQuestionDecline');
    return { turnKind: 'decline_whole', openerReadiness: null, signals };
  }

  if (legacyIsTargetedTopicRefusal(answer)) {
    signals.push('legacyIsTargetedTopicRefusal');
    return { turnKind: 'topic_refusal', openerReadiness: null, signals };
  }

  if (legacyIsScopedTopicDecline(answer)) {
    signals.push('legacyIsScopedTopicDecline');
    return { turnKind: 'decline_scoped', openerReadiness: null, signals };
  }

  if (legacyIsAnswerFormatClarification(answer)) {
    signals.push('legacyIsAnswerFormatClarification');
    return { turnKind: 'format_clarification', openerReadiness: null, signals };
  }

  if (
    input.messageKind === 'follow_up_answer' &&
    (legacyIsCandidateAskingForScope(answer) ||
      looksLikeLegacyClarificationQuestion(answer))
  ) {
    if (legacyIsCandidateAskingForScope(answer)) {
      signals.push('legacyIsCandidateAskingForScope');
    }
    if (looksLikeLegacyClarificationQuestion(answer)) {
      signals.push('looksLikeClarificationQuestion');
    }
    return { turnKind: 'scope_clarification', openerReadiness: null, signals };
  }

  if (legacyIsCandidateDecliningKnowledge(answer)) {
    signals.push('legacyIsCandidateDecliningKnowledge');
    return { turnKind: 'decline_whole', openerReadiness: null, signals };
  }

  return { turnKind: 'substantive_answer', openerReadiness: null, signals };
}

export function legacyTurnKindMatchesExpected(
  legacy: LegacyTurnKindShadow,
  expectedTurnKind: CandidateTurnKind,
): boolean {
  return legacy.turnKind === expectedTurnKind;
}

function looksLikeLegacyClarificationQuestion(text: string): boolean {
  const normalized = text.trim();
  if (!normalized || normalized.length > 220 || !/\?\s*$/.test(normalized)) {
    return false;
  }

  if (normalized.length > 140 && /[.!]\s+\S/.test(normalized)) {
    return false;
  }

  return true;
}
