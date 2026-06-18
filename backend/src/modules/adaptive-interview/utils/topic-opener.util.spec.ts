import {
  buildMainQuestionRevealFallback,
  buildTopicOpenerFallback,
  extractTopicLabel,
} from './topic-opener.util';

describe('topic-opener.util', () => {
  it('uses neutral reveal fallback without regex classification', () => {
    const message = buildMainQuestionRevealFallback({
      openerAnswer: 'Да, работал с этим в проектах',
      seed: 0,
    });

    expect(message).toMatch(/попробуем|комфортно/i);
  });

  it('builds topic opener fallback from question text', () => {
    const message = buildTopicOpenerFallback({
      questionText: 'React Fiber и reconciliation.',
      isFirstQuestion: true,
      seed: 1,
    });

    expect(message).toContain('React Fiber');
  });

  it('extracts short topic label', () => {
    expect(extractTopicLabel('React Fiber. Подробнее про scheduler.')).toBe(
      'React Fiber',
    );
  });
});
