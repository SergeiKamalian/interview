import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import {
  buildCandidateTurnClassifierSystemPrompt,
  buildCandidateTurnClassifierUserPrompt,
  CANDIDATE_TURN_CLASSIFIER_PROMPT_KEY,
  CANDIDATE_TURN_CLASSIFIER_PROMPT_VERSION,
} from '../prompts/candidate-turn-classifier.prompt';
import type {
  CandidateTurnClassification,
  CandidateTurnClassifierInput,
  CandidateTurnClassifierRunResult,
} from '../types/candidate-turn-classifier.types';
import {
  inferLegacyTurnKindShadow,
  legacyTurnKindMatchesExpected,
} from '../utils/legacy-turn-kind-shadow.util';
import {
  logAdaptiveAiDebug,
  startAdaptiveAiPhaseTimer,
} from '../utils/adaptive-ai-debug.util';
import { CandidateTurnClassifierValidatorService } from './candidate-turn-classifier-validator.service';

@Injectable()
export class CandidateTurnClassifierService {
  private readonly logger = new Logger(CandidateTurnClassifierService.name);

  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly validatorService: CandidateTurnClassifierValidatorService,
  ) {}

  getPromptVersion(): string {
    return CANDIDATE_TURN_CLASSIFIER_PROMPT_VERSION;
  }

  async classifyTurn(
    input: CandidateTurnClassifierInput,
  ): Promise<CandidateTurnClassifierRunResult> {
    const timer = startAdaptiveAiPhaseTimer(this.logger, 'classify_turn', {
      attemptId: input.attemptId,
      interviewQuestionId: input.interviewQuestionId,
    });

    try {
      const completion = await this.aiProviderService.createChatCompletion(
        [
          { role: 'system', content: buildCandidateTurnClassifierSystemPrompt() },
          {
            role: 'user',
            content: buildCandidateTurnClassifierUserPrompt(input),
          },
        ],
        {
          debug: {
            attemptId: input.attemptId,
            interviewQuestionId: input.interviewQuestionId,
            operationType: CANDIDATE_TURN_CLASSIFIER_PROMPT_KEY,
          },
        },
      );

      const rawContent = completion.content.trim();
      const validated = this.validatorService.validateResponse(rawContent);

      if (validated.status === 'invalid') {
        this.validatorService.logInvalidResponse(validated.errors, rawContent);
        timer.finish({ status: 'invalid', errors: validated.errors.length });
        return {
          status: 'invalid',
          errors: validated.errors,
          rawContent,
        };
      }

      this.logShadowDivergence(input, validated.data);

      timer.finish({
        status: 'valid',
        turnKind: validated.data.turnKind,
        confidence: validated.data.confidence,
      });

      return {
        status: 'valid',
        classification: validated.data,
        rawContent,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      timer.finish({ status: 'failed', error: message });
      return { status: 'failed', error: message };
    }
  }

  private logShadowDivergence(
    input: CandidateTurnClassifierInput,
    classification: CandidateTurnClassification,
  ): void {
    const legacy = inferLegacyTurnKindShadow(input);
    const diverges = legacy.turnKind !== classification.turnKind;

    logAdaptiveAiDebug(this.logger, 'classify_turn.shadow', {
      attemptId: input.attemptId,
      interviewQuestionId: input.interviewQuestionId,
      messageKind: input.messageKind,
      turnKind: classification.turnKind,
      confidence: classification.confidence,
      disposition: classification.disposition,
      legacyTurnKind: legacy.turnKind,
      legacySignals: legacy.signals,
      legacyOpenerReadiness: legacy.openerReadiness,
      divergence: diverges,
      answerPreview: input.candidateAnswer.slice(0, 120),
    });

    if (diverges) {
      this.logger.debug(
        `Classifier shadow divergence attempt=${input.attemptId ?? 'n/a'} classifier=${classification.turnKind} legacy=${legacy.turnKind}`,
      );
    }
  }
}

export { legacyTurnKindMatchesExpected };
