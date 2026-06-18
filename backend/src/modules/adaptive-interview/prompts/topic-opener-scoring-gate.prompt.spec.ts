import {
  buildTopicOpenerScoringGateSystemPrompt,
  buildTopicOpenerScoringGateUserPrompt,
  TOPIC_OPENER_SCORING_GATE_PROMPT_VERSION,
} from './topic-opener-scoring-gate.prompt';

describe('topic-opener-scoring-gate.prompt', () => {
  it('uses version 1.0.0', () => {
    expect(TOPIC_OPENER_SCORING_GATE_PROMPT_VERSION).toBe('1.0.0');
  });

  it('instructs semantic scoring gate without length heuristics', () => {
    const systemPrompt = buildTopicOpenerScoringGateSystemPrompt();

    expect(systemPrompt).toContain('should_score = true');
    expect(systemPrompt).toContain('should_score = false');
    expect(systemPrompt).toContain('Do NOT use character length');
    expect(systemPrompt).toContain('readiness');
  });

  it('includes opener dialogue in user prompt', () => {
    const userPrompt = buildTopicOpenerScoringGateUserPrompt({
      questionText: 'Как работает React.lazy и Suspense?',
      topicOpenerText: 'Давайте про lazy loading. Сталкивались?',
      candidateAnswer: 'Дa, использовал React.lazy для роутов.',
    });

    expect(userPrompt).toContain('React.lazy');
    expect(userPrompt).toContain('lazy loading');
    expect(userPrompt).toContain('Decide should_score now.');
  });
});
