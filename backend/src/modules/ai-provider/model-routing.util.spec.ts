import type { AiConfig } from '../../common/config/ai.schema';
import {
  buildAiRoleModels,
  OPERATION_TYPE_TO_ROLE,
  resolveModelForOperation,
} from './model-routing.util';

function buildConfig(overrides: Partial<AiConfig> = {}): AiConfig {
  return {
    provider: 'openai',
    apiKey: 'test-key',
    modelEvaluation: 'eval-model',
    modelClassifier: 'eval-model',
    modelFollowUp: 'eval-model',
    modelVoice: 'eval-model',
    modelFinal: 'eval-model',
    timeoutMs: 30000,
    baseUrl: 'https://api.openai.com/v1',
    maxRetries: 2,
    temperature: 0,
    ...overrides,
  };
}

describe('model-routing.util', () => {
  describe('resolveModelForOperation with distinct per-role models', () => {
    const models = buildAiRoleModels(
      buildConfig({
        modelEvaluation: 'strong-eval',
        modelClassifier: 'cheap-classifier',
        modelFollowUp: 'cheap-followup',
        modelVoice: 'cheap-voice',
        modelFinal: 'strong-final',
      }),
    );

    it('routes checkpoint evaluation to the evaluation model', () => {
      expect(resolveModelForOperation('evaluate_turn', models)).toBe(
        'strong-eval',
      );
      expect(resolveModelForOperation('evaluate_turn_prewarm', models)).toBe(
        'strong-eval',
      );
    });

    it('routes final evaluation to the final model', () => {
      expect(resolveModelForOperation('final_summary', models)).toBe(
        'strong-final',
      );
      expect(resolveModelForOperation('final_evaluation', models)).toBe(
        'strong-final',
      );
    });

    it('routes classifier and scoring gate to the classifier model', () => {
      expect(
        resolveModelForOperation('candidate_turn_classifier', models),
      ).toBe('cheap-classifier');
      expect(
        resolveModelForOperation('topic_opener_scoring_gate', models),
      ).toBe('cheap-classifier');
    });

    it('routes follow-up planning to the follow-up model', () => {
      expect(resolveModelForOperation('plan_follow_up', models)).toBe(
        'cheap-followup',
      );
    });

    it('routes opener / voice to the voice model', () => {
      expect(resolveModelForOperation('main_question_opener', models)).toBe(
        'cheap-voice',
      );
      expect(resolveModelForOperation('main_question_reveal', models)).toBe(
        'cheap-voice',
      );
    });

    it('falls back to the evaluation model for unknown operation types', () => {
      expect(resolveModelForOperation('chat_completion', models)).toBe(
        'strong-eval',
      );
      expect(resolveModelForOperation('totally_unknown', models)).toBe(
        'strong-eval',
      );
    });

    it('falls back to the evaluation model when operation type is undefined', () => {
      expect(resolveModelForOperation(undefined, models)).toBe('strong-eval');
    });
  });

  describe('regression-neutral fallback (no per-role env set)', () => {
    const models = buildAiRoleModels(buildConfig());

    it.each([
      undefined,
      'evaluate_turn',
      'evaluate_turn_prewarm',
      'final_summary',
      'candidate_turn_classifier',
      'topic_opener_scoring_gate',
      'plan_follow_up',
      'main_question_opener',
      'main_question_reveal',
      'chat_completion',
      'stream_message',
    ])('operation %s resolves to the evaluation model', (operationType) => {
      expect(resolveModelForOperation(operationType, models)).toBe(
        'eval-model',
      );
    });
  });

  describe('OPERATION_TYPE_TO_ROLE map', () => {
    it('covers all evaluation-pipeline operation types', () => {
      expect(OPERATION_TYPE_TO_ROLE.evaluate_turn).toBe('evaluation');
      expect(OPERATION_TYPE_TO_ROLE.final_summary).toBe('final');
      expect(OPERATION_TYPE_TO_ROLE.candidate_turn_classifier).toBe(
        'classifier',
      );
      expect(OPERATION_TYPE_TO_ROLE.plan_follow_up).toBe('followUp');
      expect(OPERATION_TYPE_TO_ROLE.main_question_opener).toBe('voice');
    });
  });
});
