import { registerAs } from '@nestjs/config';
import type { ConfigService } from '@nestjs/config';
import Joi, { type ObjectSchema } from 'joi';

export const mediaStorageEnvValidationSchema: ObjectSchema = Joi.object({
  MEDIA_STORAGE_LOCAL_DIR: Joi.string().trim().min(1).default('storage/media'),
  MEDIA_AUDIO_MAX_BYTES: Joi.alternatives()
    .try(Joi.number().integer().min(1), Joi.string().pattern(/^\d+$/))
    .default(10 * 1024 * 1024),
  MEDIA_AUDIO_MAX_DURATION_SEC: Joi.alternatives()
    .try(Joi.number().integer().min(1).max(3600), Joi.string().pattern(/^\d+$/))
    .default(180),
});

export type MediaStorageConfig = {
  localDir: string;
  audioMaxBytes: number;
  audioMaxDurationSec: number;
};

export const mediaStorageConfig = registerAs(
  'mediaStorage',
  (): MediaStorageConfig => ({
    localDir: process.env.MEDIA_STORAGE_LOCAL_DIR?.trim() || 'storage/media',
    audioMaxBytes: Number(process.env.MEDIA_AUDIO_MAX_BYTES ?? 10 * 1024 * 1024),
    audioMaxDurationSec: Number(
      process.env.MEDIA_AUDIO_MAX_DURATION_SEC ?? 180,
    ),
  }),
);

export function getMediaStorageConfig(config: ConfigService): MediaStorageConfig {
  return config.getOrThrow<MediaStorageConfig>('mediaStorage');
}
