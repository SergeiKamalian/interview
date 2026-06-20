import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import {
  applyProbingDepthToLimits,
  getAdaptiveInterviewContextLimits,
} from '../config/adaptive-interview-context.config';
import {
  collectCheckpointEvidenceText,
  collectFullCandidateText,
} from './checkpoint-evidence-text.util';
import {
  allocateFollowUpBudget,
  buildBudgetAllocatorCandidate,
  describeCheckpointCapLabel,
  maxFollowUpsForCheckpoint,
  type FollowUpBudgetConfig,
  resolveMinPriorityToProbe,
} from './follow-up-budget-allocator.util';
import {
  deriveProbeStatus,
  getMissingMustConcepts,
  getShallowAcceptFloorFraction,
  getShallowAcceptFloorScore,
  isExhaustedPartialForFollowUp,
  isWithinCheckpointFollowUpBudget,
  probeRequired,
  residualGapProbeRequired,
  resolveComplexityTier,
} from './probe-policy.util';
import {
  computeTransitiveFloorsFromStates,
  formatTransitiveFloorsPromptBlock,
} from './transitive-checkpoint-floors.util';
import { detectTopicMismatch, inferExpectedCheckpointKey } from './topic-mismatch.util';

export type InterviewPolicyTurnBlock = {
  targetCheckpointKey: string | null;
  lines: string[];
};

export function buildInterviewPolicyTurnBlock(
  context: AdaptiveInterviewContextPacket,
): InterviewPolicyTurnBlock | null {
  const fullCandidateText = collectFullCandidateText(context);
  const budgetConfig = resolveBudgetConfigFromContext(context);
  const targetKey =
    context.targetCheckpointKey ??
    selectPrimaryPolicyCheckpointKey(context, fullCandidateText, budgetConfig);

  if (!targetKey) {
    return null;
  }

  const checkpoint = context.checkpoints.find(
    (item) => item.checkpointKey === targetKey,
  );
  const state = context.checkpointStates.find(
    (item) => item.checkpointKey === targetKey,
  );

  if (!checkpoint || !state) {
    return null;
  }

  const hints = checkpoint.evaluationHints;
  const tier = resolveComplexityTier(
    hints,
    checkpoint.score,
    context.maxScore,
  );
  const checkpointEvidenceText = collectCheckpointEvidenceText(
    context,
    targetKey,
  );
  const probeStatus = deriveProbeStatus({
    checkpoint,
    state,
    hints,
    questionMaxScore: context.maxScore,
    candidateEvidenceText: checkpointEvidenceText,
    latestCandidateText: context.latestCandidateAnswer,
  });
  const needsProbe = probeRequired({
    checkpoint,
    state,
    hints,
    questionMaxScore: context.maxScore,
    candidateEvidenceText: checkpointEvidenceText,
    latestCandidateText: context.latestCandidateAnswer,
  });
  const needsResidualProbe = residualGapProbeRequired({
    checkpoint,
    state,
    hints,
    questionMaxScore: context.maxScore,
    candidateEvidenceText: checkpointEvidenceText,
    latestCandidateText: context.latestCandidateAnswer,
  });
  const missingMustConcepts = getMissingMustConcepts(
    hints,
    checkpointEvidenceText,
  );
  const shallowFraction = getShallowAcceptFloorFraction({
    hints,
    tier,
    probeStatus,
  });
  const shallowFloor = getShallowAcceptFloorScore(state.maxScore, shallowFraction);
  const budgetLines = buildFollowUpBudgetLines(context, targetKey, budgetConfig);
  const candidateEvidenceTextByKey = Object.fromEntries(
    context.checkpoints.map((item) => [
      item.checkpointKey,
      collectCheckpointEvidenceText(context, item.checkpointKey),
    ]),
  );
  const transitiveBlock = formatTransitiveFloorsPromptBlock(
    computeTransitiveFloorsFromStates({
      checkpoints: context.checkpoints,
      checkpointStates: context.checkpointStates,
      candidateEvidenceTextByKey,
      latestCandidateText: context.latestCandidateAnswer,
      questionMaxScore: context.maxScore,
    }).applications,
  );
  const expectedCheckpointKey =
    inferExpectedCheckpointKey({
      checkpoints: context.checkpoints,
      targetCheckpointKey: context.targetCheckpointKey ?? targetKey,
      questionText: context.questionText,
    }) ?? targetKey;
  const topicMismatch = detectTopicMismatch({
    expectedCheckpointKey,
    latestCandidateAnswer: context.latestCandidateAnswer,
    checkpoints: context.checkpoints,
    checkpointStates: context.checkpointStates,
    isTargetedFollowUp:
      context.latestAnswerMessageKind === 'follow_up_answer' &&
      Boolean(context.targetCheckpointKey),
  });
  const topicFocusLines =
    topicMismatch.isMismatch
      ? [
          'Topic focus (this turn):',
          `- Expected checkpoint: ${expectedCheckpointKey}`,
          `- Candidate answer appears to address: ${topicMismatch.answeredCheckpointKey ?? 'another topic'} (mismatch suspected)`,
          '- Instruction: do NOT finalize missed on expected checkpoint; set disposition misunderstood_question if confident',
          '',
        ]
      : [];

  const lines = [
    'Interview policy (this turn):',
    `- Target checkpoint: ${targetKey} (${tier}, weight=${checkpoint.score})`,
    `- Probe status: ${probeStatus}${
      needsProbe
        ? ' — mustConcepts not yet asked in dialogue'
        : needsResidualProbe
          ? ' — partial answer; residual mustConcepts gap remains'
          : ''
    }`,
  ];

  if (missingMustConcepts.length > 0 && (needsProbe || needsResidualProbe)) {
    lines.push(`- Missing mustConcepts: ${missingMustConcepts.join(', ')}`);
  }

  lines.push(
    `- Shallow accept floor: ${shallowFloor}/${state.maxScore} (${shallowFraction})`,
    '',
    ...topicFocusLines,
    ...budgetLines,
  );

  if (transitiveBlock) {
    lines.push(transitiveBlock, '');
  }

  lines.push(
    'Scoring for this turn:',
    '- Score from cumulative evidence for each checkpoint, not only the latest sentence',
    '- Do NOT finalize missed on advanced checkpoints while probe_status=open unless false_claim or decline',
    '- Do NOT expect depth probe on checkpoints listed under Skipped (low priority) — apply shallow accept',
    '- Rationale MUST include probe=pending when details were not asked yet',
  );

  if (
    context.latestAnswerMessageKind === 'follow_up_answer' &&
    context.targetCheckpointKey
  ) {
    lines.push(
      '',
      'Scope clarification:',
      '- If latest candidate message is ONLY meta (clarify/confirm your follow-up, any wording) → candidate_disposition=asked_for_scope',
      '- On asked_for_scope: freeze targeted checkpoint score at prior value; no new evidence this turn',
    );
  }

  return {
    targetCheckpointKey: targetKey,
    lines,
  };
}

