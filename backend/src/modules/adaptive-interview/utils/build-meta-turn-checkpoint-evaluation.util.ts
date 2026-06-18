import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import type { EvaluationMode } from '../types/evaluation-mode.type';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluationResult,
} from '../types/per-turn-evaluation.types';
import { applyCheckpointScoreFloors } from './apply-checkpoint-score-floors.util';
import { mapTurnKindToDisposition } from './map-turn-kind-to-disposition.util';
import {
  getShallowAcceptFloorFraction,
  getShallowAcceptFloorScore,
  resolveComplexityTier,
} from './probe-policy.util';
import { inferExpectedCheckpointKey } from './topic-mismatch.util';

export function resolveMetaTurnTargetCheckpointKey(
  context: AdaptiveInterviewContextPacket,
): string | null {
  if (context.targetCheckpointKey) {
    return context.targetCheckpointKey;
  }

  return (
    inferExpectedCheckpointKey({
      checkpoints: context.checkpoints,
      targetCheckpointKey: context.targetCheckpointKey,
      questionText: context.questionText,
    }) ?? null
  );
}

export function buildMetaTurnEvaluation(input: {
  context: AdaptiveInterviewContextPacket;
  evaluationMode: EvaluationMode;
  candidateTurnKind?: CandidateTurnKind | null;
  candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
  evidenceSource?: 'meta_turn';
}): PerTurnCheckpointEvaluationAiResponse {
  const candidateDisposition =
    input.candidateDispositionFromClassifier ??
    resolveMetaTurnDisposition(input.candidateTurnKind);
  const targetCheckpointKey = resolveMetaTurnTargetCheckpointKey(input.context);

  if (!targetCheckpointKey) {
    return {
      candidateDisposition,
      checkpointResults: [],
    };
  }

  const checkpoint = input.context.checkpoints.find(
    (item) => item.checkpointKey === targetCheckpointKey,
  );
  const priorState = input.context.checkpointStates.find(
    (item) => item.checkpointKey === targetCheckpointKey,
  );

  if (!checkpoint) {
    return {
      candidateDisposition,
      checkpointResults: [],
    };
  }

  let targetResult: PerTurnCheckpointEvaluationResult;

  switch (input.evaluationMode) {
    case 'target_refusal':
      targetResult = buildTargetRefusalResult({
        context: input.context,
        checkpoint,
        priorState,
        candidateTurnKind: input.candidateTurnKind,
        candidateDisposition,
        evidenceSource: input.evidenceSource,
      });
      break;
    case 'clarification':
      targetResult = buildClarificationTargetResult(checkpoint, priorState);
      break;
    case 'redirect':
      targetResult = buildRedirectTargetResult(
        checkpoint,
        priorState,
        input.candidateTurnKind,
      );
      break;
    default:
      return {
        candidateDisposition,
        checkpointResults: [],
      };
  }

  return {
    candidateDisposition,
    checkpointResults: [targetResult],
  };
}

function resolveMetaTurnDisposition(
  candidateTurnKind?: CandidateTurnKind | null,
): CandidateAnswerDisposition {
  if (candidateTurnKind) {
    return mapTurnKindToDisposition(candidateTurnKind);
  }

  return 'engaged';
}

function buildClarificationTargetResult(
  checkpoint: AdaptiveInterviewContextPacket['checkpoints'][number],
  priorState?: AdaptiveInterviewContextPacket['checkpointStates'][number],
): PerTurnCheckpointEvaluationResult {
  const frozenScore = priorState?.scoreAwarded ?? 0;
  const frozenStatus = normalizeCheckpointStatus(
    priorState?.status ?? 'missed',
    frozenScore,
    priorState?.maxScore ?? checkpoint.score,
  );

  return {
    checkpointKey: checkpoint.checkpointKey,
    status: frozenStatus,
    scoreAwarded: frozenScore,
    confidence: 0.9,
    evidenceSummary: null,
    rationale: appendScopeClarificationPendingRationale(priorState?.rationale),
  };
}

