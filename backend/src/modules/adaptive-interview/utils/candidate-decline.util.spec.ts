import { shouldSkipFollowUps } from './candidate-decline.util';

describe('shouldSkipFollowUps', () => {
  it('skips follow-ups on whole decline from classifier', () => {
    expect(
      shouldSkipFollowUps({
        candidateTurnKind: 'decline_whole',
        aiDisposition: 'engaged',
      }),
    ).toBe(true);
  });

  it('does not skip follow-ups on scoped decline from classifier', () => {
    expect(
      shouldSkipFollowUps({
        candidateTurnKind: 'decline_scoped',
        aiDisposition: 'declined',
        followUpsUsedForQuestion: 3,
      }),
    ).toBe(false);
  });

  it('detects AI negative disposition without regex fallback', () => {
    expect(
      shouldSkipFollowUps({
        aiDisposition: 'confused',
        followUpsUsedForQuestion: 0,
      }),
    ).toBe(false);
    expect(
      shouldSkipFollowUps({
        aiDisposition: 'confused',
        followUpsUsedForQuestion: 1,
      }),
    ).toBe(true);
    expect(
      shouldSkipFollowUps({
        aiDisposition: 'declined',
        followUpsUsedForQuestion: 0,
      }),
    ).toBe(true);
  });
});