export function formatInterviewPolicyTurnBlock(
  block: InterviewPolicyTurnBlock | null,
): string {
  if (!block) {
    return '';
  }

  return block.lines.join('\n');
}

function resolveBudgetConfigFromContext(
  context: AdaptiveInterviewContextPacket,
): FollowUpBudgetConfig {
  const limits = applyProbingDepthToLimits(
    getAdaptiveInterviewContextLimits(),
    context.probingDepth,
  );

  return {
    maxFollowUpsPerQuestion:
      context.followUpLimits.maxPerQuestion ?? limits.maxFollowUpsPerQuestion,
    maxFollowUpsHeavyCheckpoint: limits.maxFollowUpsHeavyCheckpoint,
    heavyCheckpointWeightRatio: limits.heavyCheckpointWeightRatio,
    minPriorityToProbe: limits.minPriorityToProbe,
  };
}

function buildFollowUpBudgetLines(
  context: AdaptiveInterviewContextPacket,
  targetKey: string,
  budgetConfig: FollowUpBudgetConfig,
): string[] {
  const used = context.followUpLimits.usedForQuestion;
  const max = budgetConfig.maxFollowUpsPerQuestion;
  const remaining = Math.max(0, max - used);
  const candidates = buildBudgetCandidatesFromContext(context, budgetConfig);
  const allocation = allocateFollowUpBudget({
    candidates,
    followUpsUsedForQuestion: used,
    config: budgetConfig,
    stickyTargetCheckpointKey: context.targetCheckpointKey,
  });
  const targetCheckpoint = context.checkpoints.find(
    (item) => item.checkpointKey === targetKey,
  );
  const targetHints = targetCheckpoint?.evaluationHints;
  const capLabel =
    targetCheckpoint !== undefined
      ? describeCheckpointCapLabel({
          checkpoint: targetCheckpoint,
          hints: targetHints,
          questionMaxScore: context.maxScore,
          config: budgetConfig,
        })
      : 'n/a';
  const targetRank = allocation.rankedCandidates.find(
    (item) => item.checkpointKey === targetKey,
  );
  const minPriority = resolveMinPriorityToProbe(targetHints, budgetConfig);
  const skippedLines =
    allocation.skippedLowPriority.length > 0
      ? allocation.skippedLowPriority.map((key) => {
          const candidate = candidates.find(
            (item) => item.checkpointKey === key,
          );
          const priority = candidate?.priorityResult.priority ?? 0;
          return `${key} (${priority.toFixed(2)} < min ${minPriority})`;
        })
      : [];

  const lines = [
    'Follow-up budget (this question):',
    `- Used: ${used} / ${max}`,
    `- Remaining: ${remaining}`,
    `- This checkpoint cap: ${capLabel}`,
  ];

  if (targetRank) {
    lines.push(
      `- Priority rank: #${targetRank.rank} ${targetKey} (${targetRank.priority.toFixed(2)})`,
    );
  }

  if (skippedLines.length > 0) {
    lines.push(`- Skipped (low priority): ${skippedLines.join('; ')}`);
  }

  lines.push('');

  return lines;
}

