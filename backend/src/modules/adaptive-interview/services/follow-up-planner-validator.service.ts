import { Injectable, Logger } from '@nestjs/common';
import { followUpPlannerResponseSchema } from '../schemas/follow-up-planner.schema';
import type { FollowUpPlannerValidationResult } from '../types/follow-up-planner.types';

@Injectable()
export class FollowUpPlannerValidatorService {
  private readonly logger = new Logger(FollowUpPlannerValidatorService.name);

  validateResponse(rawContent: string): FollowUpPlannerValidationResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent) as unknown;
    } catch {
      return {
        status: 'invalid_ai_response',
        errors: ['Response is not valid JSON'],
        rawContent,
      };
    }

    const validationResult = followUpPlannerResponseSchema.validate(parsed, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationResult.error) {
      return {
        status: 'invalid_ai_response',
        errors: validationResult.error.details.map((detail) => detail.message),
        rawContent,
      };
    }

    return {
      status: 'valid',
      data: {
        followUpQuestion: validationResult.value.follow_up_question.trim(),
        reason: validationResult.value.reason.trim(),
      },
    };
  }

  logInvalidResponse(errors: string[], rawContent: string): void {
    this.logger.error(
      `Invalid follow-up planner response after repair retry errors=${errors.join('; ')} rawLength=${rawContent.length}`,
    );
  }
}