function buildRedirectTargetResult(
  checkpoint: AdaptiveInterviewContextPacket['checkpoints'][number],
  priorState: AdaptiveInterviewContextPacket['checkpointStates'][number] | undefined,
  candidateTurnKind?: CandidateTurnKind | null,
): PerTurnCheckpointEvaluationResult {
  const frozenScore = priorState?.scoreAwarded ?? 0;
  const maxScore = priorState?.maxScore ?? checkpoint.score;
  const tag =
    candidateTurnKind === 'off_topic'
      ? 'meta_turn=off_topic_redirect'
      : 'meta_turn=confused_redirect';

  if (frozenScore > 0) {
    return {
      checkpointKey: checkpoint.checkpointKey,
      status: normalizeCheckpointStatus(
        priorState?.status ?? 'partial',
        frozenScore,
        maxScore,
      ),
      scoreAwarded: frozenScore,
      confidence: 0.85,
      evidenceSummary: null,
      rationale: appendMetaTurnTag(priorState?.rationale, tag),
    };
  }

  return {
    checkpointKey: checkpoint.checkpointKey,
    status: 'unclear',
    scoreAwarded: 0,
    confidence: 0.85,
    evidenceSummary: null,
    rationale: tag,
  };
}

function buildTargetRefusalResult(input: {
  context: AdaptiveInterviewContextPacket;
  checkpoint: AdaptiveInterviewContextPacket['checkpoints'][number];
  priorState?: AdaptiveInterviewContextPacket['checkpointStates'][number];
  candidateTurnKind?: CandidateTurnKind | null;
  candidateDisposition: CandidateAnswerDisposition;
  evidenceSource?: 'meta_turn';
}): PerTurnCheckpointEvaluationResult {
  const seedResult: PerTurnCheckpointEvaluationResult = {
    checkpointKey: input.checkpoint.checkpointKey,
    status: 'covered',
    scoreAwarded: input.priorState?.maxScore ?? input.checkpoint.score,
    confidence: 0.9,
    evidenceSummary: null,
    rationale: 'Meta turn: explicit refusal pending guard cap.',
  };

  const { evaluation } = applyCheckpointScoreFloors(
    {
      candidateDisposition: input.candidateDisposition,
      checkpointResults: [seedResult],
    },
    input.context,
    {
      evaluationMode: 'target_refusal',
      evidenceSource: input.evidenceSource,
      candidateTurnKind: input.candidateTurnKind,
      candidateDispositionFromClassifier: input.candidateDisposition,
    },
  );

  const guarded = evaluation.checkpointResults[0];
  if (guarded) {
    return guarded;
  }

  return buildDeterministicRefusalFallback(
    input.checkpoint,
    input.priorState,
    input.context.latestCandidateAnswer,
  );
}

function buildDeterministicRefusalFallback(
  checkpoint: AdaptiveInterviewContextPacket['checkpoints'][number],
  priorState: AdaptiveInterviewContextPacket['checkpointStates'][number] | undefined,
  latestCandidateText: string,
): PerTurnCheckpointEvaluationResult {
  const maxScore = priorState?.maxScore ?? checkpoint.score;
  const hints = checkpoint.evaluationHints;
  const tier = resolveComplexityTier(
    hints,
    checkpoint.score,
    maxScore,
  );
  const probedOrPartial =
    (priorState?.followUpCount ?? 0) > 0 || (priorState?.scoreAwarded ?? 0) > 0;

  if (probedOrPartial && hints?.probePolicy) {
    const fraction = getShallowAcceptFloorFraction({
      hints,
      tier,
      probeStatus: 'probed',
    });
    const floor = getShallowAcceptFloorScore(maxScore, fraction);

    return {
      checkpointKey: checkpoint.checkpointKey,
      status: floor > 0 ? 'partial' : 'missed',
      scoreAwarded: floor,
      confidence: 0.9,
      evidenceSummary: null,
      rationale:
        'depth=heard_of. Explicit refusal after probe; shallow accept closed.',
    };
  }

  return {
    checkpointKey: checkpoint.checkpointKey,
    status: 'missed',
    scoreAwarded: 0,
    confidence: 0.9,
    evidenceSummary: null,
    rationale: `depth=heard_of. Explicit refusal in latest answer. ${latestCandidateText.slice(0, 80)}`,
  };
}

function normalizeCheckpointStatus(
  status: string,
  scoreAwarded: number,
  maxScore: number,
): PerTurnCheckpointEvaluationResult['status'] {
  if (scoreAwarded <= 0) {
    return status === 'unclear' ? 'unclear' : 'missed';
  }

  if (maxScore > 0 && scoreAwarded >= maxScore) {
    return 'covered';
  }

  if (status === 'covered' || status === 'partial' || status === 'missed') {
    return status;
  }

  return 'partial';
}

function appendScopeClarificationPendingRationale(
  rationale: string | null | undefined,
): string {
  return appendMetaTurnTag(rationale, 'scope_clarification=pending');
}

function appendMetaTurnTag(
  rationale: string | null | undefined,
  tag: string,
): string {
  const base = rationale?.trim() ?? '';
  if (base.includes(tag)) {
    return base;
  }

  return base ? `${base}; ${tag}` : tag;
}