export function buildFollowUpBudgetPromptBlock(
  context: AdaptiveInterviewContextPacket,
  targetCheckpointKey: string,
): string {
  const budgetConfig = resolveBudgetConfigFromContext(context);
  return buildFollowUpBudgetLines(
    context,
    targetCheckpointKey,
    budgetConfig,
  ).join('\n');
}

function buildBudgetCandidatesFromContext(
  context: AdaptiveInterviewContextPacket,
  budgetConfig: FollowUpBudgetConfig,
) {
  const stateByKey = new Map(
    context.checkpointStates.map((state) => [state.checkpointKey, state]),
  );

  return context.checkpoints
    .map((checkpoint) => {
      const state = stateByKey.get(checkpoint.checkpointKey);
      if (!state) {
        return null;
      }

      if (
        state.status !== 'partial' &&
        state.status !== 'missed' &&
        state.status !== 'unclear'
      ) {
        return null;
      }

      const candidateEvidenceText = collectCheckpointEvidenceText(
        context,
        checkpoint.checkpointKey,
      );

      if (
        isExhaustedPartialForFollowUp({
          state,
          checkpoint,
          hints: checkpoint.evaluationHints,
          questionMaxScore: context.maxScore,
          candidateEvidenceText,
          latestCandidateText: context.latestCandidateAnswer,
        })
      ) {
        return null;
      }

      const perCheckpointCap = maxFollowUpsForCheckpoint({
        checkpoint,
        hints: checkpoint.evaluationHints,
        questionMaxScore: context.maxScore,
        config: budgetConfig,
      });

      if (perCheckpointCap === 0) {
        return null;
      }

      const needsResidual = residualGapProbeRequired({
        checkpoint,
        state,
        hints: checkpoint.evaluationHints,
        questionMaxScore: context.maxScore,
        candidateEvidenceText,
        latestCandidateText: context.latestCandidateAnswer,
      });

      if (
        !isWithinCheckpointFollowUpBudget({
          state,
          maxFollowUpsPerCheckpoint: perCheckpointCap,
          residualGapProbeRequired: needsResidual,
        })
      ) {
        return null;
      }

      return buildBudgetAllocatorCandidate({
        checkpoint,
        state: { ...state, checkpointKey: checkpoint.checkpointKey },
        questionMaxScore: context.maxScore,
        candidateEvidenceText,
        latestCandidateText: context.latestCandidateAnswer,
        config: budgetConfig,
      });
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> =>
      candidate !== null,
    );
}

function selectPrimaryPolicyCheckpointKey(
  context: AdaptiveInterviewContextPacket,
  fullCandidateText: string,
  budgetConfig: FollowUpBudgetConfig,
): string | null {
  const candidates = buildBudgetCandidatesFromContext(context, budgetConfig);
  const allocation = allocateFollowUpBudget({
    candidates,
    followUpsUsedForQuestion: context.followUpLimits.usedForQuestion,
    config: budgetConfig,
    stickyTargetCheckpointKey: context.targetCheckpointKey,
  });

  if (allocation.selectedCheckpointKey) {
    return allocation.selectedCheckpointKey;
  }

  const stateByKey = new Map(
    context.checkpointStates.map((state) => [state.checkpointKey, state]),
  );

  let bestKey: string | null = null;
  let bestWeight = -1;

  for (const checkpoint of context.checkpoints) {
    const state = stateByKey.get(checkpoint.checkpointKey);
    if (!state) {
      continue;
    }

    const needsProbe = probeRequired({
      checkpoint,
      state,
      hints: checkpoint.evaluationHints,
      questionMaxScore: context.maxScore,
      candidateEvidenceText: collectCheckpointEvidenceText(
        context,
        checkpoint.checkpointKey,
      ),
      latestCandidateText: context.latestCandidateAnswer,
    });
    const needsResidual = residualGapProbeRequired({
      checkpoint,
      state,
      hints: checkpoint.evaluationHints,
      questionMaxScore: context.maxScore,
      candidateEvidenceText: collectCheckpointEvidenceText(
        context,
        checkpoint.checkpointKey,
      ),
      latestCandidateText: context.latestCandidateAnswer,
    });

    if (!needsProbe && !needsResidual) {
      continue;
    }

    if (checkpoint.score > bestWeight) {
      bestWeight = checkpoint.score;
      bestKey = checkpoint.checkpointKey;
    }
  }

  if (bestKey) {
    return bestKey;
  }

  const partialState = context.checkpointStates.find(
    (state) => state.status === 'partial' || state.status === 'unclear',
  );

  return partialState?.checkpointKey ?? null;
}
