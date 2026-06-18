import { shouldScoreTopicOpenerAnswer } from './topic-opener-scoring.util';

describe('shouldScoreTopicOpenerAnswer', () => {
  it('scores when scoring gate says yes', () => {
    expect(
      shouldScoreTopicOpenerAnswer({
        evaluationMode: 'full',
        candidateTurnKind: 'substantive_answer',
        gateShouldScore: true,
      }),
    ).toBe(true);
  });

  it('skips when scoring gate says no', () => {
    expect(
      shouldScoreTopicOpenerAnswer({
        evaluationMode: 'full',
        candidateTurnKind: 'substantive_answer',
        gateShouldScore: false,
      }),
    ).toBe(false);
  });

  it('falls back to classifier opener_readiness=ready when gate unavailable', () => {
    expect(
      shouldScoreTopicOpenerAnswer({
        evaluationMode: 'full',
        candidateTurnKind: 'substantive_answer',
        gateShouldScore: null,
        openerReadinessFallback: 'ready',
      }),
    ).toBe(true);

    expect(
      shouldScoreTopicOpenerAnswer({
        evaluationMode: 'full',
        candidateTurnKind: 'substantive_answer',
        gateShouldScore: null,
        openerReadinessFallback: 'uncertain',
      }),
    ).toBe(false);
  });

  it('skips meta and decline turns regardless of gate', () => {
    expect(
      shouldScoreTopicOpenerAnswer({
        evaluationMode: 'clarification',
        candidateTurnKind: 'scope_clarification',
        gateShouldScore: true,
      }),
    ).toBe(false);

    expect(
      shouldScoreTopicOpenerAnswer({
        evaluationMode: 'skip',
        candidateTurnKind: 'decline_whole',
        gateShouldScore: true,
      }),
    ).toBe(false);
  });
});
