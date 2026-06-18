import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';
import {
  computeGapScore,
  computeProbePriority,
} from './probe-priority.util';

const defaultBudgetConfig = {
  maxFollowUpsPerQuestion: 4,
  maxFollowUpsHeavyCheckpoint: 2,
  heavyCheckpointWeightRatio: 0.2,
  minPriorityToProbe: 0.15,
};

describe('computeProbePriority', () => {
  it('ranks scheduling above fiber_pointers for partial Fiber answer', () => {
    const candidateText =
      'Планирование Fiber — приоритеты ввода. У Fiber child sibling return.';

    const scheduling = computeProbePriority({
      checkpoint: fiberCheckpoint('scheduling', { score: 2.5 }),
      state: { status: 'partial' },
      hints: fiberCheckpoint('scheduling').evaluationHints,
      questionMaxScore: 8,
      candidateEvidenceText: candidateText,
    });
    const pointers = computeProbePriority({
      checkpoint: fiberCheckpoint('fiber_pointers', { score: 1 }),
      state: { status: 'partial' },
      hints: fiberCheckpoint('fiber_pointers').evaluationHints,
      questionMaxScore: 8,
      candidateEvidenceText: candidateText,
    });

    expect(scheduling.priority).toBeGreaterThan(pointers.priority);
    expect(scheduling.priority).toBeGreaterThanOrEqual(
      defaultBudgetConfig.minPriorityToProbe,
    );
    expect(pointers.priority).toBeLessThan(
      defaultBudgetConfig.minPriorityToProbe,
    );
  });

  it('computes gapScore from mustConcepts coverage', () => {
    const hints = fiberCheckpoint('scheduling').evaluationHints;
    const fullGap = computeGapScore(hints, 'приоритеты ввода');
    const partialGap = computeGapScore(
      hints,
      'scheduler планирован MessageChannel shouldYield yield',
    );

    expect(fullGap).toBeGreaterThan(partialGap);
    expect(partialGap).toBeGreaterThanOrEqual(0);
    expect(partialGap).toBeLessThanOrEqual(1);
  });
});
