import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import {
  isAdaptiveAiCombinedTurnEnabled,
  isAdaptiveAiConversationSessionEnabled,
} from '../config/adaptive-interview-context.config';
import {
  ADAPTIVE_AI_CONVERSATION_EVALUATE_PROMPT_VERSION,
  buildEvaluateConversationBootstrapAssistantAck,
  buildEvaluateConversationBootstrapUserPrompt,
  buildEvaluateConversationSystemPrompt,
  buildEvaluateConversationTurnUserPrompt,
} from '../prompts/adaptive-ai-conversation.prompt';
import {
  buildPerTurnCheckpointEvaluationRepairUserPrompt,
  PER_TURN_CHECKPOINT_EVALUATION_REPAIR_INSTRUCTION,
} from '../prompts/per-turn-checkpoint-evaluation-repair.prompt';
import {
  buildPerTurnCheckpointEvaluationSystemPrompt,
  buildPerTurnCheckpointEvaluationUserPrompt,
} from '../prompts/per-turn-checkpoint-evaluation.prompt';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import type { AdaptiveAiSuggestedFollowUp } from '../types/adaptive-ai-conversation.types';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluatorRunResult,
} from '../types/per-turn-evaluation.types';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';
import { AdaptiveAiConversationService } from './adaptive-ai-conversation.service';
import { CheckpointStateService } from './checkpoint-state.service';
import { PerTurnEvaluationValidatorService } from './per-turn-evaluation-validator.service';
import { applyCheckpointScoreFloors } from '../utils/apply-checkpoint-score-floors.util';
import { parseSuggestedFollowUpFromJson } from '../utils/parse-suggested-follow-up.util';
import {
  logAdaptiveAiDebug,
  startAdaptiveAiPhaseTimer,
  summarizeAdaptiveContextPacket,
  summarizeAiPrompts,
} from '../utils/adaptive-ai-debug.util';

export type EvaluateTurnAndPersistResult =
  | {
      status: 'valid';
      repairAttempted: boolean;
      candidateDisposition: CandidateAnswerDisposition;
      suggestedFollowUp?: AdaptiveAiSuggestedFollowUp | null;
      states: InterviewCheckpointStateEntity[];
    }
  | {
      status: 'invalid_ai_response';
      repairAttempted: boolean;
      errors: string[];
    }
  | {
      status: 'provider_error';
      message: string;
    };

@Injectable()
export class PerTurnCheckpointEvaluatorService {
  private readonly logger = new Logger(PerTurnCheckpointEvaluatorService.name);

  constructor(
    private readonly adaptiveInterviewContextService: AdaptiveInterviewContextService,
    private readonly adaptiveAiConversationService: AdaptiveAiConversationService,
    private readonly checkpointStateService: CheckpointStateService,
    private readonly checkpointStateRepository: CheckpointStateRepository,
    private readonly aiProviderService: AiProviderService,
    private readonly perTurnEvaluationValidatorService: PerTurnEvaluationValidatorService,
    private readonly aiUsageLogService: AiUsageLogService,
  ) {}

  async evaluateTurn(
    attemptId: number,
    interviewQuestionId: number,
    context: AdaptiveInterviewContextPacket,
  ): Promise<PerTurnCheckpointEvaluatorRunResult> {
    const combinedTurn = isAdaptiveAiCombinedTurnEnabled();
    const useConversation = isAdaptiveAiConversationSessionEnabled();

    if (useConversation) {
      return this.evaluateTurnWithConversation(
        attemptId,
        interviewQuestionId,
        context,
        combinedTurn,
      );
    }

    return this.evaluateTurnStateless(context, combinedTurn, {
      attemptId,
      interviewQuestionId,
      operationType: 'evaluate_turn',
    });
  }

