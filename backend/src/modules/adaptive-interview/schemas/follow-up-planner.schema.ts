import Joi from 'joi';
import type { FollowUpPlannerJsonResponse } from '../types/follow-up-planner.types';

export const FOLLOW_UP_QUESTION_MAX_LENGTH = 500;
export const FOLLOW_UP_REASON_MAX_LENGTH = 500;

export const followUpPlannerResponseSchema = Joi.object<FollowUpPlannerJsonResponse>({
  follow_up_question: Joi.string()
    .trim()
    .min(1)
    .max(FOLLOW_UP_QUESTION_MAX_LENGTH)
    .required(),
  reason: Joi.string().trim().min(1).max(FOLLOW_UP_REASON_MAX_LENGTH).required(),
});
