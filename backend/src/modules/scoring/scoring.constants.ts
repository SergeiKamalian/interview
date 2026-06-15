export const SCORE_NORMALIZED_MIN = 0;
export const SCORE_NORMALIZED_MAX = 100;

export const DEFAULT_SCORE_THRESHOLDS = {
  weak: 40,
  basic: 55,
  average: 70,
  good: 85,
} as const;

export const DEFAULT_HIRE_THRESHOLDS = {
  strongReject: 35,
  reject: 50,
  maybe: 65,
  invite: 80,
} as const;

export type ScoreThresholds = {
  weak: number;
  basic: number;
  average: number;
  good: number;
};

export type HireThresholds = {
  strongReject: number;
  reject: number;
  maybe: number;
  invite: number;
};

export function readScoreThresholds(
  env: NodeJS.ProcessEnv = process.env,
): ScoreThresholds {
  return {
    weak: readThreshold(
      env.SCORE_THRESHOLD_WEAK,
      DEFAULT_SCORE_THRESHOLDS.weak,
    ),
    basic: readThreshold(
      env.SCORE_THRESHOLD_BASIC,
      DEFAULT_SCORE_THRESHOLDS.basic,
    ),
    average: readThreshold(
      env.SCORE_THRESHOLD_AVERAGE,
      DEFAULT_SCORE_THRESHOLDS.average,
    ),
    good: readThreshold(
      env.SCORE_THRESHOLD_GOOD,
      DEFAULT_SCORE_THRESHOLDS.good,
    ),
  };
}

export function readHireThresholds(
  env: NodeJS.ProcessEnv = process.env,
): HireThresholds {
  return {
    strongReject: readThreshold(
      env.SCORE_THRESHOLD_STRONG_REJECT,
      DEFAULT_HIRE_THRESHOLDS.strongReject,
    ),
    reject: readThreshold(
      env.SCORE_THRESHOLD_REJECT,
      DEFAULT_HIRE_THRESHOLDS.reject,
    ),
    maybe: readThreshold(
      env.SCORE_THRESHOLD_MAYBE,
      DEFAULT_HIRE_THRESHOLDS.maybe,
    ),
    invite: readThreshold(
      env.SCORE_THRESHOLD_INVITE,
      DEFAULT_HIRE_THRESHOLDS.invite,
    ),
  };
}

function readThreshold(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}
