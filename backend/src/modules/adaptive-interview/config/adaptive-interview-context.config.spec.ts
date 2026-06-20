import {
  applyProbingDepthToLimits,
  getAdaptiveInterviewContextLimits,
  type AdaptiveInterviewContextLimits,
} from './adaptive-interview-context.config';

describe('applyProbingDepthToLimits (TASK-16.9)', () => {
  const base: AdaptiveInterviewContextLimits =
    getAdaptiveInterviewContextLimits();

  it('balanced keeps defaults unchanged', () => {
    expect(applyProbingDepthToLimits(base, 'balanced')).toEqual(base);
  });

  it('deep probes more and stops later than shallow', () => {
    const shallow = applyProbingDepthToLimits(base, 'shallow');
    const balanced = applyProbingDepthToLimits(base, 'balanced');
    const deep = applyProbingDepthToLimits(base, 'deep');

    // More follow-up budget per question as depth increases.
    expect(shallow.maxFollowUpsPerQuestion).toBeLessThan(
      balanced.maxFollowUpsPerQuestion,
    );
    expect(deep.maxFollowUpsPerQuestion).toBeGreaterThan(
      balanced.maxFollowUpsPerQuestion,
    );

    // Deeper heavy-checkpoint drilling as depth increases.
    expect(shallow.maxFollowUpsHeavyCheckpoint).toBeLessThanOrEqual(
      balanced.maxFollowUpsHeavyCheckpoint,
    );
    expect(deep.maxFollowUpsHeavyCheckpoint).toBeGreaterThan(
      balanced.maxFollowUpsHeavyCheckpoint,
    );

    // shallow reaches "sufficient" sooner (lower bar); deep keeps probing (higher bar).
    expect(shallow.questionScoreSufficientRatio).toBeLessThan(
      balanced.questionScoreSufficientRatio,
    );
    expect(deep.questionScoreSufficientRatio).toBeGreaterThan(
      balanced.questionScoreSufficientRatio,
    );

    // shallow probes only high-priority checkpoints; deep also probes low-priority gaps.
    expect(shallow.minPriorityToProbe).toBeGreaterThan(
      balanced.minPriorityToProbe,
    );
    expect(deep.minPriorityToProbe).toBeLessThan(balanced.minPriorityToProbe);
  });

  it('keeps ratios within [0,1] and budgets >= 0', () => {
    for (const depth of ['shallow', 'balanced', 'deep'] as const) {
      const limits = applyProbingDepthToLimits(base, depth);
      expect(limits.questionScoreSufficientRatio).toBeGreaterThanOrEqual(0);
      expect(limits.questionScoreSufficientRatio).toBeLessThanOrEqual(1);
      expect(limits.minPriorityToProbe).toBeGreaterThanOrEqual(0);
      expect(limits.minPriorityToProbe).toBeLessThanOrEqual(1);
      expect(limits.maxFollowUpsPerQuestion).toBeGreaterThanOrEqual(1);
      expect(limits.maxFollowUpsHeavyCheckpoint).toBeGreaterThanOrEqual(0);
    }
  });

  it('does not mutate the input limits object', () => {
    const snapshot = { ...base };
    applyProbingDepthToLimits(base, 'deep');
    expect(base).toEqual(snapshot);
  });
});
