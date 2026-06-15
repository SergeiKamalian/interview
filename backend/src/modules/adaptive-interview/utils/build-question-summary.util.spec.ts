import { buildQuestionSummaryFromCheckpointStates } from './build-question-summary.util';

describe('buildQuestionSummaryFromCheckpointStates', () => {
  it('calculates deterministic score from checkpoint states', () => {
    const summary = buildQuestionSummaryFromCheckpointStates({
      companyId: 1,
      attemptId: 5,
      interviewQuestionId: 10,
      followUpCount: 1,
      checkpoints: [
        {
          id: 1,
          interviewQuestionId: 10,
          checkpointKey: 'dependency_array',
          title: 'Dependency array',
          expected: 'Explains deps',
          score: 2,
          sortOrder: 0,
          createdAt: new Date(),
        },
        {
          id: 2,
          interviewQuestionId: 10,
          checkpointKey: 'cleanup',
          title: 'Cleanup',
          expected: 'Explains cleanup',
          score: 1,
          sortOrder: 1,
          createdAt: new Date(),
        },
      ],
      states: [
        {
          id: 1,
          companyId: 1,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          checkpointKey: 'dependency_array',
          status: 'covered',
          scoreAwarded: 2,
          maxScore: 2,
          confidence: 0.9,
          evidenceSummary: 'Mentioned deps',
          evidenceMessageIds: [22],
          rationale: 'Clear',
          followUpCount: 0,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          companyId: 1,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          checkpointKey: 'cleanup',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1,
          confidence: 0.8,
          evidenceSummary: null,
          evidenceMessageIds: null,
          rationale: 'Not mentioned',
          followUpCount: 1,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    expect(summary.score).toBe(2);
    expect(summary.maxScore).toBe(3);
    expect(summary.strengths).toEqual(['Dependency array']);
    expect(summary.weaknesses).toEqual(['Cleanup']);
    expect(summary.followUpCount).toBe(1);
  });
});
