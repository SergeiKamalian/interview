import {
  inferFollowUpAnswerTone,
  pickFollowUpAcknowledgment,
  pickFollowUpQuestionStem,
  pickProbeAcknowledgment,
  pickProbeQuestionStem,
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

  it('rotates probe acknowledgments and avoids robotic repeat', () => {
    const first = pickProbeAcknowledgment('good', 0, []);
    const second = pickProbeAcknowledgment('good', 1, [
      'Хорошо. Вы верно описали общую идею. Уточните, пожалуйста — lazy?',
    ]);

    expect(first).not.toContain('Вы верно описали общую идею');
    expect(second).not.toBe(first);
  });

  it('uses different tone pools for partial and weak answers', () => {
    const good = pickProbeAcknowledgment('good', 0, []);
    const partial = pickProbeAcknowledgment('partial', 0, []);
    const weak = pickProbeAcknowledgment('weak', 0, []);

    expect(good).toMatch(/верно|правильн|схватил/i);
    expect(partial).toMatch(/частично|не всё|нюанс/i);
    expect(weak).toMatch(/не совсем|неточност|путаниц/i);
  });

  it('rotates probe question stems across prior follow-ups', () => {
    const first = pickProbeQuestionStem(0, []);
    const second = pickProbeQuestionStem(1, [
      `${first} scheduler и MessageChannel?`,
    ]);

    expect(second).not.toBe(first);
  });

  it('infers answer tone from rationale and score ratio', () => {
    expect(
      inferFollowUpAnswerTone({
        scoreAwarded: 0.5,
        maxScore: 1,
        rationale: 'depth=understands coverage=high accuracy=partial',
      }),
    ).toBe('good');

    expect(
      inferFollowUpAnswerTone({
        scoreAwarded: 0.2,
        maxScore: 1,
        rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
      }),
    ).toBe('partial');

    expect(
      inferFollowUpAnswerTone({
        scoreAwarded: 0.05,
        maxScore: 1,
        rationale: 'depth=false_claim coverage=low accuracy=wrong',
      }),
    ).toBe('weak');
  });
});
