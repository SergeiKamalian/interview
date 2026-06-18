import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import {
  FollowUpPolicyDecision,
  FollowUpPolicyInput,
} from '../types/follow-up-planner.types';
import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import { parseDepthFromRationale } from './checkpoint-depth.util';
import {
  normalizeFollowUpQuestionForCandidate,
  rephraseCheckpointTitleForFollowUp,
} from './checkpoint-expected-speech.util';
import {
  buildClarificationFollowUpQuestion,
  countScopeClarificationTurns,
  isScopeClarificationTurn,
  MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION,
} from './candidate-clarification.util';
import {
  resolveSkipFollowUpReason,
  shouldSkipFollowUps,
} from './candidate-decline.util';
import {
  inferFollowUpAnswerTone,
  pickFollowUpAcknowledgment,
  pickFollowUpQuestionStem,
} from './follow-up-acknowledgment.util';
import {
  allocateFollowUpBudget,
  buildBudgetAllocatorCandidate,
  type FollowUpBudgetConfig,
  hasPendingRequiredProbe,
  maxFollowUpsForCheckpoint,
} from './follow-up-budget-allocator.util';
import {
  buildProbeFollowUpQuestion,
  buildResidualGapFollowUpQuestion,
  getMissingMustConcepts,
  isExhaustedPartialForFollowUp,
  isWithinCheckpointFollowUpBudget,
  probeRequired,
  residualGapProbeRequired,
} from './probe-policy.util';
import { isHighPriorityForStagnationBypass } from './probe-priority.util';
import {
  buildTopicRedirectFollowUpQuestion,
  detectTopicMismatch,
  inferExpectedCheckpointKey,
} from './topic-mismatch.util';
import { hasTransitiveRedirectExhausted } from './transitive-checkpoint-floors.util';

const ELIGIBLE_STATUSES = new Set<CheckpointStateStatus>([
  'missed',
  'unclear',
  'partial',
]);

function getCheckpointEvidenceText(
  input: FollowUpPolicyInput,
  checkpointKey: string,
): string {
  return (
    input.checkpointEvidenceTextByKey?.[checkpointKey] ??
    input.latestCandidateAnswer ??
    ''
  );
}

function resolveBudgetConfig(input: FollowUpPolicyInput): FollowUpBudgetConfig {
  return {
    maxFollowUpsPerQuestion: input.maxFollowUpsPerQuestion,
    maxFollowUpsHeavyCheckpoint: input.maxFollowUpsHeavyCheckpoint ?? 2,
    heavyCheckpointWeightRatio: input.heavyCheckpointWeightRatio ?? 0.2,
    minPriorityToProbe: input.minPriorityToProbe ?? 0.15,
  };
}

