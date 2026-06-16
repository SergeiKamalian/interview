import {
  buildMainQuestionRevealSystemPrompt,
  buildMainQuestionRevealUserPrompt,
} from './main-question-reveal.prompt';

describe('main-question-reveal.prompt', () => {
  it('forbids meta labels and verbatim bank question', () => {
    const system = buildMainQuestionRevealSystemPrompt();

    expect(system).toContain('NEVER say «основной вопрос»');
    expect(system).toContain('NEVER paste the bank question text verbatim');
    expect(system).toContain('Ок, давайте попробуем. С чего бы вы начали объяснение?');
    expect(system).toContain('работал маловато, но смогу');
  });

  it('passes opener context and candidate answer to the model', () => {
    const user = buildMainQuestionRevealUserPrompt({
      topicOpenerText: 'Давайте поговорим про React Fiber. Вы сталкивались?',
      candidateOpenerAnswer:
        'Ну я с ним работал так маловато, но может быть смогу ответить',
      questionText: 'Как работает React Fiber и процесс обновления Virtual DOM?',
      referenceAnswer: 'Fiber — reconciliation engine',
    });

    expect(user).toContain('already shown to candidate');
    expect(user).toContain('работал так маловато');
    expect(user).toContain('evaluation intent ONLY');
  });
});
