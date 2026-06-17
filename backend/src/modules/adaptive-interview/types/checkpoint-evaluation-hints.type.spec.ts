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

  it('parses neutral metaphors and concept groups', () => {
    expect(
      parseCheckpointEvaluationHints({
        neutralMetaphors: ['карточка'],
        requiredConceptGroups: [['child', 'sibling'], ['return']],
      }),
    ).toEqual({
      neutralMetaphors: ['карточка'],
      requiredConceptGroups: [['child', 'sibling'], ['return']],
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

  it('parses probePolicy from bank JSON', () => {
    expect(
      parseCheckpointEvaluationHints({
        complexityTier: 'advanced',
        probePolicy: {
          requireProbeBeforeFinalPartial: true,
          minScoreAfterShallowAccept: 0.55,
        },
        mustConcepts: ['scheduler'],
      }),
    ).toEqual({
      complexityTier: 'advanced',
      probePolicy: {
        requireProbeBeforeFinalPartial: true,
        minScoreAfterShallowAccept: 0.55,
      },
      mustConcepts: ['scheduler'],
    });
  });

  it('parses probeConceptGroups from bank JSON', () => {
    expect(
      parseCheckpointEvaluationHints({
        mustConcepts: ['scheduler'],
        probeConceptGroups: [
          { match: ['scheduler', 'планирован'], ask: 'scheduler' },
          { match: ['MessageChannel'], ask: 'MessageChannel' },
        ],
      }),
    ).toEqual({
      mustConcepts: ['scheduler'],
      probeConceptGroups: [
        { match: ['scheduler', 'планирован'], ask: 'scheduler' },
        { match: ['MessageChannel'], ask: 'MessageChannel' },
      ],
    });
  });

  it('returns null for empty hints', () => {
    expect(parseCheckpointEvaluationHints(null)).toBeNull();
    expect(parseCheckpointEvaluationHints({})).toBeNull();
  });
});
