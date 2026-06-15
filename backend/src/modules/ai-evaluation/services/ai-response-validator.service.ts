import { Injectable, Logger } from '@nestjs/common';
import Joi from 'joi';
import { checkpointEvaluationResponseSchema } from '../schemas/checkpoint-evaluation.schema';
import { finalEvaluationNarrativeResponseSchema } from '../schemas/final-evaluation.schema';
import type {
  AiResponseValidationResult,
  CheckpointEvaluationAiResponse,
  CheckpointEvaluationJsonResponse,
  FinalEvaluationNarrativeAiResponse,
  FinalEvaluationNarrativeJsonResponse,
} from '../types/evaluation.types';

@Injectable()
export class AiResponseValidatorService {
  private readonly logger = new Logger(AiResponseValidatorService.name);

  parseJson(
    rawContent: string,
  ): { ok: true; value: unknown } | { ok: false; errors: string[] } {
    try {
      return { ok: true, value: JSON.parse(rawContent) as unknown };
    } catch {
      return { ok: false, errors: ['Response is not valid JSON'] };
    }
  }

  validateCheckpointResponse(
    rawContent: string,
    expectedCheckpointKeys: string[],
  ): AiResponseValidationResult<CheckpointEvaluationAiResponse> {
    const parsed = this.parseJson(rawContent);
    if (!parsed.ok) {
      return this.invalid(rawContent, parsed.errors);
    }

    const validationResult = checkpointEvaluationResponseSchema.validate(
      parsed.value,
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );

    if (validationResult.error) {
      return this.invalid(
        rawContent,
        this.formatJoiErrors(validationResult.error),
      );
    }

    const value = validationResult.value;

    const keyErrors = this.validateCheckpointKeys(
      value.checkpoints,
      expectedCheckpointKeys,
    );
    if (keyErrors.length > 0) {
      return this.invalid(rawContent, keyErrors);
    }

    return {
      status: 'valid',
      data: this.normalizeCheckpointResponse(value),
    };
  }

  validateFinalEvaluationResponse(
    rawContent: string,
  ): AiResponseValidationResult<FinalEvaluationNarrativeAiResponse> {
    const parsed = this.parseJson(rawContent);
    if (!parsed.ok) {
      return this.invalid(rawContent, parsed.errors);
    }

    const validationResult = finalEvaluationNarrativeResponseSchema.validate(
      parsed.value,
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );

    if (validationResult.error) {
      return this.invalid(
        rawContent,
        this.formatJoiErrors(validationResult.error),
      );
    }

    const value = validationResult.value;

    return {
      status: 'valid',
      data: this.normalizeFinalEvaluationNarrativeResponse(value),
    };
  }

  logInvalidResponse(
    scope: 'checkpoint' | 'final',
    errors: string[],
    rawContent: string,
  ): void {
    this.logger.error(
      `Invalid OpenAI ${scope} response after repair retry errors=${errors.join('; ')} rawLength=${rawContent.length}`,
    );
  }

  private validateCheckpointKeys(
    checkpoints: CheckpointEvaluationJsonResponse['checkpoints'],
    expectedCheckpointKeys: string[],
  ): string[] {
    const expected = new Set(expectedCheckpointKeys);
    const actual = checkpoints.map((item) => item.checkpoint_key);
    const actualSet = new Set(actual);
    const errors: string[] = [];

    if (actual.length !== expectedCheckpointKeys.length) {
      errors.push(
        `Expected ${expectedCheckpointKeys.length} checkpoint results, got ${actual.length}`,
      );
    }

    for (const key of expectedCheckpointKeys) {
      if (!actualSet.has(key)) {
        errors.push(`Missing checkpoint result for key "${key}"`);
      }
    }

    for (const key of actual) {
      if (!expected.has(key)) {
        errors.push(`Unknown checkpoint key "${key}"`);
      }
    }

    if (actualSet.size !== actual.length) {
      errors.push('Duplicate checkpoint_key values are not allowed');
    }

    return errors;
  }

  private normalizeCheckpointResponse(
    payload: CheckpointEvaluationJsonResponse,
  ): CheckpointEvaluationAiResponse {
    return {
      checkpoints: payload.checkpoints.map((item) => ({
        checkpointKey: item.checkpoint_key,
        status: item.status,
        confidence: item.confidence,
        evidenceQuote: item.evidence_quote,
        reasoningShort: item.reasoning_short,
      })),
    };
  }

  private normalizeFinalEvaluationNarrativeResponse(
    payload: FinalEvaluationNarrativeJsonResponse,
  ): FinalEvaluationNarrativeAiResponse {
    return {
      summary: payload.summary,
      detailedSummary: payload.detailed_summary,
      strengths: payload.strengths,
      weaknesses: payload.weaknesses,
      risks: payload.risks,
    };
  }

  private invalid(
    rawContent: string,
    errors: string[],
  ): AiResponseValidationResult<never> {
    return {
      status: 'invalid_ai_response',
      errors,
      rawContent,
    };
  }

  private formatJoiErrors(error: Joi.ValidationError): string[] {
    return error.details.map((detail) => detail.message);
  }
}
