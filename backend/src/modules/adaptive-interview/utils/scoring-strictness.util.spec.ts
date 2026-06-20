import {
  getScoringStrictnessScoreMultiplier,
  scaleGuardScore,
} from './scoring-strictness.util';

describe('scoring-strictness.util (TASK-16.10)', () => {
  describe('getScoringStrictnessScoreMultiplier', () => {
    it('returns exactly 1 for balanced and undefined (golden-calibration no-op)', () => {
      expect(getScoringStrictnessScoreMultiplier('balanced')).toBe(1);
      expect(getScoringStrictnessScoreMultiplier(undefined)).toBe(1);
    });

    it('strict cuts harder (<1) and lenient props up more (>1)', () => {
      const strict = getScoringStrictnessScoreMultiplier('strict');
      const balanced = getScoringStrictnessScoreMultiplier('balanced');
      const lenient = getScoringStrictnessScoreMultiplier('lenient');

      expect(strict).toBeLessThan(balanced);
      expect(lenient).toBeGreaterThan(balanced);
    });
  });

  describe('scaleGuardScore', () => {
    it('balanced (multiplier 1) is an exact no-op', () => {
      expect(scaleGuardScore(2, 4, 1)).toBe(2);
      expect(scaleGuardScore(0, 4, 1)).toBe(0);
      expect(scaleGuardScore(4, 4, 1)).toBe(4);
    });

    it('strict lowers a guard cap/floor, lenient raises it', () => {
      const cap = 2; // e.g. 50% of max_score = 4
      const maxScore = 4;
      const strict = scaleGuardScore(
        cap,
        maxScore,
        getScoringStrictnessScoreMultiplier('strict'),
      );
      const lenient = scaleGuardScore(
        cap,
        maxScore,
        getScoringStrictnessScoreMultiplier('lenient'),
      );

      expect(strict).toBeLessThan(cap);
      expect(lenient).toBeGreaterThan(cap);
      // INVARIANT: never exceeds max_score and never goes negative.
      expect(strict).toBeGreaterThanOrEqual(0);
      expect(lenient).toBeLessThanOrEqual(maxScore);
    });

    it('clamps the scaled value to [0, maxScore] (max_score never changes)', () => {
      // Lenient near the cap must not push the score above max_score.
      expect(scaleGuardScore(4, 4, 1.15)).toBe(4);
      // A zero cap stays zero under any multiplier.
      expect(scaleGuardScore(0, 4, 1.15)).toBe(0);
      expect(scaleGuardScore(0, 4, 0.85)).toBe(0);
    });
  });
});
