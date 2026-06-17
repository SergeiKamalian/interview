import type {
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
  resolveSkipFollowUpReason,
  shouldSkipFollowUps,
} from './candidate-decline.util';
import {
  pickFollowUpAcknowledgment,
  pickFollowUpQuestionStem,
} from './follow-up-acknowledgment.util';
import {
  buildProbeFollowUpQuestion,
  buildResidualGapFollowUpQuestion,
  compareProbePriority,
  getMissingMustConcepts,
  hasPendingProbe,
  isExhaustedPartialForFollowUp,
  isWithinCheckpointFollowUpBudget,
  probeRequired,
  residualGapProbeRequired,
} from './probe-policy.util';

const ELIGIBLE_STATUSES = new Set<CheckpointStateStatus>([
  'missed',
  'unclear',
  'partial',
]);

const STATUS_PRIORITY: Record<string, number> = {
  unclear: 0,
  partial: 1,
  missed: 2,
};

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

export function evaluateFollowUpPolicy(
  input: FollowUpPolicyInput,
): FollowUpPolicyDecision {
  if (
    shouldSkipFollowUps({
      answer: input.latestCandidateAnswer ?? '',
      aiDisposition: input.candidateDispositionFromAi,
      followUpsUsedForQuestion: input.followUpsUsedForQuestion,
    })
  ) {
    return {
      shouldAskFollowUp: false,
      reason: resolveSkipFollowUpReason({
        answer: input.latestCandidateAnswer ?? '',
        aiDisposition: input.candidateDispositionFromAi,
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

  const stagnationLimit = input.stagnationLimit ?? 2;
  const recentDeltas = input.recentScoreDeltas ?? [];
  if (
    recentDeltas.length >= stagnationLimit &&
    recentDeltas.slice(-stagnationLimit).every((delta) => delta <= 0)
  ) {
    return {
      shouldAskFollowUp: false,
      reason: 'follow_up_stagnation',
    };
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
  const pendingAdvancedProbe = hasPendingProbe({
    checkpoints: input.checkpoints,
    checkpointStates: input.checkpointStates,
    questionMaxScore: input.questionMaxScore,
    latestCandidateText: input.latestCandidateAnswer ?? '',
    candidateEvidenceText: input.latestCandidateAnswer ?? '',
    checkpointEvidenceTextByKey: input.checkpointEvidenceTextByKey,
    maxFollowUpsPerCheckpoint: input.maxFollowUpsPerCheckpoint,
  });

  if (
    questionScoreSufficient &&
    !hasMentionOnlyMissed &&
    !pendingAdvancedProbe
  ) {
    return {
      shouldAskFollowUp: false,
      reason: 'sufficient_question_score',
    };
  }

  const checkpointByKey = new Map(
    input.checkpoints.map((checkpoint) => [checkpoint.checkpointKey, checkpoint]),
  );

  const eligible = input.checkpointStates
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
      const candidateEvidenceText = getCheckpointEvidenceText(
        input,
        state.checkpointKey,
      );
      const needsResidual =
        checkpoint !== undefined &&
        residualGapProbeRequired({
          checkpoint,
          state,
          hints: checkpoint.evaluationHints,
          questionMaxScore: input.questionMaxScore,
          candidateEvidenceText,
          latestCandidateText: input.latestCandidateAnswer ?? '',
        });

      return isWithinCheckpointFollowUpBudget({
        state,
        maxFollowUpsPerCheckpoint: input.maxFollowUpsPerCheckpoint,
        residualGapProbeRequired: needsResidual,
      });
    })
    .filter((state) => {
      const checkpoint = checkpointByKey.get(state.checkpointKey);
      if (!checkpoint || input.questionMaxScore <= 0) {
        return true;
      }

      const isLowWeight =
        checkpoint.score / input.questionMaxScore <
        input.lowWeightCheckpointRatio;

      return !(questionScoreSufficient && isLowWeight && !pendingAdvancedProbe);
    })
    .map((state) => {
      const checkpoint = checkpointByKey.get(state.checkpointKey);
      return {
        checkpointKey: state.checkpointKey,
        title: checkpoint?.title ?? state.checkpointKey,
        expected: checkpoint?.expected ?? '',
        weight: checkpoint?.score ?? 0,
        sortOrder: checkpoint?.sortOrder ?? 0,
        status: state.status,
        scoreAwarded: state.scoreAwarded,
        maxScore: state.maxScore,
        followUpCount: state.followUpCount,
        checkpoint: checkpoint!,
        state,
        hints: checkpoint?.evaluationHints,
      };
    })
    .filter((item) => item.checkpoint)
    .sort((left, right) => {
      const stickyKey = input.stickyTargetCheckpointKey;
      if (stickyKey) {
        const leftEvidence = getCheckpointEvidenceText(input, left.checkpointKey);
        const rightEvidence = getCheckpointEvidenceText(input, right.checkpointKey);
        const leftSticky =
          left.checkpointKey === stickyKey &&
          (probeRequired({
            checkpoint: left.checkpoint,
            state: left.state,
            hints: left.hints,
            questionMaxScore: input.questionMaxScore,
            candidateEvidenceText: leftEvidence,
            latestCandidateText: input.latestCandidateAnswer ?? '',
          }) ||
            residualGapProbeRequired({
              checkpoint: left.checkpoint,
              state: left.state,
              hints: left.hints,
              questionMaxScore: input.questionMaxScore,
              candidateEvidenceText: leftEvidence,
              latestCandidateText: input.latestCandidateAnswer ?? '',
            }));
        const rightSticky =
          right.checkpointKey === stickyKey &&
          (probeRequired({
            checkpoint: right.checkpoint,
            state: right.state,
            hints: right.hints,
            questionMaxScore: input.questionMaxScore,
            candidateEvidenceText: rightEvidence,
            latestCandidateText: input.latestCandidateAnswer ?? '',
          }) ||
            residualGapProbeRequired({
              checkpoint: right.checkpoint,
              state: right.state,
              hints: right.hints,
              questionMaxScore: input.questionMaxScore,
              candidateEvidenceText: rightEvidence,
              latestCandidateText: input.latestCandidateAnswer ?? '',
            }));

        if (leftSticky !== rightSticky) {
          return leftSticky ? -1 : 1;
        }
      }

      const probeCompare = compareProbePriority(
        left,
        right,
        input.questionMaxScore,
        getCheckpointEvidenceText(input, left.checkpointKey),
        getCheckpointEvidenceText(input, right.checkpointKey),
      );
      if (probeCompare !== 0) {
        return probeCompare;
      }

      return compareCandidates(left, right);
    });

  if (eligible.length === 0) {
    return {
      shouldAskFollowUp: false,
      reason: questionScoreSufficient
        ? 'sufficient_question_score'
        : 'no_eligible_checkpoints',
    };
  }

  const selected = eligible[0]!;
  const selectedCheckpoint = checkpointByKey.get(selected.checkpointKey)!;
  const selectedEvidenceText = getCheckpointEvidenceText(
    input,
    selected.checkpointKey,
  );
  const missingMustConcepts = getMissingMustConcepts(
    selectedCheckpoint.evaluationHints,
    selectedEvidenceText,
  );
  const isDepthProbe = probeRequired({
    checkpoint: selectedCheckpoint,
    state: selected.state,
    hints: selectedCheckpoint.evaluationHints,
    questionMaxScore: input.questionMaxScore,
    candidateEvidenceText: selectedEvidenceText,
    latestCandidateText: input.latestCandidateAnswer ?? '',
  });
  const isResidualProbe = !isDepthProbe &&
    residualGapProbeRequired({
      checkpoint: selectedCheckpoint,
      state: selected.state,
      hints: selectedCheckpoint.evaluationHints,
      questionMaxScore: input.questionMaxScore,
      candidateEvidenceText: selectedEvidenceText,
      latestCandidateText: input.latestCandidateAnswer ?? '',
    });

  return {
    shouldAskFollowUp: true,
    targetCheckpointKey: selected.checkpointKey,
    checkpointTitle: selected.title,
    checkpointExpected: selected.expected,
    reason: isDepthProbe
      ? 'checkpoint_probe_required'
      : isResidualProbe
        ? 'checkpoint_residual_gap_probe'
        : `checkpoint_${selected.status}`,
    followUpKind: isDepthProbe
      ? 'depth_probe'
      : isResidualProbe
        ? 'residual_probe'
        : 'generic',
    missingMustConcepts,
  };
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

function compareCandidates(
  left: {
    weight: number;
    status: CheckpointStateStatus;
    sortOrder: number;
  },
  right: {
    weight: number;
    status: CheckpointStateStatus;
    sortOrder: number;
  },
): number {
  if (right.weight !== left.weight) {
    return right.weight - left.weight;
  }

  const leftStatusPriority = STATUS_PRIORITY[left.status] ?? 99;
  const rightStatusPriority = STATUS_PRIORITY[right.status] ?? 99;
  if (leftStatusPriority !== rightStatusPriority) {
    return leftStatusPriority - rightStatusPriority;
  }

  return left.sortOrder - right.sortOrder;
}

export function buildNaturalTemplateFollowUp(input: {
  questionText: string;
  checkpointTitle?: string;
  checkpointExpected?: string;
  latestCandidateAnswer: string;
  previousFollowUpQuestions?: string[];
  seed?: number;
  missingMustConcepts?: string[];
  followUpKind?: 'depth_probe' | 'residual_probe' | 'generic';
  evaluationHints?: CheckpointEvaluationHints | null;
}): string {
  if (
    input.followUpKind === 'depth_probe' &&
    (input.missingMustConcepts?.length ?? 0) > 0
  ) {
    return normalizeFollowUpQuestionForCandidate(
      buildProbeFollowUpQuestion({
        checkpointTitle: input.checkpointTitle ?? '',
        missingMustConcepts: input.missingMustConcepts ?? [],
        hints: input.evaluationHints,
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
      }),
    );
  }

  const seed =
    input.seed ??
    (input.checkpointTitle ?? input.checkpointExpected ?? input.questionText).length;
  const acknowledgment = pickFollowUpAcknowledgment(
    seed,
    input.previousFollowUpQuestions ?? [],
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
