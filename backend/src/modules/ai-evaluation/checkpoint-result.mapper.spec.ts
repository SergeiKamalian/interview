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
      matched: true,
      scoreAwarded: 5,
      evidenceQuote: 'UI library',
    });
  });
});
