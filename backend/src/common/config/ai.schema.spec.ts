import { aiConfig, type AiConfig } from './ai.schema';

const ROLE_ENV_KEYS = [
  'AI_MODEL_CLASSIFIER',
  'AI_MODEL_FOLLOW_UP',
  'AI_MODEL_VOICE',
  'AI_MODEL_FINAL',
] as const;

function loadConfig(): AiConfig {
  return aiConfig();
}

describe('aiConfig per-role model wiring', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.AI_PROVIDER = 'openai';
    process.env.AI_API_KEY = 'test-api-key';
    process.env.AI_MODEL_EVALUATION = 'gpt-eval';
    process.env.AI_TIMEOUT_MS = '30000';
    for (const key of ROLE_ENV_KEYS) {
      delete process.env[key];
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back every role to AI_MODEL_EVALUATION when no per-role env is set', () => {
    const config = loadConfig();

    expect(config.modelEvaluation).toBe('gpt-eval');
    expect(config.modelClassifier).toBe('gpt-eval');
    expect(config.modelFollowUp).toBe('gpt-eval');
    expect(config.modelVoice).toBe('gpt-eval');
    expect(config.modelFinal).toBe('gpt-eval');
  });

  it('treats empty-string per-role env as unset (fallback to evaluation)', () => {
    process.env.AI_MODEL_CLASSIFIER = '';
    process.env.AI_MODEL_FINAL = '   ';

    const config = loadConfig();

    expect(config.modelClassifier).toBe('gpt-eval');
    expect(config.modelFinal).toBe('gpt-eval');
  });

  it('uses per-role models when env vars are provided', () => {
    process.env.AI_MODEL_CLASSIFIER = 'cheap-classifier';
    process.env.AI_MODEL_FOLLOW_UP = 'cheap-followup';
    process.env.AI_MODEL_VOICE = 'cheap-voice';
    process.env.AI_MODEL_FINAL = 'strong-final';

    const config = loadConfig();

    expect(config.modelEvaluation).toBe('gpt-eval');
    expect(config.modelClassifier).toBe('cheap-classifier');
    expect(config.modelFollowUp).toBe('cheap-followup');
    expect(config.modelVoice).toBe('cheap-voice');
    expect(config.modelFinal).toBe('strong-final');
  });
});
