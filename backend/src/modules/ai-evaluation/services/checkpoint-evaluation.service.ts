import { Injectable } from '@nestjs/common';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import {
  buildCheckpointEvaluationRepairUserPrompt,
  CHECKPOINT_EVALUATION_REPAIR_INSTRUCTION,
} from '../prompts/checkpoint-evaluation-repair.prompt';
import {
  buildCheckpointEvaluationSystemPrompt,
  buildCheckpointEvaluationUserPrompt,
  CHECKPOINT_EVALUATION_PROMPT_KEY,
  CHECKPOINT_EVALUATION_PROMPT_VERSION,
} from '../prompts/checkpoint-evaluation.prompt';
import type {
  CheckpointEvaluationRequest,
  CheckpointEvaluationRunResult,
} from '../types/checkpoint-evaluation.types';
import { AiResponseValidatorService } from './ai-response-validator.service';
import { EvaluationContextService } from './evaluation-context.service';

@Injectable()
export class CheckpointEvaluationService {
  constructor(
    private readonly evaluationContextService: EvaluationContextService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiResponseValidatorService: AiResponseValidatorService,
  ) {}

  async buildEvaluationRequest(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<CheckpointEvaluationRequest> {
    const context =
      await this.evaluationContextService.buildCheckpointEvaluationContext(
        attemptId,
        interviewQuestionId,
      );

    const metadata = {
      promptKey: CHECKPOINT_EVALUATION_PROMPT_KEY,
      promptVersion: CHECKPOINT_EVALUATION_PROMPT_VERSION,
    };

    return {
      context,
      metadata,
      systemPrompt: buildCheckpointEvaluationSystemPrompt(),
      userPrompt: buildCheckpointEvaluationUserPrompt(context),
    };
  }

  async evaluateQuestionAnswer(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<CheckpointEvaluationRunResult> {
    const request = await this.buildEvaluationRequest(
      attemptId,
      interviewQuestionId,
    );
    const expectedCheckpointKeys = request.context.checkpoints.map(
      (checkpoint) => checkpoint.checkpointKey,
    );

    let repairAttempted = false;
    let completion = await this.aiProviderService.evaluateJson(
      request.systemPrompt,
      request.userPrompt,
    );

    let validation = this.aiResponseValidatorService.validateCheckpointResponse(
      completion.content,
      expectedCheckpointKeys,
    );

    if (validation.status === 'invalid_ai_response') {
      repairAttempted = true;
      completion = await this.aiProviderService.evaluateJson(
        `${request.systemPrompt}\n\n${CHECKPOINT_EVALUATION_REPAIR_INSTRUCTION}`,
        buildCheckpointEvaluationRepairUserPrompt(
          request.userPrompt,
          completion.content,
          validation.errors,
        ),
      );

      validation = this.aiResponseValidatorService.validateCheckpointResponse(
        completion.content,
        expectedCheckpointKeys,
      );
    }

    const baseResult = {
      rawContent: completion.content,
      metadata: request.metadata,
      model: completion.model,
      usage: completion.usage,
      latencyMs: completion.latencyMs,
      repairAttempted,
    };

    if (validation.status === 'invalid_ai_response') {
      this.aiResponseValidatorService.logInvalidResponse(
        'checkpoint',
        validation.errors,
        completion.content,
      );

      return {
        status: 'invalid_ai_response',
        errors: validation.errors,
        ...baseResult,
      };
    }

    return {
      status: 'valid',
      response: validation.data,
      ...baseResult,
    };
  }
}
