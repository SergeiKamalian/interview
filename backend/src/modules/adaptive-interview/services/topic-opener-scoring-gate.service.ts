import { Injectable, Logger } from '@nestjs/common';
import Joi from 'joi';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import {
  buildTopicOpenerScoringGateSystemPrompt,
  buildTopicOpenerScoringGateUserPrompt,
  TOPIC_OPENER_SCORING_GATE_PROMPT_KEY,
  TOPIC_OPENER_SCORING_GATE_PROMPT_VERSION,
} from '../prompts/topic-opener-scoring-gate.prompt';
import { topicOpenerScoringGateResponseSchema } from '../schemas/topic-opener-scoring-gate.schema';
import type {
  TopicOpenerScoringGateInput,
  TopicOpenerScoringGateRunResult,
} from '../types/topic-opener-scoring-gate.types';
import { startAdaptiveAiPhaseTimer } from '../utils/adaptive-ai-debug.util';

@Injectable()
export class TopicOpenerScoringGateService {
  private readonly logger = new Logger(TopicOpenerScoringGateService.name);

  constructor(private readonly aiProviderService: AiProviderService) {}

  getPromptVersion(): string {
    return TOPIC_OPENER_SCORING_GATE_PROMPT_VERSION;
  }

  async decide(
    input: TopicOpenerScoringGateInput,
  ): Promise<TopicOpenerScoringGateRunResult> {
    const timer = startAdaptiveAiPhaseTimer(
      this.logger,
      'topic_opener_scoring_gate',
      {
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
      },
    );

    try {
      const completion = await this.aiProviderService.createChatCompletion(
        [
          { role: 'system', content: buildTopicOpenerScoringGateSystemPrompt() },
          {
            role: 'user',
            content: buildTopicOpenerScoringGateUserPrompt(input),
          },
        ],
        {
          debug: {
            attemptId: input.attemptId,
            interviewQuestionId: input.interviewQuestionId,
            operationType: TOPIC_OPENER_SCORING_GATE_PROMPT_KEY,
          },
        },
      );

      const rawContent = completion.content.trim();
      const validated = this.validateResponse(rawContent);

      if (validated.status === 'invalid') {
        this.logger.warn(
          `Invalid topic opener scoring gate response errors=${validated.errors.join('; ')}`,
        );
        timer.finish({ status: 'invalid', errors: validated.errors.length });
        return validated;
      }

      timer.finish({
        status: 'valid',
        shouldScore: validated.decision.shouldScore,
      });

      return {
        status: 'valid',
        decision: validated.decision,
        rawContent,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      timer.finish({ status: 'failed', error: message });
      return { status: 'failed', error: message };
    }
  }

  private validateResponse(
    rawContent: string,
  ):
    | { status: 'valid'; decision: { shouldScore: boolean; reason: string } }
    | { status: 'invalid'; errors: string[]; rawContent: string } {
    const parsed = this.parseJson(rawContent);
    if (!parsed.ok) {
      return { status: 'invalid', errors: parsed.errors, rawContent };
    }

    const validationResult = topicOpenerScoringGateResponseSchema.validate(
      parsed.value,
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );

    if (validationResult.error) {
      return {
        status: 'invalid',
        errors: this.formatJoiErrors(validationResult.error),
        rawContent,
      };
    }

    return {
      status: 'valid',
      decision: {
        shouldScore: validationResult.value.should_score,
        reason: validationResult.value.reason,
      },
    };
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

  private formatJoiErrors(error: Joi.ValidationError): string[] {
    return error.details.map((detail) => detail.message);
  }
}
