import type { ScoringStrictness } from '../../interview-core/types/interview-config.enum';

/**
 * Per-interview scoring strictness (TASK-16.10). A single multiplier scales the
 * deterministic guard caps AND floors in `apply-checkpoint-score-floors.util.ts`:
 *  - strict (< 1): caps cut harder + floors prop up less → lower partial scores;
 *  - balanced (= 1): EXACT no-op — guards behave byte-identically to before;
 *  - lenient (> 1): caps allow more + floors prop up more → higher partial scores.
 *
 * INVARIANT: this never changes `max_score`, checkpoints, or criteria. Scaled
 * values are always clamped to `[0, maxScore]`, so the cap/floor only shifts the
 * threshold for closing a checkpoint, never the structure. Bank-level hint
 * fractions (`falseClaimCapFraction`, `positiveFloorScore`, shallow-accept) are
 * SCALED, not overwritten — the computed cap/floor is multiplied at the call site.
 */
export function getScoringStrictnessScoreMultiplier(
  scoringStrictness: ScoringStrictness | undefined,
): number {
  switch (scoringStrictness) {
    case 'strict':
      return 0.85;
    case 'lenient':
      return 1.15;
    case 'balanced':
    default:
      return 1;
  }
}

/**
 * Scale a guard cap or floor by the strictness multiplier, clamped to
 * `[0, maxScore]`. `multiplier === 1` (balanced) returns the value untouched so
 * the balanced path is a guaranteed no-op (golden calibration unaffected).
 */
export function scaleGuardScore(
  value: number,
  maxScore: number,
  multiplier: number,
): number {
  if (multiplier === 1) {
    return value;
  }

  const scaled = Number((value * multiplier).toFixed(2));
  return Math.min(maxScore, Math.max(0, scaled));
}
