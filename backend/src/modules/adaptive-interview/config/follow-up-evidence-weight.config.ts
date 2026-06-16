export const FOLLOW_UP_EVIDENCE_WEIGHT_DEFAULTS = {
  scoreDeltaCap: 0.25,
  maxRelativeBoost: 0.5,
  stagnationLimit: 2,
} as const;

export function getFollowUpEvidenceWeightConfig(): {
  scoreDeltaCap: number;
  maxRelativeBoost: number;
  stagnationLimit: number;
} {
  return {
    scoreDeltaCap: readPositiveFloat(
      process.env.FOLLOW_UP_SCORE_DELTA_CAP,
      FOLLOW_UP_EVIDENCE_WEIGHT_DEFAULTS.scoreDeltaCap,
    ),
    maxRelativeBoost: readPositiveFloat(
      process.env.FOLLOW_UP_MAX_RELATIVE_BOOST,
      FOLLOW_UP_EVIDENCE_WEIGHT_DEFAULTS.maxRelativeBoost,
    ),
    stagnationLimit: readPositiveInt(
      process.env.FOLLOW_UP_STAGNATION_LIMIT,
      FOLLOW_UP_EVIDENCE_WEIGHT_DEFAULTS.stagnationLimit,
    ),
  };
}

function readPositiveFloat(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}
