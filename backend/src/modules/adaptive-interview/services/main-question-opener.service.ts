import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import {
  buildMainQuestionOpenerSystemPrompt,
  buildMainQuestionOpenerUserPrompt,
  MAIN_QUESTION_OPENER_PROMPT_KEY,
} from '../prompts/main-question-opener.prompt';
import {
  buildMainQuestionRevealSystemPrompt,
  buildMainQuestionRevealUserPrompt,
  MAIN_QUESTION_REVEAL_PROMPT_KEY,
} from '../prompts/main-question-reveal.prompt';
import {
  buildMainQuestionRevealFallback,
  buildTopicOpenerFallback,
} from '../utils/topic-opener.util';

@Injectable()
export class MainQuestionOpenerService {
  private readonly logger = new Logger(MainQuestionOpenerService.name);

  constructor(private readonly aiProviderService: AiProviderService) {}

  async generateTopicOpener(input: {
    attemptId: number;
    interviewQuestionId: number;
    questionText: string;
    referenceAnswer?: string | null;
    isFirstQuestion: boolean;
    previousQuestionCount: number;
    seed: number;
  }): Promise<string> {
    const fallback = buildTopicOpenerFallback({
      questionText: input.questionText,
      isFirstQuestion: input.isFirstQuestion,
      seed: input.seed,
    });

    try {
      const completion = await this.aiProviderService.createChatCompletion(
        [
          { role: 'system', content: buildMainQuestionOpenerSystemPrompt() },
          {
            role: 'user',
            content: buildMainQuestionOpenerUserPrompt({
              questionText: input.questionText,
              referenceAnswer: input.referenceAnswer,
              isFirstQuestion: input.isFirstQuestion,
              previousQuestionCount: input.previousQuestionCount,
            }),
          },
        ],
        {
          debug: {
            attemptId: input.attemptId,
            interviewQuestionId: input.interviewQuestionId,
            operationType: MAIN_QUESTION_OPENER_PROMPT_KEY,
          },
        },
      );

      const generated = completion.content.trim();
      if (!generated) {
        return fallback;
      }

      return generated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Topic opener LLM fallback attempt=${input.attemptId} question=${input.interviewQuestionId}: ${message}`,
      );
      return fallback;
    }
  }

  async generateQuestionInvite(input: {
    attemptId: number;
    interviewQuestionId: number;
    topicOpenerText: string;
    candidateOpenerAnswer: string;
    questionText: string;
    referenceAnswer?: string | null;
    seed: number;
  }): Promise<string> {
    const fallback = buildMainQuestionRevealFallback({
      openerAnswer: input.candidateOpenerAnswer,
      seed: input.seed,
    });

    try {
      const completion = await this.aiProviderService.createChatCompletion(
        [
          { role: 'system', content: buildMainQuestionRevealSystemPrompt() },
          {
            role: 'user',
            content: buildMainQuestionRevealUserPrompt({
              topicOpenerText: input.topicOpenerText,
              candidateOpenerAnswer: input.candidateOpenerAnswer,
              questionText: input.questionText,
              referenceAnswer: input.referenceAnswer,
            }),
          },
        ],
        {
          debug: {
            attemptId: input.attemptId,
            interviewQuestionId: input.interviewQuestionId,
            operationType: MAIN_QUESTION_REVEAL_PROMPT_KEY,
          },
        },
      );

      const generated = completion.content.trim();
      if (!generated) {
        return fallback;
      }

      return generated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Question invite LLM fallback attempt=${input.attemptId} question=${input.interviewQuestionId}: ${message}`,
      );
      return fallback;
    }
  }
}