export function evaluateFollowUpPolicy(
  input: FollowUpPolicyInput,
): FollowUpPolicyDecision {
  if (
    shouldSkipFollowUps({
      answer: input.latestCandidateAnswer ?? '',
      aiDisposition: input.candidateDispositionFromAi,
      candidateTurnKind: input.candidateTurnKind,
      followUpsUsedForQuestion: input.followUpsUsedForQuestion,
    })
  ) {
    return {
      shouldAskFollowUp: false,
      reason: resolveSkipFollowUpReason({
        answer: input.latestCandidateAnswer ?? '',
        aiDisposition: input.candidateDispositionFromAi,
        candidateTurnKind: input.candidateTurnKind,
      }),
    };
  }

  if (input.checkpointStates.some((state) => state.needsManualReview)) {
    return {
      shouldAskFollowUp: false,
      reason: 'manual_review_required',
    };
  }

  if (input.followUpsUsedForQuestion >= input.maxFollowUpsPerQuestion) {
    return {
      shouldAskFollowUp: false,
      reason: 'question_follow_up_limit_reached',
    };
  }

  const checkpointByKey = new Map(
    input.checkpoints.map((checkpoint) => [checkpoint.checkpointKey, checkpoint]),
  );

  const clarificationDecision = resolveClarificationFollowUpDecision(
    input,
    checkpointByKey,
  );
  if (clarificationDecision) {
    return clarificationDecision;
  }

  const topicRedirectDecision = resolveTopicRedirectDecision(input, checkpointByKey);
  if (topicRedirectDecision) {
    return topicRedirectDecision;
  }

  const budgetConfig = resolveBudgetConfig(input);
  const allocatorCandidates = buildAllocatorCandidates(input, budgetConfig);
  const stagnationLimit = input.stagnationLimit ?? 2;
  const recentDeltas = input.recentScoreDeltas ?? [];
  const stagnationTriggered =
    recentDeltas.length >= stagnationLimit &&
    recentDeltas.slice(-stagnationLimit).every((delta) => delta <= 0);

  if (stagnationTriggered) {
    const bypassStagnation = allocatorCandidates.some((candidate) =>
      isHighPriorityForStagnationBypass(
        candidate.priorityResult,
        budgetConfig.minPriorityToProbe,
      ),
    );

    if (!bypassStagnation) {
      return {
        shouldAskFollowUp: false,
        reason: 'follow_up_stagnation',
      };
    }
  }

  const questionScore = input.checkpointStates.reduce(
    (total, state) => total + state.scoreAwarded,
    0,
  );
  const questionScoreSufficient =
    input.questionMaxScore > 0 &&
    questionScore >= input.questionMaxScore * input.questionScoreSufficientRatio;
  const hasMentionOnlyMissed = input.checkpointStates.some((state) => {
    if (state.status !== 'missed') {
      return false;
    }

    const depth = parseDepthFromRationale(state.rationale ?? null);
    return depth === 'mention_only' || depth === 'heard_of';
  });
  const pendingRequiredProbe = hasPendingRequiredProbe({
    candidates: allocatorCandidates,
  });
  const pendingTopicRedirect = hasPendingTopicRedirect(input);
  const pendingScopeClarification = hasPendingScopeClarification(input);

  if (
    questionScoreSufficient &&
    !hasMentionOnlyMissed &&
    !pendingRequiredProbe &&
    !pendingTopicRedirect &&
    !pendingScopeClarification
  ) {
    return {
      shouldAskFollowUp: false,
      reason: 'sufficient_question_score',
    };
  }

  const allocation = allocateFollowUpBudget({
    candidates: allocatorCandidates,
    followUpsUsedForQuestion: input.followUpsUsedForQuestion,
    config: budgetConfig,
    stickyTargetCheckpointKey: input.stickyTargetCheckpointKey,
    questionScoreSufficient,
  });

  if (!allocation.canProbe || !allocation.selectedCheckpointKey) {
    return {
      shouldAskFollowUp: false,
      reason: allocation.reason,
    };
  }

  const selectedCheckpoint = checkpointByKey.get(
    allocation.selectedCheckpointKey,
  );
  if (!selectedCheckpoint) {
    return {
      shouldAskFollowUp: false,
      reason: 'no_eligible_checkpoints',
    };
  }

  const selectedState = input.checkpointStates.find(
    (state) => state.checkpointKey === allocation.selectedCheckpointKey,
  );
  if (!selectedState) {
    return {
      shouldAskFollowUp: false,
      reason: 'no_eligible_checkpoints',
    };
  }

  const selectedEvidenceText = getCheckpointEvidenceText(
    input,
    allocation.selectedCheckpointKey,
  );
  const missingMustConcepts = getMissingMustConcepts(
    selectedCheckpoint.evaluationHints,
    selectedEvidenceText,
  );
  const isDepthProbe = probeRequired({
    checkpoint: selectedCheckpoint,
    state: selectedState,
    hints: selectedCheckpoint.evaluationHints,
    questionMaxScore: input.questionMaxScore,
    candidateEvidenceText: selectedEvidenceText,
    latestCandidateText: input.latestCandidateAnswer ?? '',
  });
  const isResidualProbe =
    !isDepthProbe &&
    residualGapProbeRequired({
      checkpoint: selectedCheckpoint,
      state: selectedState,
      hints: selectedCheckpoint.evaluationHints,
      questionMaxScore: input.questionMaxScore,
      candidateEvidenceText: selectedEvidenceText,
      latestCandidateText: input.latestCandidateAnswer ?? '',
    });

  return {
    shouldAskFollowUp: true,
    targetCheckpointKey: allocation.selectedCheckpointKey,
    checkpointTitle: selectedCheckpoint.title,
    checkpointExpected: selectedCheckpoint.expected,
    reason: isDepthProbe
      ? 'checkpoint_probe_required'
      : isResidualProbe
        ? 'checkpoint_residual_gap_probe'
        : allocation.reason,
    followUpKind: isDepthProbe
      ? 'depth_probe'
      : isResidualProbe
        ? 'residual_probe'
        : 'generic',
    missingMustConcepts,
  };
}

function resolveScopeTurnContext(input: FollowUpPolicyInput): {
  isTargetedFollowUp: boolean;
  isFollowUpContext: boolean;
} {
  return {
    isTargetedFollowUp: Boolean(input.stickyTargetCheckpointKey),
    isFollowUpContext:
      input.isFollowUpAnswer === true ||
      (input.followUpsUsedForQuestion ?? 0) > 0,
  };
}

