import {
  buildMainQuestionOpenerSystemPrompt,
  buildMainQuestionOpenerUserPrompt,
} from './main-question-opener.prompt';

describe('main-question-opener.prompt', () => {
  it('requires varied readiness checks and forbids verbatim bank question', () => {
    const system = buildMainQuestionOpenerSystemPrompt();

    expect(system).toContain('NEVER start with «Понял», «Спасибо», «Услышал»');
    expect(system).toContain('Do NOT paste the bank question verbatim');
    expect(system).toContain('first person «я»');
  });

  it('passes bank question only as topic context', () => {
    const user = buildMainQuestionOpenerUserPrompt({
      questionText: 'Как работает React Fiber и процесс обновления Virtual DOM?',
      referenceAnswer: 'Fiber — reconciliation engine',
      isFirstQuestion: true,
      previousQuestionCount: 0,
    });

    expect(user).toContain('extract TOPIC LABEL only');
    expect(user).toContain('Как работает React Fiber');
    expect(user).toContain('isFirstQuestion: true');
  });
});
