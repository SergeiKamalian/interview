import { Injectable, Logger } from '@nestjs/common';
import Joi from 'joi';
import { candidateTurnClassifierResponseSchema } from '../schemas/candidate-turn-classifier.schema';
import type {
  CandidateTurnClassification,
  CandidateTurnClassifierValidationResult,
} from '../types/candidate-turn-classifier.types';
import { normalizeCandidateTurnClassification } from '../utils/map-turn-kind-to-disposition.util';

@Injectable()
export class CandidateTurnClassifierValidatorService {
  private readonly logger = new Logger(CandidateTurnClassifierValidatorService.name);

  validateResponse(rawContent: string): CandidateTurnClassifierValidationResult {
    const parsed = this.parseJson(rawContent);
    if (!parsed.ok) {
      return this.invalid(rawContent, parsed.errors);
    }

    const validationResult = candidateTurnClassifierResponseSchema.validate(
      parsed.value,
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );

    if (validationResult.error) {
      return this.invalid(rawContent, this.formatJoiErrors(validationResult.error));
    }

    return {
      status: 'valid',
      data: normalizeCandidateTurnClassification(validationResult.value),
    };
  }

  logInvalidResponse(errors: string[], rawContent: string): void {
    this.logger.error(
      `Invalid candidate turn classifier response errors=${errors.join('; ')} rawLength=${rawContent.length}`,
    );
  }

  private parseJson(
    rawContent: string,
  ): { ok: true; value: unknown } | { ok: false; errors: string[] } {
    const trimmed = rawContent.trim();
    const withoutFences = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      return { ok: true, value: JSON.parse(withoutFences) as unknown };
    } catch {
      return { ok: false, errors: ['Response is not valid JSON'] };
    }
  }

  private invalid(
    rawContent: string,
    errors: string[],
  ): CandidateTurnClassifierValidationResult {
    return {
      status: 'invalid',
      errors,
      rawContent,
    };
  }

  private formatJoiErrors(error: Joi.ValidationError): string[] {
    return error.details.map((detail) => detail.message);
  }
}

export type { CandidateTurnClassification };
