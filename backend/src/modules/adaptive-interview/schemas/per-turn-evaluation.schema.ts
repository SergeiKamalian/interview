import Joi from 'joi';
import type { PerTurnCheckpointEvaluationJsonResponse } from '../types/per-turn-evaluation.types';

export const PER_TURN_CHECKPOINT_KEY_MAX_LENGTH = 64;
export const PER_TURN_EVIDENCE_SUMMARY_MAX_LENGTH = 500;
export const PER_TURN_RATIONALE_MAX_LENGTH = 500;

export const perTurnCheckpointEvaluationItemSchema = Joi.object({
  checkpoint_key: Joi.string()
    .trim()
    .min(1)
    .max(PER_TURN_CHECKPOINT_KEY_MAX_LENGTH)
    .required(),
  status: Joi.string()
    .valid('covered', 'partial', 'missed', 'unclear')
    .required(),
  score_awarded: Joi.number().min(0).required(),
  confidence: Joi.number().min(0).max(1).required(),
  evidence_summary: Joi.string()
    .max(PER_TURN_EVIDENCE_SUMMARY_MAX_LENGTH)
    .allow(null, '')
    .required(),
  rationale: Joi.string().max(PER_TURN_RATIONALE_MAX_LENGTH).required(),
});

export const perTurnCheckpointEvaluationResponseSchema =
  Joi.object<PerTurnCheckpointEvaluationJsonResponse>({
    candidate_disposition: Joi.string()
      .valid(
        'engaged',
        'declined',
        'confused',
        'off_topic',
        'misunderstood_question',
      )
      .required(),
    checkpoint_results: Joi.array()
      .items(perTurnCheckpointEvaluationItemSchema)
      .min(1)
      .required(),
  });
