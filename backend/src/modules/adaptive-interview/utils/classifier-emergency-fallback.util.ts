import { isClassifierRegexEmergencyFallbackEnabled } from '../config/adaptive-interview-context.config';
import type {
  CandidateTurnClassification,
  CandidateTurnClassifierInput,
  CandidateTurnKind,
} from '../types/candidate-turn-classifier.types';
import { inferLegacyTurnKindShadow } from './legacy-turn-kind-shadow.util';
import {
  isTargetedRefusalTurnKind,
  mapTurnKindToDisposition,
} from './map-turn-kind-to-disposition.util';
import { legacyIsTargetedTopicRefusal } from './legacy-intent-regex.util';

/** Policy helper: classifier turn_kind first; legacy regex only when emergency flag is on. */
export function isTargetedRefusalForPolicy(input: {
  candidateTurnKind?: CandidateTurnKind | null;
  latestCandidateText?: string;
}): boolean {
  if (isTargetedRefusalTurnKind(input.candidateTurnKind)) {
    return true;
  }

  if (
    isClassifierRegexEmergencyFallbackEnabled() &&
    !input.candidateTurnKind &&
    input.latestCandidateText
  ) {
    return legacyIsTargetedTopicRefusal(input.latestCandidateText);
  }

  return false;
}

/**
 * When the AI classifier fails and `CLASSIFIER_REGEX_EMERGENCY_FALLBACK=true`,
 * derive turn_kind from deprecated regex (last-resort outage path).
 */
export function resolveClassifierEmergencyFallback(
  input: CandidateTurnClassifierInput,
): CandidateTurnClassification | null {
  if (!isClassifierRegexEmergencyFallbackEnabled()) {
    return null;
  }

  const legacy = inferLegacyTurnKindShadow(input);
  if (!legacy.turnKind) {
    return null;
  }

  return {
    turnKind: legacy.turnKind,
    confidence: 'low',
    reason:
      'Emergency regex fallback (CLASSIFIER_REGEX_EMERGENCY_FALLBACK=true).',
    openerReadiness: legacy.openerReadiness,
    disposition: mapTurnKindToDisposition(legacy.turnKind),
  };
}
