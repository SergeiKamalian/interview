import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import {
  getContradictionScoreCap,
  getPositiveEvidenceScoreFloor,
} from './hint-driven-evidence.util';

const schedulingHints: CheckpointEvaluationHints = {
  mustConcepts: ['MessageChannel', 'shouldYield', 'scheduler', 'планирован'],
  falseClaims: ['requestIdleCallback'],
  minMatchedConcepts: 2,
  positiveFloorScore: 0.85,
};

describe('hint-driven-evidence.util', () => {
  it('raises positive floor from mustConcepts without AI rationale gate', () => {
    const floor = getPositiveEvidenceScoreFloor(
      schedulingHints,
      'scheduler yield через message channel',
      'scheduler yield через message channel, не idle callback',
      1,
    );

    expect(floor).toBe(0.85);
  });

  it('caps score when falseClaims match in candidate text', () => {
    const cap = getContradictionScoreCap(
      {
        checkpointKey: 'scheduling',
        evaluationHints: schedulingHints,
      },
      'fiber uses requestidlecallback for scheduling',
      1,
    );

    expect(cap).toBe(0.5);
  });

  it('falls back to legacy contradiction cap for generics without hints', () => {
    const cap = getContradictionScoreCap(
      { checkpointKey: 'type_safety', evaluationHints: null },
      'можно передать string, а вернуть number, это type safe',
      1,
    );

    expect(cap).toBe(0);
  });

  it('ignores denied requestIdleCallback claims', () => {
    const cap = getContradictionScoreCap(
      {
        checkpointKey: 'scheduling',
        evaluationHints: schedulingHints,
      },
      'не requestIdleCallback, а MessageChannel',
      1,
    );

    expect(cap).toBeNull();
  });
});
