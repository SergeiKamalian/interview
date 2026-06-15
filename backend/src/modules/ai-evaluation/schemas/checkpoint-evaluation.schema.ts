import Joi from 'joi';
import type { CheckpointEvaluationJsonResponse } from '../types/evaluation.types';

export const CHECKPOINT_KEY_MAX_LENGTH = 128;
export const EVIDENCE_QUOTE_MAX_LENGTH = 2000;
export const REASONING_SHORT_MAX_LENGTH = 500;

export const checkpointEvaluationItemSchema = Joi.object({
  checkpoint_key: Joi.string()
    .trim()
    .min(1)
    .max(CHECKPOINT_KEY_MAX_LENGTH)
    .required(),
  status: Joi.string().valid('met', 'partially_met', 'not_met').required(),
  confidence: Joi.number().min(0).max(1).required(),
  evidence_quote: Joi.string()
    .max(EVIDENCE_QUOTE_MAX_LENGTH)
    .allow('')
    .required(),
  reasoning_short: Joi.string().max(REASONING_SHORT_MAX_LENGTH).required(),
});

export const checkpointEvaluationResponseSchema =
  Joi.object<CheckpointEvaluationJsonResponse>({
    checkpoints: Joi.array()
      .items(checkpointEvaluationItemSchema)
      .min(1)
      .required(),
  });
