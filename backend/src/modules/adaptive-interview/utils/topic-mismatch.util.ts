import type { AdaptiveCheckpointDefinition } from '../types/adaptive-interview-context.types';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import { isScopeClarificationTurn } from './candidate-clarification.util';
import type { ConfusionPair } from '../types/checkpoint-evaluation-hints.type';
import { countMatchedConcepts } from './text-evidence-overlap.util';
import { hasTransitiveRedirectExhausted, hasWrongTopicAnchorTerms } from './transitive-checkpoint-floors.util';

export type TopicMismatchCheckpointResult = {
  checkpointKey: string;
  status: string;
  scoreAwarded: number;
  rationale?: string | null;
};

export type TopicMismatchDetection = {
  isMismatch: boolean;
  answeredCheckpointKey: string | null;
  expectedCheckpointKey: string;
  confidence: number;
  reason: string;
};

export function inferExpectedCheckpointKey(input: {
  checkpoints: AdaptiveCheckpointDefinition[];
  targetCheckpointKey?: string | null;
  questionText?: string;
}): string | null {
  if (input.targetCheckpointKey) {
    return input.targetCheckpointKey;
  }

  const sorted = [...input.checkpoints].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );

  return sorted[0]?.checkpointKey ?? null;
}

export function detectTopicMismatch(input: {
  expectedCheckpointKey: string;
  latestCandidateAnswer: string;
  checkpoints: AdaptiveCheckpointDefinition[];
  checkpointResults?: TopicMismatchCheckpointResult[];
  checkpointStates?: Array<{
    checkpointKey: string;
    rationale?: string | null;
    followUpCount?: number;
  }>;
  candidateDispositionFromAi?: CandidateAnswerDisposition | null;
  candidateTurnKind?: CandidateTurnKind | null;
  isTargetedFollowUp?: boolean;
  isFollowUpContext?: boolean;
}): TopicMismatchDetection {
  const answer = input.latestCandidateAnswer.trim();
  const inFollowUpDialogue =
    input.isTargetedFollowUp === true || input.isFollowUpContext === true;

  if (
    isScopeClarificationTurn({
      candidateTurnKind: input.candidateTurnKind,
      aiDisposition: input.candidateDispositionFromAi,
    })
  ) {
    return {
      isMismatch: false,
      answeredCheckpointKey: null,
      expectedCheckpointKey: input.expectedCheckpointKey,
      confidence: 0,
      reason: 'scope_clarification_meta_turn',
    };
  }

  const expectedCheckpoint = input.checkpoints.find(
    (checkpoint) => checkpoint.checkpointKey === input.expectedCheckpointKey,
  );
  const expectedState = input.checkpointStates?.find(
    (state) => state.checkpointKey === input.expectedCheckpointKey,
  );

  if (
    expectedState &&
    hasTransitiveRedirectExhausted(expectedState.rationale)
  ) {
    return {
      isMismatch: false,
      answeredCheckpointKey: null,
      expectedCheckpointKey: input.expectedCheckpointKey,
      confidence: 0,
      reason: 'redirect_already_used',
    };
  }

  if (!answer || !expectedCheckpoint) {
    return {
      isMismatch: false,
      answeredCheckpointKey: null,
      expectedCheckpointKey: input.expectedCheckpointKey,
      confidence: 0,
      reason: 'insufficient_input',
    };
  }

  const confusionPair = findConfusionPair(
    expectedCheckpoint.evaluationHints?.confusionPairs,
    input.expectedCheckpointKey,
  );
  const anchorMismatch = detectAnchorMismatch(
    answer,
    expectedCheckpoint,
    confusionPair,
  );
  if (anchorMismatch) {
    return anchorMismatch;
  }

  const coverageMismatch = detectCoverageMismatch(
    input.expectedCheckpointKey,
    input.checkpointResults,
    input.checkpoints,
  );
  if (coverageMismatch) {
    return coverageMismatch;
  }

  const conceptMismatch = detectConceptOverlapMismatch(
    answer,
    input.expectedCheckpointKey,
    input.checkpoints,
  );
  if (conceptMismatch) {
    return conceptMismatch;
  }

  return {
    isMismatch: false,
    answeredCheckpointKey: null,
    expectedCheckpointKey: input.expectedCheckpointKey,
    confidence: 0,
    reason: 'no_mismatch',
  };
}

function findConfusionPair(
  pairs: ConfusionPair[] | undefined,
  expectedCheckpointKey: string,
): ConfusionPair | undefined {
  return pairs?.find((pair) => pair.checkpointKey === expectedCheckpointKey);
}

function detectAnchorMismatch(
  answer: string,
  expectedCheckpoint: AdaptiveCheckpointDefinition,
  confusionPair: ConfusionPair | undefined,
): TopicMismatchDetection | null {
  const expectedTerms =
    confusionPair?.anchorTermsExpected ??
    expectedCheckpoint.evaluationHints?.mustConcepts?.slice(0, 4) ??
    [];
  const wrongTerms = confusionPair?.anchorTermsWrongTopic ?? [];

  const hasExpected = hasWrongTopicAnchorTerms(answer, expectedTerms);
  const hasWrong = hasWrongTopicAnchorTerms(answer, wrongTerms);

  if (!hasWrong || hasExpected) {
    return null;
  }

  const answeredCheckpointKey =
    confusionPair?.oftenConfusedWith.find((key) =>
      inputCheckpointHasConceptOverlap(answer, key),
    ) ?? confusionPair?.oftenConfusedWith[0] ?? null;

  return {
    isMismatch: true,
    answeredCheckpointKey,
    expectedCheckpointKey: expectedCheckpoint.checkpointKey,
    confidence: 0.85,
    reason: 'anchor_terms_wrong_topic',
  };
}

