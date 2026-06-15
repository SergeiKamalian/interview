import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';

const DECLINE_PATTERNS: RegExp[] = [
  /ничего\s+не\s+знаю/i,
  /не\s+знаю/i,
  /не\s+очень\s+(хорошо\s+)?понимаю/i,
  /не\s+понимаю/i,
  /плохо\s+понимаю/i,
  /слабо\s+понимаю/i,
  /не\s+разбираюсь/i,
  /плохо\s+разбираюсь/i,
  /без\s+понятия/i,
  /не\s+в\s+курсе/i,
  /затрудняюсь\s+ответить/i,
  /не\s+могу\s+ответить/i,
  /не\s+уверен(?:а)?(?:\s*,?\s*что\s+понимаю)?/i,
  /\bdon'?t\s+know\b/i,
  /\bdo\s+not\s+know\b/i,
  /\bno\s+idea\b/i,
  /\bi\s+don'?t\s+know\s+anything\b/i,
  /\bi\s+don'?t\s+really\s+understand\b/i,
  /\bnot\s+sure\s+i\s+understand\b/i,
];

/** Declines only one sub-aspect, not the whole question (e.g. "на это не смогу ответить"). */
const SCOPED_DECLINE_PATTERNS: RegExp[] = [
  /на\s+эт[оаеу]/i,
  /вряд\s+ли\s+(?:смогу|ответ)/i,
  /не\s+смогу\s+ответить/i,
  /(?:не\s+)?могу\s+ответить\s+на\s+это/i,
  /именно\s+эт[оа]/i,
  /про\s+эт[оа]\s+(?:я\s+)?(?:не|вряд)/i,
];

/** Fast local heuristic — shortcut before AI evaluate_turn. */
export function isCandidateDecliningKnowledge(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized) {
    return false;
  }

  return DECLINE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isScopedTopicDecline(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized) {
    return false;
  }

  return SCOPED_DECLINE_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** Whole-question refusal — not a scoped "can't answer this part". */
export function isFullQuestionDecline(answer: string): boolean {
  if (isScopedTopicDecline(answer)) {
    return false;
  }

  return isCandidateDecliningKnowledge(answer);
}

/** Regex and/or AI disposition from evaluate_turn. */
export function shouldSkipFollowUps(input: {
  answer: string;
  aiDisposition?: CandidateAnswerDisposition | null;
  /** Follow-ups already used on this main question (planned/asked/answered). */
  followUpsUsedForQuestion?: number;
}): boolean {
  if (isFullQuestionDecline(input.answer)) {
    return true;
  }

  if (input.aiDisposition === 'declined') {
    return !isScopedTopicDecline(input.answer);
  }

  // Give at least one redirect/clarification before stopping on AI "confused".
  if (input.aiDisposition === 'confused') {
    return (input.followUpsUsedForQuestion ?? 0) >= 1;
  }

  return false;
}

export function resolveSkipFollowUpReason(input: {
  answer: string;
  aiDisposition?: CandidateAnswerDisposition | null;
}): string {
  if (isFullQuestionDecline(input.answer)) {
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