function resolveClarificationFollowUpDecision(
  input: FollowUpPolicyInput,
  checkpointByKey: Map<string, FollowUpPolicyInput['checkpoints'][number]>,
): FollowUpPolicyDecision | null {
  const latestAnswer = input.latestCandidateAnswer ?? '';
  const scopeContext = resolveScopeTurnContext(input);
  const isScopeAsk = isScopeClarificationTurn({
    candidateTurnKind: input.candidateTurnKind,
    aiDisposition: input.candidateDispositionFromAi,
  });

  if (!isScopeAsk) {
    return null;
  }

  const targetKey =
    input.stickyTargetCheckpointKey ??
    inferExpectedCheckpointKey({
      checkpoints: input.checkpoints,
      targetCheckpointKey: input.stickyTargetCheckpointKey,
      questionText: input.questionText,
    });

  if (!targetKey) {
    return null;
  }

  const scopeTurnCount = countScopeClarificationTurns({
    localTurns: input.localTurns ?? [],
    latestCandidateAnswer: latestAnswer,
    candidateDispositionFromAi: input.candidateDispositionFromAi,
    candidateTurnKind: input.candidateTurnKind,
    isTargetedFollowUp:
      scopeContext.isTargetedFollowUp || Boolean(targetKey),
    isFollowUpContext: scopeContext.isFollowUpContext,
  });

  if (scopeTurnCount > MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION) {
    return {
      shouldAskFollowUp: false,
      reason: 'scope_clarification_exhausted',
    };
  }

  const checkpoint = checkpointByKey.get(targetKey);
  if (!checkpoint) {
    return null;
  }

  const state = input.checkpointStates.find(
    (item) => item.checkpointKey === targetKey,
  );
  if (!state) {
    return null;
  }

  const evidenceText = getCheckpointEvidenceText(input, targetKey);
  const missingMustConcepts = getMissingMustConcepts(
    checkpoint.evaluationHints,
    evidenceText,
  );

  return {
    shouldAskFollowUp: true,
    targetCheckpointKey: targetKey,
    checkpointTitle: checkpoint.title,
    checkpointExpected: checkpoint.expected,
    reason: 'candidate_asked_for_scope',
    followUpKind: 'clarification_redirect',
    missingMustConcepts,
  };
}

function hasPendingScopeClarification(input: FollowUpPolicyInput): boolean {
  const latestAnswer = input.latestCandidateAnswer ?? '';
  const scopeContext = resolveScopeTurnContext(input);
  const isScopeAsk = isScopeClarificationTurn({
    candidateTurnKind: input.candidateTurnKind,
    aiDisposition: input.candidateDispositionFromAi,
  });

  if (!isScopeAsk) {
    return false;
  }

  const scopeTurnCount = countScopeClarificationTurns({
    localTurns: input.localTurns ?? [],
    latestCandidateAnswer: latestAnswer,
    candidateDispositionFromAi: input.candidateDispositionFromAi,
    candidateTurnKind: input.candidateTurnKind,
    isTargetedFollowUp: scopeContext.isTargetedFollowUp,
    isFollowUpContext: scopeContext.isFollowUpContext,
  });

  return scopeTurnCount <= MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION;
}

function resolveTopicRedirectDecision(
  input: FollowUpPolicyInput,
  checkpointByKey: Map<string, FollowUpPolicyInput['checkpoints'][number]>,
): FollowUpPolicyDecision | null {
  const expectedCheckpointKey = inferExpectedCheckpointKey({
    checkpoints: input.checkpoints,
    targetCheckpointKey: input.stickyTargetCheckpointKey,
    questionText: input.questionText,
  });

  if (!expectedCheckpointKey) {
    return null;
  }

  const expectedState = input.checkpointStates.find(
    (state) => state.checkpointKey === expectedCheckpointKey,
  );
  if (
    expectedState &&
    hasTransitiveRedirectExhausted(expectedState.rationale)
  ) {
    return null;
  }

  const scopeContext = resolveScopeTurnContext(input);

  const mismatch = detectTopicMismatch({
    expectedCheckpointKey,
    latestCandidateAnswer: input.latestCandidateAnswer ?? '',
    checkpoints: input.checkpoints,
    checkpointResults: input.latestCheckpointResults,
    checkpointStates: input.checkpointStates,
    candidateDispositionFromAi: input.candidateDispositionFromAi,
    candidateTurnKind: input.candidateTurnKind,
    isTargetedFollowUp: scopeContext.isTargetedFollowUp,
    isFollowUpContext: scopeContext.isFollowUpContext,
  });

  if (
    isScopeClarificationTurn({
      candidateTurnKind: input.candidateTurnKind,
      aiDisposition: input.candidateDispositionFromAi,
    })
  ) {
    return null;
  }

  const shouldRedirect =
    !(
      expectedState &&
      hasTransitiveRedirectExhausted(expectedState.rationale)
    ) &&
    (mismatch.isMismatch ||
      input.candidateDispositionFromAi === 'misunderstood_question');

  if (!shouldRedirect) {
    return null;
  }

  const expectedCheckpoint = checkpointByKey.get(expectedCheckpointKey);
  if (!expectedCheckpoint) {
    return null;
  }

  return {
    shouldAskFollowUp: true,
    targetCheckpointKey: expectedCheckpointKey,
    checkpointTitle: expectedCheckpoint.title,
    checkpointExpected: expectedCheckpoint.expected,
    reason: 'topic_mismatch_redirect',
    followUpKind: 'topic_redirect',
    answeredCheckpointKey: mismatch.answeredCheckpointKey,
  };
}

