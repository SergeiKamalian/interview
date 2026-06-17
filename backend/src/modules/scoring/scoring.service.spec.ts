import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  const service = new ScoringService();

  it('returns zero score for empty question list', () => {
    const result = service.calculateInterviewScore([]);

    expect(result.finalScore).toBe(0);
    expect(result.totalScoreOutOfTen).toBe(0);
    expect(result.totalWeight).toBe(0);
    expect(result.strengthCategory).toBe('weak');
    expect(result.category).toBe('weak');
    expect(result.hireRecommendation).toBe('strong_reject');
  });

  it('calculates weighted final score across topics', () => {
    const result = service.calculateInterviewScore([
      {
        interviewQuestionId: 1,
        topicName: 'HTML/CSS basics',
        difficulty: 'basic',
        level: 'junior',
        score: 8,
        maxScore: 10,
        topicWeight: 2,
        needsManualReview: false,
      },
      {
        interviewQuestionId: 2,
        topicName: 'React',
        difficulty: 'intermediate',
        level: 'middle',
        score: 5,
        maxScore: 10,
        topicWeight: 5,
        needsManualReview: false,
      },
      {
        interviewQuestionId: 3,
        topicName: 'TypeScript',
        difficulty: 'intermediate',
        level: 'middle',
        score: 9,
        maxScore: 10,
        topicWeight: 3,
        needsManualReview: false,
      },
    ]);

    expect(result.finalScore).toBe(6.8);
    expect(result.totalScoreOutOfTen).toBe(6.8);
    expect(result.totalWeight).toBe(10);
    expect(result.averageScore).toBe(7.3);
    expect(result.strengthCategory).toBe('medium');
    expect(result.topics).toEqual([
      {
        topic: 'HTML/CSS basics',
        score: 8,
        weight: 2,
        weightedScore: 16,
        strengthCategory: 'strong',
      },
      {
        topic: 'React',
        score: 5,
        weight: 5,
        weightedScore: 25,
        strengthCategory: 'medium',
      },
      {
        topic: 'TypeScript',
        score: 9,
        weight: 3,
        weightedScore: 27,
        strengthCategory: 'strong',
      },
    ]);
    expect(result.breakdown).toHaveLength(3);
  });

  it('uses default topic weight of 1 when weight is missing', () => {
    const result = service.calculateInterviewScore([
      {
        interviewQuestionId: 1,
        topicName: 'React',
        difficulty: 'intermediate',
        level: 'middle',
        score: 6,
        maxScore: 10,
        needsManualReview: false,
      },
      {
        interviewQuestionId: 2,
        topicName: 'TypeScript',
        difficulty: 'basic',
        level: 'junior',
        score: 8,
        maxScore: 10,
        needsManualReview: false,
      },
    ]);

    expect(result.finalScore).toBe(7);
    expect(result.totalWeight).toBe(2);
  });

  it('aggregates multiple questions in the same topic before weighting', () => {
    const result = service.calculateInterviewScore([
      {
        interviewQuestionId: 1,
        topicName: 'React',
        difficulty: 'intermediate',
        level: 'middle',
        score: 4,
        maxScore: 10,
        topicWeight: 5,
        needsManualReview: false,
      },
      {
        interviewQuestionId: 2,
        topicName: 'React',
        difficulty: 'advanced',
        level: 'senior',
        score: 6,
        maxScore: 10,
        topicWeight: 5,
        needsManualReview: false,
      },
    ]);

    expect(result.topics).toHaveLength(1);
    expect(result.topics[0]?.score).toBe(5);
    expect(result.topics[0]?.weight).toBe(5);
    expect(result.finalScore).toBe(5);
  });

  it('flags manual review when any question needs it', () => {
    const result = service.calculateInterviewScore([
      {
        interviewQuestionId: 1,
        topicName: 'React',
        difficulty: 'intermediate',
        level: 'middle',
        score: 2,
        maxScore: 10,
        needsManualReview: true,
      },
    ]);

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
        topicWeight: 8,
        needsManualReview: false,
      },
    ]);

    expect(result.finalScore).toBe(0);
    expect(result.strengthCategory).toBe('weak');
  });
});
