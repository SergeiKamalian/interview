import Joi from 'joi';

export const topicOpenerScoringGateResponseSchema = Joi.object({
  should_score: Joi.boolean().required(),
  reason: Joi.string().trim().min(3).max(280).required(),
}).required();
