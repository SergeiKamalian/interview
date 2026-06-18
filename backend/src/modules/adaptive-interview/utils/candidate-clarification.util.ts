import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import {
  isScopeClarificationTurnKind,
  mapTurnKindToDisposition,
} from './map-turn-kind-to-disposition.util';
import { resolveProbePhrasesForCandidate } from './probe-policy.util';

/** Max candidate scope-clarification turns before moving to the next main question. */
export const MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION = 2;

const VAGUE_FOLLOW_UP_PATTERNS: RegExp[] = [
  /уточните\s+технические\s+детали/i,
  /можете\s+уточнить\s+технические\s+детали/i,
  /уточните\s+детали/i,
  /технические\s+детали\?/i,
  /что\s+сможете\s+добавить/i,
];

export function isVagueFollowUpQuestion(followUpQuestion: string): boolean {
  const normalized = followUpQuestion.trim();
  if (!normalized) {
    return false;
  }

  return VAGUE_FOLLOW_UP_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function resolveScopeClarificationDisposition(input: {
  candidateTurnKind?: CandidateTurnKind | null;
  aiDisposition?: CandidateAnswerDisposition | null;
}): CandidateAnswerDisposition | null {
  if (input.candidateTurnKind) {
    return mapTurnKindToDisposition(input.candidateTurnKind);
  }

  return input.aiDisposition ?? null;
}

export function isScopeClarificationTurn(input: {
  candidateTurnKind?: CandidateTurnKind | null;
  aiDisposition?: CandidateAnswerDisposition | null;
}): boolean {
  if (input.candidateTurnKind) {
    return isScopeClarificationTurnKind(input.candidateTurnKind);
  }

  return input.aiDisposition === 'asked_for_scope';
}

export function countScopeClarificationTurns(input: {
  localTurns: AdaptiveInterviewContextPacket['localTurns'];
  latestCandidateAnswer?: string | null;
  candidateDispositionFromAi?: CandidateAnswerDisposition | null;
  candidateTurnKind?: CandidateTurnKind | null;
  isTargetedFollowUp?: boolean;
  isFollowUpContext?: boolean;
}): number {
  let count = 0;

  for (const turn of input.localTurns) {
    if (turn.role !== 'candidate') {
      continue;
    }

    if (looksLikeClarificationQuestion(turn.content)) {
      count += 1;
    }
  }

  const latest = input.latestCandidateAnswer?.trim() ?? '';
  if (
    latest &&
    !input.localTurns.some(
      (turn) => turn.role === 'candidate' && turn.content.trim() === latest,
    ) &&
    isScopeClarificationTurn({
      candidateTurnKind: input.candidateTurnKind,
      aiDisposition: input.candidateDispositionFromAi,
    })
  ) {
    count += 1;
  }

  return count;
}

/**
 * Deterministic fallback when follow-up LLM is off or failed.
 * Intent (scope vs format vs confirmation) comes from classifier turn_kind — not regex on candidate text.
 */
export function buildClarificationTemplateFallback(input: {
  checkpointTitle: string;
  missingMustConcepts: string[];
  hints?: CheckpointEvaluationHints | null;
  candidateTurnKind?: CandidateTurnKind | null;
}): string {
  const conceptList =
    resolveProbePhrasesForCandidate(
      input.hints,
      input.missingMustConcepts,
      2,
    ) ?? input.missingMustConcepts.slice(0, 2).join(', ');

  if (input.candidateTurnKind === 'format_clarification') {
    const topic = conceptList || input.checkpointTitle.trim() || 'эту тему';
    return `Кратко и по существу — про ${topic}. Как вы это видите?`;
  }

  if (conceptList) {
    return `Имею в виду ${conceptList} — расскажите, как вы это понимаете?`;
  }

  const topic = input.checkpointTitle.trim() || 'эту тему';
  return `Имею в виду ${topic} — расскажите, как вы это понимаете?`;
}

/** @deprecated Use buildClarificationTemplateFallback — kept for import stability during migration */
export const buildClarificationFollowUpQuestion = buildClarificationTemplateFallback;

function looksLikeClarificationQuestion(text: string): boolean {
  const normalized = text.trim();
  if (!normalized || normalized.length > 220) {
    return false;
  }

  if (!/\?\s*$/.test(normalized)) {
    return false;
  }

  // Substantive multi-sentence explanations are answers, not meta-clarification.
  if (normalized.length > 140 && /[.!]\s+\S/.test(normalized)) {
    return false;
  }

  return true;
}
