import {
  buildFinalEvidenceContext,
} from './final-evidence-context.util';

describe('buildFinalEvidenceContext', () => {
  it('builds compact final context without full transcript', () => {
    const context = buildFinalEvidenceContext({
      summaries: [
        {
          id: 1,
          companyId: 1,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          score: 2,
          maxScore: 3,
          summary: '1/2 checkpoints covered. Score 2/3.',
          strengths: ['Dependency array'],
          weaknesses: ['Cleanup'],
          unclearCheckpoints: null,
          followUpCount: 1,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      totalScoreOutOfTen: 6.5,
      category: 'average',
      hireRecommendation: 'maybe',
      categoryBreakdown: ['React=0.7 weight=1 contribution=0.7'],
    });

    expect(context.source).toBe('adaptive_summaries');
    expect(context.includesFullTranscript).toBe(false);
    expect(context.questionSummaries[0]).toContain('score 2/3');
  });
});
