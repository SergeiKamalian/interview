import {
  buildQuestionEvaluationPayload,
  summarizeCheckpointResults,
} from './question-evaluation.mapper';

describe('question-evaluation.mapper', () => {
  const checkpoints = [
    {
      checkpointKey: 'react_definition',
      title: 'Defines React',
      expected: 'UI library',
      score: 5,
      sortOrder: 0,
    },
    {
      checkpointKey: 'component_model',
      title: 'Component model',
      expected: 'Mentions components',
      score: 5,
      sortOrder: 1,
    },
  ];

  it('computes score from checkpoint statuses', () => {
    const summary = summarizeCheckpointResults(
      checkpoints,
      [
        {
          checkpointKey: 'react_definition',
          status: 'met',
          confidence: 0.9,
          evidenceQuote: 'React is a UI library',
          reasoningShort: 'Correct definition.',
        },
        {
          checkpointKey: 'component_model',
          status: 'partially_met',
          confidence: 0.5,
          evidenceQuote: 'components',
          reasoningShort: 'Mentioned components briefly.',
        },
      ],
      false,
    );

    expect(summary.score).toBe(7.5);
    expect(summary.maxScore).toBe(10);
    expect(summary.strengths).toEqual(['Defines React']);
    expect(summary.gaps).toEqual(['Component model']);
    expect(summary.needsManualReview).toBe(true);
  });

  it('builds upsert payload with raw response audit fields', () => {
    const payload = buildQuestionEvaluationPayload({
      companyId: 1,
      interviewAttemptId: 2,
      interviewMessageId: 3,
      interviewQuestionId: 4,
      checkpoints,
      checkpointResults: [
        {
          checkpointKey: 'react_definition',
          status: 'not_met',
          confidence: 0.1,
          evidenceQuote: '',
          reasoningShort: 'Missing.',
        },
        {
          checkpointKey: 'component_model',
          status: 'not_met',
          confidence: 0.1,
          evidenceQuote: '',
          reasoningShort: 'Missing.',
        },
      ],
      rawResponse: { checkpoints: [] },
      repairAttempted: true,
    });

    expect(payload.score).toBe(0);
    expect(payload.maxScore).toBe(10);
    expect(payload.needsManualReview).toBe(true);
    expect(payload.interviewMessageId).toBe(3);
  });
});
