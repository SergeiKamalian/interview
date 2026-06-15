import Joi from 'joi';
import type { FinalEvaluationNarrativeJsonResponse } from '../types/evaluation.types';

export const SUMMARY_MAX_LENGTH = 1000;
export const DETAILED_SUMMARY_MAX_LENGTH = 5000;
export const LIST_ITEM_MAX_LENGTH = 500;
export const LIST_MAX_ITEMS = 20;

export const finalEvaluationNarrativeResponseSchema =
  Joi.object<FinalEvaluationNarrativeJsonResponse>({
    summary: Joi.string().max(SUMMARY_MAX_LENGTH).required(),
    detailed_summary: Joi.string().max(DETAILED_SUMMARY_MAX_LENGTH).required(),
    strengths: Joi.array()
      .items(Joi.string().max(LIST_ITEM_MAX_LENGTH))
      .max(LIST_MAX_ITEMS)
      .required(),
    weaknesses: Joi.array()
      .items(Joi.string().max(LIST_ITEM_MAX_LENGTH))
      .max(LIST_MAX_ITEMS)
      .required(),
    risks: Joi.array()
      .items(Joi.string().max(LIST_ITEM_MAX_LENGTH))
      .max(LIST_MAX_ITEMS)
      .required(),
  });
