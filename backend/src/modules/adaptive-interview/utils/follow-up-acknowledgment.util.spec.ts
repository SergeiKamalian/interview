import {
  pickFollowUpAcknowledgment,
  pickFollowUpQuestionStem,
} from './follow-up-acknowledgment.util';

describe('follow-up-acknowledgment.util', () => {
  it('rotates acknowledgments and avoids repeating prior openers', () => {
    const first = pickFollowUpAcknowledgment(0, []);
    const second = pickFollowUpAcknowledgment(1, [first + ' Можете рассказать?']);

    expect(first).not.toBe('Понял, спасибо.');
    expect(second).not.toBe(first);
  });

  it('rotates question stems', () => {
    const stems = new Set(
      [0, 1, 2, 3, 4].map((seed) => pickFollowUpQuestionStem(seed)),
    );

    expect(stems.size).toBeGreaterThan(1);
  });
});
