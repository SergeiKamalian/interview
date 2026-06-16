import {
  buildMainQuestionRevealFallback,
  buildTopicOpenerFallback,
  classifyTopicOpenerResponse,
  extractTopicLabel,
} from './topic-opener.util';

describe('topic-opener.util', () => {
  it('extracts a short topic label from the bank question', () => {
    expect(
      extractTopicLabel(
        'Как работает React Fiber и процесс обновления Virtual DOM?',
      ),
    ).toBe('Как работает React Fiber и процесс обновления Virtual DOM');
  });

  it('classifies readiness from topic opener answers', () => {
    expect(classifyTopicOpenerResponse('Да, работал с этим в проектах')).toBe(
      'ready',
    );
    expect(
      classifyTopicOpenerResponse(
        'Ну я с ним работал так маловато, но может быть смогу ответить',
      ),
    ).toBe('uncertain');
    expect(classifyTopicOpenerResponse('Только слышал, не сталкивался')).toBe(
      'uncertain',
    );
    expect(classifyTopicOpenerResponse('Не знаю эту тему')).toBe('declined');
  });

  it('reveals a conversational invite without the bank question verbatim', () => {
    const message = buildMainQuestionRevealFallback({
      openerAnswer: 'Ну я с ним работал так маловато, но может быть смогу ответить',
      seed: 0,
    });

    expect(message).toBe(
      'Ок, давайте попробуем. С чего бы вы начали объяснение?',
    );
    expect(message).not.toContain('Как работает React Fiber');
    expect(message).not.toContain('основной вопрос');
  });

  it('builds short fallback openers without quoting the full question', () => {
    const opener = buildTopicOpenerFallback({
      questionText:
        'Как работает React Fiber и процесс обновления Virtual DOM?',
      isFirstQuestion: true,
      seed: 0,
    });

    expect(opener).toMatch(/Fiber|поговорим/i);
    expect(opener).not.toContain('Virtual DOM?');
  });
});
