import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import {
  isScopeClarificationTurnKind,
  mapTurnKindToDisposition,
} from './map-turn-kind-to-disposition.util';
import { isCandidateDecliningKnowledge, isTargetedTopicRefusal } from './candidate-decline.util';
import { resolveProbePhrasesForCandidate } from './probe-policy.util';

/** Max candidate scope-clarification turns before moving to the next main question. */
export const MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION = 2;

const SCOPE_ASK_PATTERNS: RegExp[] = [
  /что\s+именно/i,
  /что\s+конкретно/i,
  /что\s+вы\s+имеете\s+в\s+виду/i,
  /что\s+имеете\s+в\s+виду/i,
  /имеете\s+в\s+виду/i,
  /имеется\s+в\s+виду/i,
  /можете\s+конкретн/i,
  /уточните\s+(?:вопрос|что|какой)/i,
  /о\s+ч[её]м\s+именно/i,
  /к\s+чему\s+(?:вопрос|именно)/i,
  /какой\s+именно/i,
  /вы\s+про\s+.+\s+(?:или|ли)\s/i,
  /вы\s+имеете\s+в\s+виду/i,
  /вы\s+имели\s+в\s+виду/i,
  /вы\s+говорите\s+(?:о|про)/i,
  /речь\s+(?:идёт\s+)?(?:о|про)/i,
  /это\s+(?:имеется\s+в\s+виду\s+)?(?:про|о)\s+/i,
  /правильно\s+(?:я\s+)?(?:понимаю|понял)/i,
  /верно\s*,?\s*что\s+вы/i,
  /could\s+you\s+clarify/i,
  /what\s+do\s+you\s+mean/i,
  /which\s+one\s+do\s+you\s+mean/i,
  /are\s+you\s+asking\s+about/i,
  /you\s+mean\s+/i,
  /(?:коротко|кратко|сжато|по делу|подробн|детал|на пальцах)/i,
  /(?:brief|detailed|high[- ]level)/i,
  /(?:как|how)\s+(?:именно\s+)?(?:ответить|answer)/i,
  /вам\s+нужно\s+(?:чтобы\s+)?(?:я\s+)?(?:ответил|рассказал)/i,
];

const VAGUE_FOLLOW_UP_PATTERNS: RegExp[] = [
  /уточните\s+технические\s+детали/i,
  /можете\s+уточнить\s+технические\s+детали/i,
  /уточните\s+детали/i,
  /технические\s+детали\?/i,
  /что\s+сможете\s+добавить/i,
];

/** Legacy phrase matching — shadow mode and clarification reply templates only. */
export function isCandidateAskingForScope(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized) {
    return false;
  }

  if (isCandidateDecliningKnowledge(normalized) || isTargetedTopicRefusal(normalized)) {
    return false;
  }

  return SCOPE_ASK_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isVagueFollowUpQuestion(followUpQuestion: string): boolean {
  const normalized = followUpQuestion.trim();
  if (!normalized) {
    return false;
  }

  return VAGUE_FOLLOW_UP_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isAnswerFormatClarification(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized || !/\?\s*$/.test(normalized)) {
    return false;
  }

  return (
    /(?:коротко|кратко|сжато|по делу|подробн|детал|на пальцах)/i.test(
      normalized,
    ) ||
    /(?:brief|detailed|high[- ]level)/i.test(normalized) ||
    /(?:как|how)\s+(?:именно\s+)?(?:ответить|answer)/i.test(normalized) ||
    /вам\s+нужно\s+(?:чтобы\s+)?(?:я\s+)?(?:ответил|рассказал)/i.test(
      normalized,
    )
  );
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

export function buildClarificationFollowUpQuestion(input: {
  checkpointTitle: string;
  missingMustConcepts: string[];
  hints?: CheckpointEvaluationHints | null;
  candidateScopeQuestion: string;
  candidateTurnKind?: CandidateTurnKind | null;
  previousFollowUpQuestion?: string | null;
  seed?: number;
}): string {
  const conceptList =
    resolveProbePhrasesForCandidate(
      input.hints,
      input.missingMustConcepts,
      2,
    ) ?? input.missingMustConcepts.slice(0, 2).join(', ');

  const scopeQuestion = input.candidateScopeQuestion.trim();
  const previousFollowUp = input.previousFollowUpQuestion?.trim() ?? '';

  if (
    input.candidateTurnKind === 'format_clarification' ||
    isAnswerFormatClarification(scopeQuestion)
  ) {
    return buildFormatClarificationReply(previousFollowUp, conceptList);
  }

  const orMatch = /вы\s+про\s+(.+?)\s+(?:или|ли)\s+(.+?)[\?\.]?$/i.exec(
    scopeQuestion,
  );

  const isTopicConfirmation =
    isCandidateAskingForScope(scopeQuestion) ||
    /вы\s+говорите\s+(?:о|про)/i.test(scopeQuestion) ||
    /(?:^|\s)да\?\s*$/i.test(scopeQuestion);

  if (orMatch?.[1] && orMatch?.[2]) {
    const left = orMatch[1].trim();
    const right = orMatch[2].trim();
    return `Нет, речь про ${conceptList || input.checkpointTitle}, а не про ${right}. Можете рассказать именно про ${conceptList || left}?`;
  }

  if (isTopicConfirmation && conceptList) {
    return `Да, именно про ${conceptList}. Как вы это понимаете?`;
  }

  if (isTopicConfirmation) {
    const topic = input.checkpointTitle.trim() || 'эту часть Fiber';
    return `Да, именно про ${topic}. Расскажите своими словами?`;
  }

  if (conceptList) {
    return `Имею в виду ${conceptList} — расскажите, как вы это понимаете?`;
  }

  const topic = input.checkpointTitle.trim() || 'эту тему';
  return `Имею в виду ${topic} — уточните, пожалуйста, что знаете по этому пункту?`;
}

function buildFormatClarificationReply(
  previousFollowUp: string,
  conceptList: string,
): string {
  const askCore = extractFollowUpAskCore(previousFollowUp);
  if (askCore) {
    return `Кратко и по существу — ${askCore}.`;
  }

  if (conceptList) {
    return `Кратко и по существу — про ${conceptList}. Как вы это видите?`;
  }

  return 'Кратко и по существу — ответьте на мой предыдущий вопрос, своими словами.';
}

function extractFollowUpAskCore(previousFollowUp: string): string | null {
  if (!previousFollowUp) {
    return null;
  }

  const match =
    /(?:расскажите|уточните|объясните|можете\s+рассказать|как\s+вы\s+понимаете)[,:]?\s*(.+)$/i.exec(
      previousFollowUp,
    );
  const core = match?.[1]?.trim() ?? previousFollowUp.trim();

  if (core.length < 12) {
    return null;
  }

  const normalized =
    core.charAt(0).toLowerCase() + core.slice(1).replace(/\?\s*$/, '');
  return normalized;
}

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
