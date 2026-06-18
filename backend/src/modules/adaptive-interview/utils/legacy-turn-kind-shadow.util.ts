import {
  isAnswerFormatClarification,
  isCandidateAskingForScope,
} from './candidate-clarification.util';
import {
  isCandidateDecliningKnowledge,
  isFullQuestionDecline,
  isScopedTopicDecline,
  isTargetedTopicRefusal,
} from './candidate-decline.util';
import { classifyTopicOpenerResponse } from './topic-opener.util';
import type {
  CandidateTurnClassifierInput,
  CandidateTurnKind,
  TopicOpenerReadiness,
} from '../types/candidate-turn-classifier.types';

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
    const readiness = classifyTopicOpenerResponse(answer);
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

  if (isFullQuestionDecline(answer)) {
    signals.push('isFullQuestionDecline');
    return { turnKind: 'decline_whole', openerReadiness: null, signals };
  }

  if (isTargetedTopicRefusal(answer)) {
    signals.push('isTargetedTopicRefusal');
    return { turnKind: 'topic_refusal', openerReadiness: null, signals };
  }

  if (isScopedTopicDecline(answer)) {
    signals.push('isScopedTopicDecline');
    return { turnKind: 'decline_scoped', openerReadiness: null, signals };
  }

  if (isAnswerFormatClarification(answer)) {
    signals.push('isAnswerFormatClarification');
    return { turnKind: 'format_clarification', openerReadiness: null, signals };
  }

  if (
    input.messageKind === 'follow_up_answer' &&
    (isCandidateAskingForScope(answer) ||
      looksLikeLegacyClarificationQuestion(answer))
  ) {
    if (isCandidateAskingForScope(answer)) {
      signals.push('isCandidateAskingForScope');
    }
    if (looksLikeLegacyClarificationQuestion(answer)) {
      signals.push('looksLikeClarificationQuestion');
    }
    return { turnKind: 'scope_clarification', openerReadiness: null, signals };
  }

  if (isCandidateDecliningKnowledge(answer)) {
    signals.push('isCandidateDecliningKnowledge');
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
