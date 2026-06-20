import { mapFinalEvaluationToGraphql } from './ai-evaluation.mapper';
import type { FinalEvaluationEntity } from './entities/final-evaluation.entity';

function buildEntity(
  overrides: Partial<FinalEvaluationEntity> = {},
): FinalEvaluationEntity {
  return {
    id: 1,
    companyId: 10,
    interviewAttemptId: 102,
    totalScore: 7.5,
    category: 'good',
    hireRecommendation: 'invite',
    achievedLevel: 'middle',
    achievedLevelMethod: 'evidence',
    summary: 'summary',
    detailedSummary: null,
    strengths: [],
    weaknesses: [],
    risks: [],
    rawResponse: {
      achievedLevelResult: {
        perLevel: [
          {
            level: 'junior',
            earned: 9,
            maxScore: 10,
            ratio: 0.9,
            passed: true,
          },
          {
            level: 'middle',
            earned: 8,
            maxScore: 10,
            ratio: 0.8,
            passed: true,
          },
        ],
        note: null,
      },
    },
    needsManualReview: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('mapFinalEvaluationToGraphql achieved level exposure', () => {
  it('maps achievedLevel, targetLevel and levelBreakdown from entity + raw_response', () => {
    const result = mapFinalEvaluationToGraphql(
      buildEntity(),
      undefined,
      'lead',
    );

    expect(result.achievedLevel).toBe('middle');
    expect(result.achievedLevelMethod).toBe('evidence');
    expect(result.targetLevel).toBe('lead');
    expect(result.achievedLevelNote).toBeNull();
    expect(result.levelBreakdown).toEqual([
      { level: 'junior', earned: 9, maxScore: 10, ratio: 0.9, passed: true },
      { level: 'middle', earned: 8, maxScore: 10, ratio: 0.8, passed: true },
    ]);
  });

  it('exposes the estimate note and null achievedLevel when below the tested level', () => {
    const result = mapFinalEvaluationToGraphql(
      buildEntity({
        achievedLevel: null,
        achievedLevelMethod: 'estimate',
        rawResponse: {
          achievedLevelResult: {
            perLevel: [
              {
                level: 'senior',
                earned: 2,
                maxScore: 10,
                ratio: 0.2,
                passed: false,
              },
            ],
            note: 'Add lower-level calibration questions for a precise demonstrated level.',
          },
        },
      }),
      undefined,
      'senior',
    );

    expect(result.achievedLevel).toBeNull();
    expect(result.achievedLevelMethod).toBe('estimate');
    expect(result.targetLevel).toBe('senior');
    expect(result.achievedLevelNote).toContain('calibration');
    expect(result.levelBreakdown).toHaveLength(1);
    expect(result.levelBreakdown[0].passed).toBe(false);
  });

  it('degrades to empty breakdown and null targetLevel for legacy rows', () => {
    const result = mapFinalEvaluationToGraphql(
      buildEntity({ rawResponse: { deterministicScore: {} } }),
    );

    expect(result.levelBreakdown).toEqual([]);
    expect(result.achievedLevelNote).toBeNull();
    expect(result.targetLevel).toBeNull();
    // achievedLevel column is still surfaced even without raw_response detail.
    expect(result.achievedLevel).toBe('middle');
  });
});
