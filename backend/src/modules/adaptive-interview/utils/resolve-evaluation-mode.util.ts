import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import type { EvaluationMode } from '../types/evaluation-mode.type';
import {
  isScopeClarificationTurnKind,
  isTargetedRefusalTurnKind,
} from './map-turn-kind-to-disposition.util';

const TURN_KIND_TO_EVALUATION_MODE: Record<CandidateTurnKind, EvaluationMode> =
  {
    substantive_answer: 'full',
    scope_clarification: 'clarification',
    format_clarification: 'clarification',
    decline_scoped: 'target_refusal',
    topic_refusal: 'target_refusal',
    confused: 'redirect',
    off_topic: 'redirect',
    decline_whole: 'skip',
  };

/**
 * Maps classifier `turn_kind` to downstream evaluation depth.
 * null / unknown → `full` (safe default; caller may log a warning).
 */
export function resolveEvaluationMode(
  turnKind: CandidateTurnKind | null | undefined,
): EvaluationMode {
  if (turnKind == null) {
    return 'full';
  }

  return TURN_KIND_TO_EVALUATION_MODE[turnKind] ?? 'full';
}

export function isMetaTurnMode(mode: EvaluationMode): boolean {
  return mode !== 'full';
}

export function shouldSkipEvaluation(mode: EvaluationMode): boolean {
  return mode === 'skip';
}

export function allowsFullCheckpointScoring(mode: EvaluationMode): boolean {
  return mode === 'full';
}

export const META_TURN_FROZEN_RATIONALE_TAG = 'meta_turn_frozen';

/**
 * Non-target checkpoints must keep prior cumulative scores on meta-turn evaluation.
 */
export function shouldFreezeCheckpointOnMetaTurn(
  mode: EvaluationMode,
  checkpointKey: string,
  targetCheckpointKey: string | null | undefined,
): boolean {
  if (mode === 'full' || !targetCheckpointKey) {
    return false;
  }

  return checkpointKey !== targetCheckpointKey;
}

export function appendMetaTurnFrozenRationale(
  rationale: string | null | undefined,
): string {
  const base = rationale?.trim() ?? '';
  if (base.includes(META_TURN_FROZEN_RATIONALE_TAG)) {
    return base;
  }

  return base
    ? `${base}; ${META_TURN_FROZEN_RATIONALE_TAG}`
    : META_TURN_FROZEN_RATIONALE_TAG;
}

export function isTargetRefusalPolicyTurn(input: {
  evaluationMode?: EvaluationMode | null;
  candidateTurnKind?: CandidateTurnKind | null;
}): boolean {
  if (input.evaluationMode === 'target_refusal') {
    return true;
  }

  return isTargetedRefusalTurnKind(input.candidateTurnKind);
}

export function isMetaTurnSuppressingTopicMismatch(input: {
  evaluationMode?: EvaluationMode | null;
  candidateTurnKind?: CandidateTurnKind | null;
}): boolean {
  if (input.evaluationMode && input.evaluationMode !== 'full') {
    return true;
  }

  const turnKind = input.candidateTurnKind;
  if (!turnKind) {
    return false;
  }

  return (
    isScopeClarificationTurnKind(turnKind) ||
    isTargetedRefusalTurnKind(turnKind) ||
    turnKind === 'confused' ||
    turnKind === 'off_topic'
  );
}
