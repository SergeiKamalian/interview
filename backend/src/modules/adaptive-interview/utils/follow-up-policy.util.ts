import type {
  FollowUpPolicyDecision,
  FollowUpPolicyInput,
} from '../types/follow-up-planner.types';
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

  if (questionScoreSufficient && !hasMentionOnlyMissed) {
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
    .filter((state) => !isExhaustedPartialCheckpoint(state))
    .filter((state) => state.followUpCount < input.maxFollowUpsPerCheckpoint)
    .filter((state) => {
      const checkpoint = checkpointByKey.get(state.checkpointKey);
      if (!checkpoint || input.questionMaxScore <= 0) {
        return true;
      }

      const isLowWeight =
        checkpoint.score / input.questionMaxScore <
        input.lowWeightCheckpointRatio;

      return !(questionScoreSufficient && isLowWeight);
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
      };
    })
    .sort(compareCandidates);

  if (eligible.length === 0) {
    return {
      shouldAskFollowUp: false,
      reason: questionScoreSufficient
        ? 'sufficient_question_score'
        : 'no_eligible_checkpoints',
    };
  }

  const selected = eligible[0]!;

  return {
    shouldAskFollowUp: true,
    targetCheckpointKey: selected.checkpointKey,
    checkpointTitle: selected.title,
    checkpointExpected: selected.expected,
    reason: `checkpoint_${selected.status}`,
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
}): string {
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
