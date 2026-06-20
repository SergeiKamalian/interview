import { registerAs } from '@nestjs/config';
import type { ConfigService } from '@nestjs/config';
import Joi, { type ObjectSchema } from 'joi';

const aiProviderValues = ['openai', 'compatible'] as const;

export const aiEnvValidationSchema: ObjectSchema = Joi.object({
  AI_PROVIDER: Joi.string()
    .valid(...aiProviderValues)
    .required(),
  AI_API_KEY: Joi.string().trim().min(8).required().invalid('missing'),
  AI_MODEL_EVALUATION: Joi.string().trim().min(1).required(),
  // Optional per-role model overrides. When unset, each role falls back to
  // AI_MODEL_EVALUATION, keeping behavior byte-for-byte identical to before.
  AI_MODEL_CLASSIFIER: Joi.string().trim().min(1).optional().allow(''),
  AI_MODEL_FOLLOW_UP: Joi.string().trim().min(1).optional().allow(''),
  AI_MODEL_VOICE: Joi.string().trim().min(1).optional().allow(''),
  AI_MODEL_FINAL: Joi.string().trim().min(1).optional().allow(''),
  AI_TIMEOUT_MS: Joi.alternatives()
    .try(Joi.number().integer().min(1000), Joi.string().pattern(/^\d+$/))
    .required(),
  AI_BASE_URL: Joi.string().trim().uri().optional().allow(''),
  AI_MAX_RETRIES: Joi.alternatives()
    .try(Joi.number().integer().min(0).max(5), Joi.string().pattern(/^\d+$/))
    .default(2),
  AI_TEMPERATURE: Joi.alternatives()
    .try(Joi.number().min(0).max(2), Joi.string().pattern(/^\d+(\.\d+)?$/))
    .default(0),
});

export type AiProviderName = (typeof aiProviderValues)[number];

export type AiConfig = {
  provider: AiProviderName;
  apiKey: string;
  modelEvaluation: string;
  /** Cheap/fast model for the candidate-turn classifier and scoring gate. */
  modelClassifier: string;
  /** Cheap/fast model for the follow-up planner. */
  modelFollowUp: string;
  /** Cheap/fast model for interviewer voice / opener generation. */
  modelVoice: string;
  /** Strong/reasoning model for the final evaluation summary. */
  modelFinal: string;
  timeoutMs: number;
  baseUrl: string;
  maxRetries: number;
  temperature: number;
};

/** Safe config for logs and downstream modules (no secrets). */
export type AiProviderClientConfig = {
  provider: AiProviderName;
  model: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  temperature: number;
};

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

export const aiConfig = registerAs('ai', (): AiConfig => {
  const baseUrl = process.env.AI_BASE_URL?.trim();
  const modelEvaluation = process.env.AI_MODEL_EVALUATION!.trim();
  const resolveRoleModel = (raw: string | undefined): string => {
    const trimmed = raw?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : modelEvaluation;
  };

  return {
    provider: process.env.AI_PROVIDER as AiProviderName,
    apiKey: process.env.AI_API_KEY!.trim(),
    modelEvaluation,
    modelClassifier: resolveRoleModel(process.env.AI_MODEL_CLASSIFIER),
    modelFollowUp: resolveRoleModel(process.env.AI_MODEL_FOLLOW_UP),
    modelVoice: resolveRoleModel(process.env.AI_MODEL_VOICE),
    modelFinal: resolveRoleModel(process.env.AI_MODEL_FINAL),
    timeoutMs: Number(process.env.AI_TIMEOUT_MS),
    baseUrl: baseUrl && baseUrl.length > 0 ? baseUrl : DEFAULT_OPENAI_BASE_URL,
    maxRetries: Number(process.env.AI_MAX_RETRIES ?? 2),
    temperature: Number(process.env.AI_TEMPERATURE ?? 0),
  };
});

export function getAiConfig(config: ConfigService): AiConfig {
  return config.getOrThrow<AiConfig>('ai');
}

export function toClientConfig(config: AiConfig): AiProviderClientConfig {
  return {
    provider: config.provider,
    model: config.modelEvaluation,
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
    maxRetries: config.maxRetries,
    temperature: config.temperature,
  };
}