  private async evaluateTurnWithConversation(
    attemptId: number,
    interviewQuestionId: number,
    context: AdaptiveInterviewContextPacket,
    combinedTurn: boolean,
  ): Promise<PerTurnCheckpointEvaluatorRunResult> {
    const sessionKey = this.adaptiveAiConversationService.buildSessionKey(
      'evaluate',
      attemptId,
      interviewQuestionId,
    );
    const promptVersion = ADAPTIVE_AI_CONVERSATION_EVALUATE_PROMPT_VERSION;
    const systemPrompt = buildEvaluateConversationSystemPrompt(combinedTurn);
    const turnUserPrompt = buildEvaluateConversationTurnUserPrompt(
      context,
      combinedTurn,
    );

    let session =
      await this.adaptiveAiConversationService.loadSession(
        sessionKey,
        promptVersion,
      );

    if (!session) {
      session = this.adaptiveAiConversationService.createBootstrapSession({
        promptVersion,
        systemPrompt,
        bootstrapUserPrompt:
          buildEvaluateConversationBootstrapUserPrompt(context),
        bootstrapAssistantAck: buildEvaluateConversationBootstrapAssistantAck(),
      });
    }

    const messages = this.adaptiveAiConversationService.buildCompletionMessages(
      session,
      turnUserPrompt,
    );

    const correlationId = this.aiUsageLogService.createCorrelationId();
    const debugMeta = {
      attemptId,
      interviewQuestionId,
      operationType: 'evaluate_turn',
      correlationId,
      conversationMode: true,
      sessionTurnCount: session.turnCount,
    };

    logAdaptiveAiDebug(this.logger, 'evaluate_turn.conversation', {
      ...debugMeta,
      context: summarizeAdaptiveContextPacket(context),
      messageCount: messages.length,
      combinedTurn,
    });

    const result = await this.runEvaluationCompletion({
      context,
      combinedTurn,
      debugMeta,
      messages,
      attemptLabel: 'conversation',
    });

    if (result.runResult.status === 'valid') {
      const updatedSession = this.adaptiveAiConversationService.appendTurn(
        session,
        turnUserPrompt,
        result.rawAssistantContent,
      );
      await this.adaptiveAiConversationService.saveSession(
        sessionKey,
        updatedSession,
      );
    }

    return result.runResult;
  }

  private async evaluateTurnStateless(
    context: AdaptiveInterviewContextPacket,
    combinedTurn: boolean,
    debugMeta: {
      attemptId: number;
      interviewQuestionId: number;
      operationType: string;
    },
  ): Promise<PerTurnCheckpointEvaluatorRunResult> {
    const systemPrompt = buildPerTurnCheckpointEvaluationSystemPrompt();
    const userPrompt = buildPerTurnCheckpointEvaluationUserPrompt(context);

    logAdaptiveAiDebug(this.logger, 'evaluate_turn.context', {
      ...debugMeta,
      context: summarizeAdaptiveContextPacket(context),
      prompts: summarizeAiPrompts({ systemPrompt, userPrompt }),
      combinedTurn,
    });

    const result = await this.runEvaluationCompletion({
      context,
      combinedTurn,
      debugMeta: {
        ...debugMeta,
        correlationId: this.aiUsageLogService.createCorrelationId(),
      },
      systemPrompt,
      userPrompt,
      attemptLabel: 'initial',
    });

    return result.runResult;
  }

