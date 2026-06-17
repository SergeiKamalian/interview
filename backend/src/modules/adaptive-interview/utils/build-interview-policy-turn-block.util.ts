import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import {
  collectCheckpointEvidenceText,
  collectFullCandidateText,
} from './checkpoint-evidence-text.util';
import {
  deriveProbeStatus,
  getMissingMustConcepts,
  getShallowAcceptFloorFraction,
  getShallowAcceptFloorScore,
  probeRequired,
  residualGapProbeRequired,
  resolveComplexityTier,
} from './probe-policy.util';

export type InterviewPolicyTurnBlock = {
  targetCheckpointKey: string | null;
  lines: string[];
};

export function buildInterviewPolicyTurnBlock(
  context: AdaptiveInterviewContextPacket,
): InterviewPolicyTurnBlock | null {
  const fullCandidateText = collectFullCandidateText(context);
  const targetKey =
    context.targetCheckpointKey ??
    selectPrimaryPolicyCheckpointKey(context, fullCandidateText);

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
  const followUpsRemaining = Math.max(
    0,
    context.followUpLimits.maxPerQuestion - context.followUpLimits.usedForQuestion,
  );

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
    `- Follow-up budget: ${followUpsRemaining} remaining for this question`,
    '',
    'Scoring for this turn:',
    '- Score from cumulative evidence for each checkpoint, not only the latest sentence',
    '- Do NOT finalize missed on advanced checkpoints while probe_status=open unless false_claim or decline',
    '- Rationale MUST include probe=pending when details were not asked yet',
  );

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

function selectPrimaryPolicyCheckpointKey(
  context: AdaptiveInterviewContextPacket,
  fullCandidateText: string,
): string | null {
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
