import { parseCheckpointEvaluationHints } from './checkpoint-evaluation-hints.type';

describe('parseCheckpointEvaluationHints', () => {
  it('parses valid JSON object', () => {
    expect(
      parseCheckpointEvaluationHints({
        mustConcepts: ['MessageChannel'],
        falseClaims: ['requestIdleCallback'],
        positiveFloorScore: 0.8,
      }),
    ).toEqual({
      mustConcepts: ['MessageChannel'],
      falseClaims: ['requestIdleCallback'],
      positiveFloorScore: 0.8,
    });
  });

  it('parses JSON string from MySQL', () => {
    expect(
      parseCheckpointEvaluationHints(
        '{"mustConcepts":["child","sibling"],"positiveFloorScore":0.75}',
      ),
    ).toEqual({
      mustConcepts: ['child', 'sibling'],
      positiveFloorScore: 0.75,
    });
  });

  it('parses complexity tier metadata', () => {
    expect(
      parseCheckpointEvaluationHints({
        complexityTier: 'intermediate',
        weightRationale: 'production pitfall',
        mustConcepts: ['ErrorBoundary'],
      }),
    ).toEqual({
      complexityTier: 'intermediate',
      weightRationale: 'production pitfall',
      mustConcepts: ['ErrorBoundary'],
    });
  });

  it('returns null for empty hints', () => {
    expect(parseCheckpointEvaluationHints(null)).toBeNull();
    expect(parseCheckpointEvaluationHints({})).toBeNull();
  });
});
