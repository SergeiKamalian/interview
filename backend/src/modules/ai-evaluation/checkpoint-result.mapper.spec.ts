import { mapCheckpointResultsForStorage } from './checkpoint-result.mapper';

describe('checkpoint-result.mapper', () => {
  it('maps checkpoint statuses to matched and score_awarded', () => {
    const rows = mapCheckpointResultsForStorage(
      [
        {
          checkpointKey: 'react_definition',
          title: 'Defines React',
          expected: 'UI library',
          score: 10,
          sortOrder: 0,
        },
      ],
      [
        {
          checkpointKey: 'react_definition',
          status: 'partially_met',
          confidence: 0.6,
          evidenceQuote: 'UI library',
          reasoningShort: 'Partial answer.',
        },
      ],
    );

    expect(rows[0]).toEqual({
      checkpointKey: 'react_definition',
      matched: false,
      scoreAwarded: 5,
      evidenceQuote: 'UI library',
    });
  });

  it('uses adaptive score_awarded when provided', () => {
    const rows = mapCheckpointResultsForStorage(
      [
        {
          checkpointKey: 'stack_vs_fiber',
          title: 'Stack vs Fiber',
          expected: 'Compare',
          score: 1.5,
          sortOrder: 0,
        },
      ],
      [
        {
          checkpointKey: 'stack_vs_fiber',
          status: 'partially_met',
          confidence: 0.7,
          evidenceQuote: 'sync vs pause',
          reasoningShort: 'Strong partial.',
          scoreAwarded: 1.3,
        },
      ],
    );

    expect(rows[0]).toEqual({
      checkpointKey: 'stack_vs_fiber',
      matched: true,
      scoreAwarded: 1.3,
      evidenceQuote: 'sync vs pause',
    });
  });
});