function inputCheckpointHasConceptOverlap(
  answer: string,
  checkpointKey: string,
): boolean {
  return checkpointKey.length > 0 && answer.toLowerCase().includes(
    checkpointKey.replace(/_/g, ' '),
  );
}

function detectCoverageMismatch(
  expectedCheckpointKey: string,
  checkpointResults: TopicMismatchCheckpointResult[] | undefined,
  checkpoints: AdaptiveCheckpointDefinition[],
): TopicMismatchDetection | null {
  if (!checkpointResults?.length) {
    return null;
  }

  const expectedResult = checkpointResults.find(
    (result) => result.checkpointKey === expectedCheckpointKey,
  );
  if (!expectedResult) {
    return null;
  }

  const expectedCoverage = parseCoverageLevel(expectedResult.rationale);
  if (expectedCoverage !== 'none' && expectedCoverage !== 'low') {
    return null;
  }

  let bestOther: TopicMismatchCheckpointResult | null = null;
  let bestCoverageRank = rankCoverage(expectedCoverage);

  for (const result of checkpointResults) {
    if (result.checkpointKey === expectedCheckpointKey) {
      continue;
    }

    const coverage = parseCoverageLevel(result.rationale);
    if (
      (coverage === 'high' || coverage === 'medium') &&
      rankCoverage(coverage) > bestCoverageRank
    ) {
      bestOther = result;
      bestCoverageRank = rankCoverage(coverage);
    }
  }

  if (!bestOther) {
    return null;
  }

  return {
    isMismatch: true,
    answeredCheckpointKey: bestOther.checkpointKey,
    expectedCheckpointKey,
    confidence: 0.75,
    reason: 'ai_coverage_mismatch',
  };
}

function detectConceptOverlapMismatch(
  answer: string,
  expectedCheckpointKey: string,
  checkpoints: AdaptiveCheckpointDefinition[],
): TopicMismatchDetection | null {
  const expectedCheckpoint = checkpoints.find(
    (checkpoint) => checkpoint.checkpointKey === expectedCheckpointKey,
  );
  if (!expectedCheckpoint) {
    return null;
  }

  const expectedMatched = countMatchedConcepts(
    answer,
    expectedCheckpoint.evaluationHints?.mustConcepts ?? [],
  );

  let bestKey: string | null = null;
  let bestMatched = expectedMatched;

  for (const checkpoint of checkpoints) {
    if (checkpoint.checkpointKey === expectedCheckpointKey) {
      continue;
    }

    const matched = countMatchedConcepts(
      answer,
      checkpoint.evaluationHints?.mustConcepts ?? [],
    );

    if (matched >= 2 && matched > bestMatched + 1) {
      bestMatched = matched;
      bestKey = checkpoint.checkpointKey;
    }
  }

  if (!bestKey || expectedMatched >= 1) {
    return null;
  }

  return {
    isMismatch: true,
    answeredCheckpointKey: bestKey,
    expectedCheckpointKey,
    confidence: 0.7,
    reason: 'must_concepts_overlap_other_checkpoint',
  };
}

function parseCoverageLevel(
  rationale: string | null | undefined,
): 'none' | 'low' | 'medium' | 'high' {
  const match = /coverage\s*=\s*(none|low|medium|high)/i.exec(rationale ?? '');
  const value = match?.[1]?.toLowerCase();

  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  return 'none';
}

function rankCoverage(level: 'none' | 'low' | 'medium' | 'high'): number {
  switch (level) {
    case 'high':
      return 4;
    case 'medium':
      return 3;
    case 'low':
      return 2;
    default:
      return 1;
  }
}

export function buildTopicRedirectFollowUpQuestion(input: {
  expectedCheckpointTitle: string;
  answeredCheckpointTitle?: string | null;
}): string {
  const expectedTopic = humanizeCheckpointTitle(input.expectedCheckpointTitle);
  const answeredTopic = input.answeredCheckpointTitle
    ? humanizeCheckpointTitle(input.answeredCheckpointTitle)
    : null;

  if (answeredTopic) {
    return `Похоже, вы описали ${answeredTopic}, а вопрос был про ${expectedTopic}. Расскажете именно про ${expectedTopic}?`;
  }

  return `Похоже, ответ ушёл в другую тему. Можете рассказать именно про ${expectedTopic}?`;
}

function humanizeCheckpointTitle(title: string): string {
  const normalized = title.trim();
  if (/useEffect/i.test(normalized)) {
    return 'useEffect';
  }
  if (/useState/i.test(normalized)) {
    return 'useState';
  }

  const withoutRubricLead = normalized
    .replace(/^понимает[,]?\s+/i, '')
    .replace(/^объясняет\s+/i, '')
    .replace(/^знает\s+/i, '')
    .trim();

  const topic = withoutRubricLead || normalized;
  return topic.charAt(0).toLowerCase() + topic.slice(1);
}

export function appendTopicRedirectPendingRationale(
  rationale: string | null | undefined,
): string {
  const base = (rationale ?? '').trim();
  const suffix = 'redirect=pending, topic mismatch — not finalized missed';

  return base ? `${base} ${suffix}` : suffix;
}

export function appendTopicRedirectAskedRationale(
  rationale: string | null | undefined,
): string {
  const base = (rationale ?? '')
    .trim()
    .replace(/\s*redirect\s*=\s*\w+/gi, '')
    .trim();
  const suffix = 'redirect=asked';

  return base ? `${base} ${suffix}` : suffix;
}
