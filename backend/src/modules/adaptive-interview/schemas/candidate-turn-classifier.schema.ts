import Joi from 'joi';

export const candidateTurnClassifierResponseSchema = Joi.object({
  turn_kind: Joi.string()
    .valid(
      'substantive_answer',
      'scope_clarification',
      'format_clarification',
      'decline_whole',
      'decline_scoped',
      'topic_refusal',
      'confused',
      'off_topic',
    )
    .required(),
  confidence: Joi.string().valid('high', 'low').required(),
  reason: Joi.string().trim().min(3).max(280).required(),
  opener_readiness: Joi.string()
    .valid('ready', 'uncertain', 'declined')
    .allow(null)
    .optional(),
}).required();