function hasPendingTopicRedirect(input: FollowUpPolicyInput): boolean {
  const scopeContext = resolveScopeTurnContext(input);
  if (
    isScopeClarificationTurn({
      candidateTurnKind: input.candidateTurnKind,
      aiDisposition: input.candidateDispositionFromAi,
    })
  ) {
    return false;
  }

  if (input.candidateDispositionFromAi === 'misunderstood_question') {
    return true;
  }

  const expectedCheckpointKey = inferExpectedCheckpointKey({
    checkpoints: input.checkpoints,
    targetCheckpointKey: input.stickyTargetCheckpointKey,
    questionText: input.questionText,
  });

  if (!expectedCheckpointKey) {
    return false;
  }

  const expectedState = input.checkpointStates.find(
    (state) => state.checkpointKey === expectedCheckpointKey,
  );

  return /redirect\s*=\s*pending/i.test(expectedState?.rationale ?? '');
}

function buildAllocatorCandidates(
  input: FollowUpPolicyInput,
  budgetConfig: FollowUpBudgetConfig,
) {
  const checkpointByKey = new Map(
    input.checkpoints.map((checkpoint) => [checkpoint.checkpointKey, checkpoint]),
  );

  return input.checkpointStates
    .filter((state) => isEligibleCheckpointState(state))
    .filter((state) => {
      const checkpoint = checkpointByKey.get(state.checkpointKey);
      const candidateEvidenceText = getCheckpointEvidenceText(
        input,
        state.checkpointKey,
      );

      if (!checkpoint) {
        return !isExhaustedPartialCheckpoint(state);
      }

      return !isExhaustedPartialForFollowUp({
        state,
        checkpoint,
        hints: checkpoint.evaluationHints,
        questionMaxScore: input.questionMaxScore,
        candidateEvidenceText,
        latestCandidateText: input.latestCandidateAnswer ?? '',
      });
    })
    .filter((state) => {
      const checkpoint = checkpointByKey.get(state.checkpointKey);
      if (!checkpoint) {
        return true;
      }

      const candidateEvidenceText = getCheckpointEvidenceText(
        input,
        state.checkpointKey,
      );
      const perCheckpointCap = maxFollowUpsForCheckpoint({
        checkpoint,
        hints: checkpoint.evaluationHints,
        questionMaxScore: input.questionMaxScore,
        config: budgetConfig,
      });
      const needsResidual = residualGapProbeRequired({
        checkpoint,
        state,
        hints: checkpoint.evaluationHints,
        questionMaxScore: input.questionMaxScore,
        candidateEvidenceText,
        latestCandidateText: input.latestCandidateAnswer ?? '',
      });

      return isWithinCheckpointFollowUpBudget({
        state,
        maxFollowUpsPerCheckpoint: perCheckpointCap,
        residualGapProbeRequired: needsResidual,
      });
    })
    .map((state) => {
      const checkpoint = checkpointByKey.get(state.checkpointKey)!;

      return buildBudgetAllocatorCandidate({
        checkpoint,
        state,
        questionMaxScore: input.questionMaxScore,
        candidateEvidenceText: getCheckpointEvidenceText(
          input,
          state.checkpointKey,
        ),
        latestCandidateText: input.latestCandidateAnswer ?? '',
        config: budgetConfig,
      });
    });
}

function isEligibleCheckpointState(state: {
  status: CheckpointStateStatus;
  scoreAwarded: number;
  maxScore: number;
}): boolean {
  if (!ELIGIBLE_STATUSES.has(state.status)) {
    return false;
  }

  if (state.status === 'partial' && state.scoreAwarded >= state.maxScore) {
    return false;
  }

  return true;
}

