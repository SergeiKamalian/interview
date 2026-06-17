import { aggregateCheckpointRedFlags } from './checkpoint-red-flags.util';

describe('aggregateCheckpointRedFlags', () => {
  it('creates red flag for semantic false claim from hints', () => {
    const flags = aggregateCheckpointRedFlags([
      {
        checkpointKey: 'scheduling',
        checkpointTitle: 'Планирование Fiber',
        rationale:
          'requestIdleCallback is wrong. depth=false_claim coverage=high accuracy=wrong',
        evidenceSummary: 'Fiber использует requestIdleCallback для планирования',
        status: 'partial',
      },
    ]);

    expect(flags).toHaveLength(1);
    expect(flags[0]?.candidateQuote).toContain('requestIdleCallback');
  });

  it('does not create red flag for bad-example similarity cap', () => {
    const flags = aggregateCheckpointRedFlags([
      {
        checkpointKey: 'fiber_pointers',
        checkpointTitle: 'Структура fiber-узла',
        rationale:
          'similarity=bad_example. Score capped: overlaps bad answer example.',
        evidenceSummary:
          'fiber-узел — внутренняя карточка react для конкретного элемента',
        status: 'partial',
      },
    ]);

    expect(flags).toHaveLength(0);
  });

  it('does not create red flag when priorities quote is attached to scheduling', () => {
    const flags = aggregateCheckpointRedFlags([
      {
        checkpointKey: 'scheduling',
        checkpointTitle: 'Планирование Fiber',
        rationale:
          'Missing scheduler details. similarity=bad_example. Score capped: overlaps bad answer example.',
        evidenceSummary:
          'приоритеты в fiber — это идея, что не все обновления одинаково важны',
        status: 'partial',
        evaluationHints: {
          falseClaims: ['requestIdleCallback', 'idle callback'],
        },
      },
    ]);

    expect(flags).toHaveLength(0);
  });
});