  private async runEvaluationCompletion(input: {
    context: AdaptiveInterviewContextPacket;
    combinedTurn: boolean;
    debugMeta: Record<string, unknown>;
    messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    systemPrompt?: string;
    userPrompt?: string;
    attemptLabel: string;
  }): Promise<{
    runResult: PerTurnCheckpointEvaluatorRunResult;
    rawAssistantContent: string;
  }> {
    const { context, combinedTurn, debugMeta } = input;
    const expectedCheckpointKeys = context.checkpoints.map(
      (checkpoint) => checkpoint.checkpointKey,
    );
    const maxScoreByKey = Object.fromEntries(
      context.checkpoints.map((checkpoint) => [
        checkpoint.checkpointKey,
        checkpoint.score,
      ]),
    );
    const correlationId =
      typeof debugMeta.correlationId === 'string'
        ? debugMeta.correlationId
        : this.aiUsageLogService.createCorrelationId();

    let repairAttempted = false;

    try {
      let completion = input.messages
        ? await this.aiProviderService.createChatCompletion(input.messages, {
            jsonMode: true,
            debug: { ...debugMeta, attemptLabel: input.attemptLabel },
          })
        : await this.aiProviderService.evaluateJson(
            input.systemPrompt!,
            input.userPrompt!,
            { ...debugMeta, attemptLabel: input.attemptLabel },
          );

      let validation = this.validateCompletion(
        completion.content,
        expectedCheckpointKeys,
        maxScoreByKey,
        combinedTurn,
      );

      if (validation.status === 'invalid_ai_response') {
        repairAttempted = true;
        const repairUserPrompt = input.messages
          ? buildPerTurnCheckpointEvaluationRepairUserPrompt(
              input.messages[input.messages.length - 1]?.content ?? '',
              completion.content,
              validation.errors,
            )
          : buildPerTurnCheckpointEvaluationRepairUserPrompt(
              input.userPrompt!,
              completion.content,
              validation.errors,
            );

        completion = input.messages
          ? await this.aiProviderService.createChatCompletion(
              [
                ...input.messages.slice(0, -1),
                {
                  role: 'user',
                  content: repairUserPrompt,
                },
              ],
              {
                jsonMode: true,
                debug: { ...debugMeta, attemptLabel: 'repair' },
              },
            )
          : await this.aiProviderService.evaluateJson(
              `${input.systemPrompt!}\n\n${PER_TURN_CHECKPOINT_EVALUATION_REPAIR_INSTRUCTION}`,
              repairUserPrompt,
              { ...debugMeta, attemptLabel: 'repair' },
            );

        validation = this.validateCompletion(
          completion.content,
          expectedCheckpointKeys,
          maxScoreByKey,
          combinedTurn,
        );
      }

      const usage = {
        promptTokens: completion.usage.promptTokens,
        completionTokens: completion.usage.completionTokens,
        totalTokens: completion.usage.totalTokens,
      };

      await this.aiUsageLogService.logCompletion({
        companyId: context.companyId,
        interviewAttemptId: context.attemptId,
        interviewMessageId: context.latestCandidateMessageId ?? undefined,
        operationType: 'evaluate_turn',
        status:
          validation.status === 'valid' ? 'success' : 'invalid_response',
        correlationId,
        model: completion.model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        latencyMs: completion.latencyMs,
      });

      if (validation.status === 'invalid_ai_response') {
        this.perTurnEvaluationValidatorService.logInvalidResponse(
          validation.errors,
          completion.content,
        );

        return {
          rawAssistantContent: completion.content,
          runResult: {
            status: 'invalid_ai_response',
            repairAttempted,
            errors: validation.errors,
            model: completion.model,
            latencyMs: completion.latencyMs,
            usage,
          },
        };
      }

      const floored = applyCheckpointScoreFloors(validation.data, context);

      return {
        rawAssistantContent: completion.content,
        runResult: {
          status: 'valid',
          repairAttempted,
          ...floored,
          suggestedFollowUp: validation.suggestedFollowUp,
          model: completion.model,
          latencyMs: completion.latencyMs,
          usage,
        },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'AI provider request failed';

      this.logger.warn(
        `Per-turn evaluation provider error attemptId=${context.attemptId} interviewQuestionId=${context.interviewQuestionId} operationType=evaluate_turn status=provider_error: ${message}`,
      );

      await this.aiUsageLogService.logCompletion({
        companyId: context.companyId,
        interviewAttemptId: context.attemptId,
        interviewMessageId: context.latestCandidateMessageId ?? undefined,
        operationType: 'evaluate_turn',
        status: 'error',
        correlationId,
        model: this.aiProviderService.getClientConfig().model,
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: 0,
      });

      return {
        rawAssistantContent: '',
        runResult: {
          status: 'provider_error',
          message,
        },
      };
    }
  }

  private validateCompletion(
    rawContent: string,
    expectedCheckpointKeys: string[],
    maxScoreByKey: Record<string, number>,
    combinedTurn: boolean,
  ):
    | {
        status: 'valid';
        data: PerTurnCheckpointEvaluationAiResponse;
        suggestedFollowUp: AdaptiveAiSuggestedFollowUp | null;
      }
    | {
        status: 'invalid_ai_response';
        errors: string[];
      } {
    let suggestedFollowUp: AdaptiveAiSuggestedFollowUp | null = null;

    if (combinedTurn) {
      try {
        const parsed = JSON.parse(rawContent) as Record<string, unknown>;
        suggestedFollowUp = parseSuggestedFollowUpFromJson(
          parsed.suggested_follow_up,
        );
      } catch {
        suggestedFollowUp = null;
      }
    }

    const validation = this.perTurnEvaluationValidatorService.validateResponse(
      rawContent,
      expectedCheckpointKeys,
      maxScoreByKey,
    );

    if (validation.status === 'invalid_ai_response') {
      return validation;
    }

    return {
      status: 'valid',
      data: validation.data,
      suggestedFollowUp,
    };
  }

  async evaluateTurnAndPersist(input: {
    companyId: number;
    attemptId: number;
    interviewQuestionId: number;
    context?: AdaptiveInterviewContextPacket;
    skipEnsureStates?: boolean;
  }): Promise<EvaluateTurnAndPersistResult> {
    const debugMeta = {
      attemptId: input.attemptId,
      interviewQuestionId: input.interviewQuestionId,
      operationType: 'evaluate_turn',
    };

    if (!input.skipEnsureStates) {
      const ensureStatesTimer = startAdaptiveAiPhaseTimer(
        this.logger,
        'evaluate_turn.ensure_states',
        debugMeta,
      );

      await this.checkpointStateService.ensureCheckpointStatesForQuestion({
        companyId: input.companyId,
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
      });
      ensureStatesTimer.finish();
    }

    const context =
      input.context ??
      (await (async () => {
        const buildContextTimer = startAdaptiveAiPhaseTimer(
          this.logger,
          'evaluate_turn.build_context',
          debugMeta,
        );
        const packet =
          await this.adaptiveInterviewContextService.buildContextPacket(
            input.attemptId,
            input.interviewQuestionId,
          );
        buildContextTimer.finish({
          context: summarizeAdaptiveContextPacket(packet),
        });
        return packet;
      })());

    if (!context.latestCandidateMessageId) {
      return {
        status: 'invalid_ai_response',
        repairAttempted: false,
        errors: ['Candidate answer not found for this question'],
      };
    }

    const aiTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'evaluate_turn.ai_total',
      debugMeta,
    );
    const evaluation = await this.evaluateTurn(
      input.attemptId,
      input.interviewQuestionId,
      context,
    );
    aiTimer.finish({ status: evaluation.status });

    if (evaluation.status === 'provider_error') {
      await this.checkpointStateRepository.markNeedsManualReviewForQuestion(
        input.attemptId,
        input.interviewQuestionId,
      );

      return evaluation;
    }

    if (evaluation.status === 'invalid_ai_response') {
      await this.checkpointStateRepository.markNeedsManualReviewForQuestion(
        input.attemptId,
        input.interviewQuestionId,
      );

      return {
        status: 'invalid_ai_response',
        repairAttempted: evaluation.repairAttempted,
        errors: evaluation.errors,
      };
    }

    const maxScoreByKey = Object.fromEntries(
      context.checkpoints.map((checkpoint) => [
        checkpoint.checkpointKey,
        checkpoint.score,
      ]),
    );

    const persistTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'evaluate_turn.persist_states',
      debugMeta,
    );
    const states = await this.checkpointStateRepository.applyTurnEvaluationResults(
      {
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
        candidateMessageId: context.latestCandidateMessageId,
        results: evaluation.checkpointResults.map((result) => ({
          checkpointKey: result.checkpointKey,
          status: result.status,
          scoreAwarded: Math.min(
            Math.max(0, result.scoreAwarded),
            maxScoreByKey[result.checkpointKey] ?? result.scoreAwarded,
          ),
          confidence: result.confidence,
          evidenceSummary: result.evidenceSummary,
          rationale: result.rationale,
        })),
      },
    );
    persistTimer.finish({ stateCount: states.length });

    return {
      status: 'valid',
      repairAttempted: evaluation.repairAttempted,
      candidateDisposition: evaluation.candidateDisposition,
      suggestedFollowUp: evaluation.suggestedFollowUp ?? null,
      states,
    };
  }
}
