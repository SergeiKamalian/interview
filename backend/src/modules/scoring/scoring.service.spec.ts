import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  const service = new ScoringService();

  it('returns zero score for empty question list', () => {
    const result = service.calculateInterviewScore([]);

    expect(result.totalScoreNormalized).toBe(0);
    expect(result.category).toBe('weak');
    expect(result.hireRecommendation).toBe('strong_reject');
  });

  it('aggregates mixed question scores deterministically', () => {
    const result = service.calculateInterviewScore([
      {
        interviewQuestionId: 1,
        topicName: 'React',
        difficulty: 'intermediate',
        level: 'middle',
        score: 8,
        maxScore: 10,
        needsManualReview: false,
      },
      {
        interviewQuestionId: 2,
        topicName: 'TypeScript',
        difficulty: 'basic',
        level: 'junior',
        score: 2,
        maxScore: 10,
        needsManualReview: true,
      },
    ]);

    expect(result.totalScoreNormalized).toBe(50);
    expect(result.totalScoreOutOfTen).toBe(5);
    expect(result.breakdown).toHaveLength(2);
    expect(result.needsManualReview).toBe(true);
  });

  it('returns zero when all checkpoints are not met', () => {
    const result = service.calculateInterviewScore([
      {
        interviewQuestionId: 1,
        topicName: 'React',
        difficulty: 'intermediate',
        level: 'middle',
        score: 0,
        maxScore: 10,
        needsManualReview: false,
      },
    ]);

    expect(result.totalScoreNormalized).toBe(0);
    expect(result.category).toBe('weak');
  });
});
