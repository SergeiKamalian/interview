import { Injectable, Logger } from '@nestjs/common';
import Joi from 'joi';
import { perTurnCheckpointEvaluationResponseSchema } from '../schemas/per-turn-evaluation.schema';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluationJsonResponse,
  PerTurnEvaluationValidationResult,
} from '../types/per-turn-evaluation.types';

@Injectable()
export class PerTurnEvaluationValidatorService {
  private readonly logger = new Logger(PerTurnEvaluationValidatorService.name);

  validateResponse(
    rawContent: string,
    expectedCheckpointKeys: string[],
    maxScoreByKey: Record<string, number>,
  ): PerTurnEvaluationValidationResult {
    const parsed = this.parseJson(rawContent);
    if (!parsed.ok) {
      return this.invalid(rawContent, parsed.errors);
    }

    const validationResult = perTurnCheckpointEvaluationResponseSchema.validate(
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

    const keyErrors = this.validateCheckpointKeys(
      validationResult.value.checkpoint_results,
      expectedCheckpointKeys,
    );
    if (keyErrors.length > 0) {
      return this.invalid(rawContent, keyErrors);
    }

    const scoreErrors = this.validateScores(
      validationResult.value.checkpoint_results,
      maxScoreByKey,
    );
    if (scoreErrors.length > 0) {
      return this.invalid(rawContent, scoreErrors);
    }

    return {
      status: 'valid',
      data: this.normalizeResponse(validationResult.value),
    };
  }

  logInvalidResponse(errors: string[], rawContent: string): void {
    this.logger.error(
      `Invalid per-turn checkpoint response after repair retry errors=${errors.join('; ')} rawLength=${rawContent.length}`,
    );
  }

  private parseJson(
    rawContent: string,
  ): { ok: true; value: unknown } | { ok: false; errors: string[] } {
    try {
      return { ok: true, value: JSON.parse(rawContent) as unknown };
    } catch {
      return { ok: false, errors: ['Response is not valid JSON'] };
    }
  }

  private validateCheckpointKeys(
    results: PerTurnCheckpointEvaluationJsonResponse['checkpoint_results'],
    expectedCheckpointKeys: string[],
  ): string[] {
    const expected = new Set(expectedCheckpointKeys);
    const actual = results.map((item) => item.checkpoint_key);
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

  private validateScores(
    results: PerTurnCheckpointEvaluationJsonResponse['checkpoint_results'],
    maxScoreByKey: Record<string, number>,
  ): string[] {
    const errors: string[] = [];

    for (const result of results) {
      const maxScore = maxScoreByKey[result.checkpoint_key];
      if (maxScore === undefined) {
        continue;
      }

      if (result.score_awarded > maxScore) {
        errors.push(
          `score_awarded for "${result.checkpoint_key}" exceeds max_score ${maxScore}`,
        );
      }
    }

    return errors;
  }

  private normalizeResponse(
    payload: PerTurnCheckpointEvaluationJsonResponse,
  ): PerTurnCheckpointEvaluationAiResponse {
    return {
      candidateDisposition: payload.candidate_disposition,
      checkpointResults: payload.checkpoint_results.map((item) => ({
        checkpointKey: item.checkpoint_key,
        status: item.status,
        scoreAwarded: item.score_awarded,
        confidence: item.confidence,
        evidenceSummary: item.evidence_summary?.trim()
          ? item.evidence_summary.trim()
          : null,
        rationale: item.rationale,
      })),
    };
  }

  private invalid(
    rawContent: string,
    errors: string[],
  ): PerTurnEvaluationValidationResult {
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