export function buildNaturalTemplateFollowUp(input: {
  questionText: string;
  checkpointTitle?: string;
  checkpointExpected?: string;
  latestCandidateAnswer: string;
  candidateTurnKind?: CandidateTurnKind | null;
  previousFollowUpQuestions?: string[];
  seed?: number;
  missingMustConcepts?: string[];
  followUpKind?: 'depth_probe' | 'residual_probe' | 'topic_redirect' | 'clarification_redirect' | 'generic';
  evaluationHints?: CheckpointEvaluationHints | null;
  answeredCheckpointTitle?: string | null;
  targetScoreAwarded?: number;
  targetMaxScore?: number;
  targetRationale?: string | null;
}): string {
  const seed =
    input.seed ??
    (input.checkpointTitle ?? input.checkpointExpected ?? input.questionText)
      .length;
  const previousFollowUpQuestions = input.previousFollowUpQuestions ?? [];
  const answerTone = inferFollowUpAnswerTone({
    scoreAwarded: input.targetScoreAwarded,
    maxScore: input.targetMaxScore,
    rationale: input.targetRationale,
  });

  if (input.followUpKind === 'topic_redirect') {
    return normalizeFollowUpQuestionForCandidate(
      buildTopicRedirectFollowUpQuestion({
        expectedCheckpointTitle: input.checkpointTitle ?? '',
        answeredCheckpointTitle: input.answeredCheckpointTitle,
      }),
    );
  }

  if (
    input.followUpKind === 'clarification_redirect' &&
    (input.missingMustConcepts?.length ?? 0) >= 0
  ) {
    return normalizeFollowUpQuestionForCandidate(
      buildClarificationFollowUpQuestion({
        checkpointTitle: input.checkpointTitle ?? '',
        missingMustConcepts: input.missingMustConcepts ?? [],
        hints: input.evaluationHints,
        candidateScopeQuestion: input.latestCandidateAnswer,
        candidateTurnKind: input.candidateTurnKind,
        previousFollowUpQuestion:
          previousFollowUpQuestions[previousFollowUpQuestions.length - 1] ??
          null,
        seed,
      }),
    );
  }

  if (
    input.followUpKind === 'depth_probe' &&
    (input.missingMustConcepts?.length ?? 0) > 0
  ) {
    return normalizeFollowUpQuestionForCandidate(
      buildProbeFollowUpQuestion({
        checkpointTitle: input.checkpointTitle ?? '',
        missingMustConcepts: input.missingMustConcepts ?? [],
        hints: input.evaluationHints,
        seed,
        previousFollowUpQuestions,
        answerTone,
      }),
    );
  }

  if (
    input.followUpKind === 'residual_probe' &&
    (input.missingMustConcepts?.length ?? 0) > 0
  ) {
    return normalizeFollowUpQuestionForCandidate(
      buildResidualGapFollowUpQuestion({
        missingMustConcepts: input.missingMustConcepts ?? [],
        hints: input.evaluationHints,
        seed,
        previousFollowUpQuestions,
      }),
    );
  }

  const acknowledgment = pickFollowUpAcknowledgment(
    seed,
    previousFollowUpQuestions,
  );
  const stem = pickFollowUpQuestionStem(seed + 1);
  const topicHint = rephraseCheckpointTitleForFollowUp(
    input.checkpointTitle ?? '',
  );

  const question = topicHint
    ? `${acknowledgment} ${stem} ${topicHint}?`
    : `${acknowledgment} ${stem.replace(/—$/, '')}?`;

  return normalizeFollowUpQuestionForCandidate(question);
}

/** @deprecated Use buildNaturalTemplateFollowUp — kept for tests */
export function buildTemplateFollowUpQuestion(checkpointTitle: string): string {
  return buildNaturalTemplateFollowUp({
    questionText: checkpointTitle,
    checkpointTitle,
    latestCandidateAnswer: '',
  });
}

/** @deprecated Kept for backward-compatible tests — use isExhaustedPartialForFollowUp */
function isExhaustedPartialCheckpoint(state: {
  status: CheckpointStateStatus;
  scoreAwarded: number;
  maxScore: number;
  rationale?: string | null;
}): boolean {
  if (state.status !== 'partial' || state.maxScore <= 0) {
    return false;
  }

  const depth = parseDepthFromRationale(state.rationale ?? null);
  const partialThreshold = state.maxScore * 0.5;
  return (
    state.scoreAwarded >= partialThreshold &&
    (depth === 'partial_knowledge' || depth === 'heard_of')
  );
}

export { isExhaustedPartialCheckpoint };
