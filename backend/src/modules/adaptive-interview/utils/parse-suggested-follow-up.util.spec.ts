import { parseSuggestedFollowUpFromJson, isSuggestedFollowUpUsable } from './parse-suggested-follow-up.util';

describe('parseSuggestedFollowUpFromJson', () => {
  it('parses valid suggested follow-up', () => {
    expect(
      parseSuggestedFollowUpFromJson({
        checkpoint_key: 'cleanup',
        follow_up_question: 'Как вы делаете cleanup?',
        reason: 'missing cleanup',
      }),
    ).toEqual({
      checkpointKey: 'cleanup',
      followUpQuestion: 'Как вы делаете cleanup?',
      reason: 'missing cleanup',
    });
  });

  it('returns null for empty payload', () => {
    expect(parseSuggestedFollowUpFromJson(null)).toBeNull();
    expect(parseSuggestedFollowUpFromJson({})).toBeNull();
  });
});

describe('isSuggestedFollowUpUsable', () => {
  it('matches target checkpoint key', () => {
    const suggested = {
      checkpointKey: 'cleanup',
      followUpQuestion: 'Question?',
      reason: 'why',
    };

    expect(isSuggestedFollowUpUsable(suggested, 'cleanup')).toBe(true);
    expect(isSuggestedFollowUpUsable(suggested, 'deps')).toBe(false);
  });
});
