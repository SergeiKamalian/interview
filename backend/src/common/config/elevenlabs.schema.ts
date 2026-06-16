import { registerAs } from '@nestjs/config';
import type { ConfigService } from '@nestjs/config';
import Joi, { type ObjectSchema } from 'joi';

export const elevenlabsEnvValidationSchema: ObjectSchema = Joi.object({
  ELEVENLABS_TTS_ENABLED: Joi.boolean()
    .truthy('true', '1', 'yes')
    .falsy('false', '0', 'no', '')
    .default(false),
  ELEVENLABS_API_KEY: Joi.when('ELEVENLABS_TTS_ENABLED', {
    is: true,
    then: Joi.string().trim().min(1).required(),
    otherwise: Joi.string().trim().allow('').optional(),
  }),
  ELEVENLABS_VOICE_ID: Joi.string().trim().min(1).default('JBFqnCBsd6RMkjVDRZzb'),
  ELEVENLABS_TTS_MODEL_ID: Joi.string()
    .trim()
    .min(1)
    .default('eleven_flash_v2_5'),
  ELEVENLABS_TTS_OUTPUT_FORMAT: Joi.string()
    .trim()
    .min(1)
    .default('mp3_44100_128'),
  ELEVENLABS_TTS_OPTIMIZE_LATENCY: Joi.alternatives()
    .try(Joi.number().integer().min(0).max(4), Joi.string().pattern(/^\d+$/))
    .default(3),
  ELEVENLABS_TTS_MAX_TEXT_LENGTH: Joi.alternatives()
    .try(Joi.number().integer().min(1).max(10000), Joi.string().pattern(/^\d+$/))
    .default(2000),
  ELEVENLABS_THINKING_PHRASE: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .default('Хмм... хорошо...'),
  ELEVENLABS_PRICE_PER_1K_CHARS: Joi.alternatives()
    .try(Joi.number().min(0), Joi.string().pattern(/^\d+(\.\d+)?$/))
    .default(0.06),
});

export type ElevenLabsConfig = {
  ttsEnabled: boolean;
  apiKey: string;
  voiceId: string;
  modelId: string;
  outputFormat: string;
  optimizeStreamingLatency: number;
  maxTextLength: number;
  thinkingPhrase: string;
  pricePer1kChars: number;
};

const DEFAULT_ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export const elevenlabsConfig = registerAs('elevenlabs', (): ElevenLabsConfig => {
  const ttsEnabled = readBooleanFlag(process.env.ELEVENLABS_TTS_ENABLED, false);

  return {
    ttsEnabled,
    apiKey: process.env.ELEVENLABS_API_KEY?.trim() ?? '',
    voiceId: process.env.ELEVENLABS_VOICE_ID?.trim() || 'JBFqnCBsd6RMkjVDRZzb',
    modelId:
      process.env.ELEVENLABS_TTS_MODEL_ID?.trim() || 'eleven_flash_v2_5',
    outputFormat:
      process.env.ELEVENLABS_TTS_OUTPUT_FORMAT?.trim() || 'mp3_44100_128',
    optimizeStreamingLatency: Number(
      process.env.ELEVENLABS_TTS_OPTIMIZE_LATENCY ?? 3,
    ),
    maxTextLength: Number(process.env.ELEVENLABS_TTS_MAX_TEXT_LENGTH ?? 2000),
    thinkingPhrase:
      process.env.ELEVENLABS_THINKING_PHRASE?.trim() || 'Хмм... хорошо...',
    pricePer1kChars: Number(
      process.env.ELEVENLABS_PRICE_PER_1K_CHARS ?? 0.06,
    ),
  };
});

export function getElevenLabsConfig(config: ConfigService): ElevenLabsConfig {
  return config.getOrThrow<ElevenLabsConfig>('elevenlabs');
}

export function getElevenLabsBaseUrl(): string {
  return DEFAULT_ELEVENLABS_BASE_URL;
}

function readBooleanFlag(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}
