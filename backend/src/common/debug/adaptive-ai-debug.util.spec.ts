import {
  isAdaptiveAiDebugEnabled,
  summarizeAiPrompts,
} from '../../common/debug/adaptive-ai-debug.util';

describe('adaptive-ai-debug.util', () => {
  const original = process.env.ADAPTIVE_AI_DEBUG;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ADAPTIVE_AI_DEBUG;
    } else {
      process.env.ADAPTIVE_AI_DEBUG = original;
    }
  });

  it('reads ADAPTIVE_AI_DEBUG flag', () => {
    process.env.ADAPTIVE_AI_DEBUG = 'true';
    expect(isAdaptiveAiDebugEnabled()).toBe(true);
  });

  it('summarizes prompt sizes and preview', () => {
    const summary = summarizeAiPrompts({
      systemPrompt: 'system prompt',
      userPrompt: 'x'.repeat(700),
    });

    expect(summary.systemPromptChars).toBe(13);
    expect(summary.userPromptChars).toBe(700);
    expect(String(summary.userPromptPreview)).toContain('…');
  });
});
