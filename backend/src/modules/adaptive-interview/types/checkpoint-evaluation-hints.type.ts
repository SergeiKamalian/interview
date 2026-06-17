import type { CheckpointProbePolicy } from './checkpoint-probe-policy.type';

export type CheckpointComplexityTier =
  | 'mention'
  | 'basic'
  | 'core_plus'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type CheckpointEvaluationHints = {
  /** Human/agent label for weight tier (see docs/question-bank/checkpoint-weight-rubric.md). */
  complexityTier?: CheckpointComplexityTier;
  /** Why this checkpoint has its weight — for design docs and prompt context. */
  weightRationale?: string;
  /** Concepts that indicate real understanding when present in cumulative answer text. */
  mustConcepts?: string[];
  /** Phrases/patterns that indicate confident false claims. */
  falseClaims?: string[];
  /** Metaphors that must not trigger bad-example similarity caps. */
  neutralMetaphors?: string[];
  /** Concept groups for proportional partial floors (any hit in group counts). */
  requiredConceptGroups?: string[][];
  /** Minimum mustConcepts hits required for positive floor (default: 1). */
  minMatchedConcepts?: number;
  /** Fraction of checkpoint max_score when bank evidence matches (default: 0.75). */
  positiveFloorScore?: number;
  /** Fraction of max_score cap when falseClaims match (default: 0.5; use 0 for hard reject). */
  falseClaimCapFraction?: number;
  /** Probe-or-accept policy (14.18). */
  probePolicy?: CheckpointProbePolicy;
  /**
   * Bank-driven labels for depth/residual probe follow-ups.
   * `match` — evidence stems (subset/overlap with mustConcepts); `ask` — phrase shown to candidate.
   */
  probeConceptGroups?: ProbeConceptGroup[];
};

export type ProbeConceptGroup = {
  match: string[];
  ask: string;
};

export function parseCheckpointEvaluationHints(
  raw: unknown,
): CheckpointEvaluationHints | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const mustConcepts = normalizeStringArray(record.mustConcepts);
  const falseClaims = normalizeStringArray(record.falseClaims);
  const neutralMetaphors = normalizeStringArray(record.neutralMetaphors);
  const requiredConceptGroups = normalizeConceptGroups(record.requiredConceptGroups);
  const complexityTier = normalizeComplexityTier(record.complexityTier);
  const weightRationale =
    typeof record.weightRationale === 'string' &&
    record.weightRationale.trim().length > 0
      ? record.weightRationale.trim()
      : undefined;
  const minMatchedConcepts =
    typeof record.minMatchedConcepts === 'number' &&
    Number.isFinite(record.minMatchedConcepts)
      ? Math.max(1, Math.trunc(record.minMatchedConcepts))
      : undefined;
  const positiveFloorScore =
    typeof record.positiveFloorScore === 'number' &&
    Number.isFinite(record.positiveFloorScore)
      ? Math.min(1, Math.max(0, record.positiveFloorScore))
      : undefined;
  const falseClaimCapFraction =
    typeof record.falseClaimCapFraction === 'number' &&
    Number.isFinite(record.falseClaimCapFraction)
      ? Math.min(1, Math.max(0, record.falseClaimCapFraction))
      : undefined;
  const probePolicy = parseProbePolicy(record.probePolicy);
  const probeConceptGroups = normalizeProbeConceptGroups(record.probeConceptGroups);

  if (
    mustConcepts.length === 0 &&
    falseClaims.length === 0 &&
    neutralMetaphors.length === 0 &&
    requiredConceptGroups.length === 0 &&
    minMatchedConcepts === undefined &&
    positiveFloorScore === undefined &&
    falseClaimCapFraction === undefined &&
    complexityTier === undefined &&
    weightRationale === undefined &&
    probePolicy === undefined &&
    probeConceptGroups.length === 0
  ) {
    return null;
  }

  return {
    complexityTier,
    weightRationale,
    mustConcepts: mustConcepts.length > 0 ? mustConcepts : undefined,
    falseClaims: falseClaims.length > 0 ? falseClaims : undefined,
    neutralMetaphors:
      neutralMetaphors.length > 0 ? neutralMetaphors : undefined,
    requiredConceptGroups:
      requiredConceptGroups.length > 0 ? requiredConceptGroups : undefined,
    minMatchedConcepts,
    positiveFloorScore,
    falseClaimCapFraction,
    probePolicy,
    probeConceptGroups:
      probeConceptGroups.length > 0 ? probeConceptGroups : undefined,
  };
}

function parseProbePolicy(raw: unknown): CheckpointProbePolicy | undefined {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return undefined;
  }

  const record = raw as Record<string, unknown>;
  const requireProbeBeforeFinalPartial =
    typeof record.requireProbeBeforeFinalPartial === 'boolean'
      ? record.requireProbeBeforeFinalPartial
      : undefined;
  const shallowAcceptMaxFraction = normalizeFraction(
    record.shallowAcceptMaxFraction,
  );
  const minScoreAfterShallowAccept = normalizeFraction(
    record.minScoreAfterShallowAccept,
  );
  const allowResidualGapProbe =
    typeof record.allowResidualGapProbe === 'boolean'
      ? record.allowResidualGapProbe
      : undefined;

  if (
    requireProbeBeforeFinalPartial === undefined &&
    shallowAcceptMaxFraction === undefined &&
    minScoreAfterShallowAccept === undefined &&
    allowResidualGapProbe === undefined
  ) {
    return undefined;
  }

  return {
    requireProbeBeforeFinalPartial,
    shallowAcceptMaxFraction,
    minScoreAfterShallowAccept,
    allowResidualGapProbe,
  };
}

function normalizeProbeConceptGroups(value: unknown): ProbeConceptGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const groups: ProbeConceptGroup[] = [];

  for (const item of value) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      continue;
    }

    const record = item as Record<string, unknown>;
    const match = normalizeStringArray(record.match);
    const ask =
      typeof record.ask === 'string' && record.ask.trim().length > 0
        ? record.ask.trim()
        : '';

    if (match.length > 0 && ask.length > 0) {
      groups.push({ match, ask });
    }
  }

  return groups;
}

function normalizeFraction(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.min(1, Math.max(0, value));
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeConceptGroups(value: unknown): string[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((group): group is unknown[] => Array.isArray(group))
    .map((group) => normalizeStringArray(group))
    .filter((group) => group.length > 0);
}

const COMPLEXITY_TIERS: CheckpointComplexityTier[] = [
  'mention',
  'basic',
  'core_plus',
  'intermediate',
  'advanced',
  'expert',
];

function normalizeComplexityTier(
  value: unknown,
): CheckpointComplexityTier | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase() as CheckpointComplexityTier;
  return COMPLEXITY_TIERS.includes(normalized) ? normalized : undefined;
}
