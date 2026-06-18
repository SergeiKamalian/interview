import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import type { ResponseCompletionResult } from '../../ai-provider/ai-provider.service';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import {
  isAdaptiveAiCombinedTurnEnabled,
  isAdaptiveAiConversationSessionEnabled,
  isAdaptiveAiOpenAiResponsesApiEnabled,
  isAdaptiveAiOpenAiServerStateEnabled,
  isAdaptiveAiOpenAiServerStateFallbackEnabled,
} from '../config/adaptive-interview-context.config';
import {
  ADAPTIVE_AI_CONVERSATION_EVALUATE_PROMPT_VERSION,
  buildEvaluateConversationBootstrapAssistantAck,
  buildEvaluateConversationBootstrapPrewarmUserPrompt,
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
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluatorRunResult,
} from '../types/per-turn-evaluation.types';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';
import { AdaptiveAiConversationService } from './adaptive-ai-conversation.service';
import { AdaptiveOpenAiResponseStateService } from './adaptive-openai-response-state.service';
import { CheckpointStateService } from './checkpoint-state.service';
import { PerTurnEvaluationValidatorService } from './per-turn-evaluation-validator.service';
import type { EvaluationEvidenceSource } from '../types/evaluation-evidence-source.type';
import type { EvaluationMode } from '../types/evaluation-mode.type';
import { applyCheckpointScoreFloors } from '../utils/apply-checkpoint-score-floors.util';
import { buildMetaTurnEvaluation } from '../utils/build-meta-turn-checkpoint-evaluation.util';
import { allowsFullCheckpointScoring } from '../utils/resolve-evaluation-mode.util';
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

export type InitializeOpenAiEvaluateStateResult =
  | {
      status: 'initialized';
      responseId: string;
    }
  | {
      status: 'skipped';
      reason:
        | 'disabled'
        | 'existing_state'
        | 'provider_not_openai'
        | 'context_unavailable';
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
    private readonly adaptiveOpenAiResponseStateService: AdaptiveOpenAiResponseStateService,
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
    options: {
      evaluationMode?: EvaluationMode;
      evidenceSource?: EvaluationEvidenceSource;
      candidateTurnKind?: CandidateTurnKind | null;
      candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
    } = {},
  ): Promise<PerTurnCheckpointEvaluatorRunResult> {
    const combinedTurn = isAdaptiveAiCombinedTurnEnabled();
    const useOpenAiServerState =
      isAdaptiveAiOpenAiResponsesApiEnabled() &&
      isAdaptiveAiOpenAiServerStateEnabled();
    const useConversation = isAdaptiveAiConversationSessionEnabled();

    if (useOpenAiServerState) {
      const result = await this.evaluateTurnWithOpenAiServerState(
        attemptId,
        interviewQuestionId,
        context,
        combinedTurn,
        options,
      );

      if (
        result.status === 'valid' ||
        !isAdaptiveAiOpenAiServerStateFallbackEnabled()
      ) {
        return result;
      }

      logAdaptiveAiDebug(this.logger, 'evaluate_turn.openai_state_fallback', {
        attemptId,
        interviewQuestionId,
        status: result.status,
      });
    }

    if (useConversation) {
      return this.evaluateTurnWithConversation(
        attemptId,
        interviewQuestionId,
        context,
        combinedTurn,
        options,
      );
    }

    return this.evaluateTurnStateless(context, combinedTurn, {
      attemptId,
      interviewQuestionId,
      operationType: 'evaluate_turn',
      ...options,
    });
  }

  private async evaluateTurnWithOpenAiServerState(
    attemptId: number,
    interviewQuestionId: number,
    context: AdaptiveInterviewContextPacket,
    combinedTurn: boolean,
    evaluateOptions: {
      evaluationMode?: EvaluationMode;
      evidenceSource?: EvaluationEvidenceSource;
      candidateTurnKind?: CandidateTurnKind | null;
      candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
    } = {},
  ): Promise<PerTurnCheckpointEvaluatorRunResult> {
    const promptVersion = ADAPTIVE_AI_CONVERSATION_EVALUATE_PROMPT_VERSION;
    const model = this.aiProviderService.getClientConfig().model;
    const state =
      await this.adaptiveOpenAiResponseStateService.loadEvaluateState({
        attemptId,
        interviewQuestionId,
        promptVersion,
        model,
      });

    const turnUserPrompt = buildEvaluateConversationTurnUserPrompt(
      context,
      combinedTurn,
    );
    const messages = state
      ? ([{ role: 'user', content: turnUserPrompt }] as const)
      : ([
          {
            role: 'system',
            content: buildEvaluateConversationSystemPrompt(combinedTurn),
          },
          {
            role: 'user',
            content: buildEvaluateConversationBootstrapUserPrompt(context),
          },
          {
            role: 'assistant',
            content: buildEvaluateConversationBootstrapAssistantAck(),
          },
          { role: 'user', content: turnUserPrompt },
        ] as const);

    const correlationId = this.aiUsageLogService.createCorrelationId();
    const debugMeta = {
      attemptId,
      interviewQuestionId,
      operationType: 'evaluate_turn',
      correlationId,
      responsesApi: true,
      serverState: true,
      hadPreviousResponseId: Boolean(state?.lastResponseId),
      sessionTurnCount: state?.turnCount ?? 0,
    };

    logAdaptiveAiDebug(this.logger, 'evaluate_turn.openai_server_state', {
      ...debugMeta,
      context: summarizeAdaptiveContextPacket(context),
      messageCount: messages.length,
      combinedTurn,
    });

    const result = await this.runEvaluationCompletion({
      context,
      combinedTurn,
      debugMeta,
      messages: [...messages],
      attemptLabel: state ? 'responses_continue' : 'responses_bootstrap',
      useResponsesApi: true,
      previousResponseId: state?.lastResponseId,
      ...evaluateOptions,
    });

    if (result.runResult.status === 'valid' && result.responseId) {
      await this.adaptiveOpenAiResponseStateService.saveEvaluateState({
        attemptId,
        interviewQuestionId,
        promptVersion,
        model,
        lastResponseId: result.responseId,
        previousState: state,
      });
    }

    return result.runResult;
  }

  private async evaluateTurnWithConversation(
    attemptId: number,
    interviewQuestionId: number,
    context: AdaptiveInterviewContextPacket,
    combinedTurn: boolean,
    evaluateOptions: {
      evaluationMode?: EvaluationMode;
      evidenceSource?: EvaluationEvidenceSource;
      candidateTurnKind?: CandidateTurnKind | null;
      candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
    } = {},
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

    let session = await this.adaptiveAiConversationService.loadSession(
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
      ...evaluateOptions,
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
      evaluationMode?: EvaluationMode;
      evidenceSource?: EvaluationEvidenceSource;
      candidateTurnKind?: CandidateTurnKind | null;
      candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
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
      evidenceSource: debugMeta.evidenceSource,
      evaluationMode: debugMeta.evaluationMode,
      candidateTurnKind: debugMeta.candidateTurnKind,
      candidateDispositionFromClassifier:
        debugMeta.candidateDispositionFromClassifier,
    });

    return result.runResult;
  }

  private async runEvaluationCompletion(input: {
    context: AdaptiveInterviewContextPacket;
    combinedTurn: boolean;
    debugMeta: Record<string, unknown>;
    evaluationMode?: EvaluationMode;
    evidenceSource?: EvaluationEvidenceSource;
    candidateTurnKind?: CandidateTurnKind | null;
    candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
    messages?: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
    systemPrompt?: string;
    userPrompt?: string;
    attemptLabel: string;
    useResponsesApi?: boolean;
    previousResponseId?: string;
  }): Promise<{
    runResult: PerTurnCheckpointEvaluatorRunResult;
    rawAssistantContent: string;
    responseId?: string;
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
      let completion = await this.createInitialCompletion(input, debugMeta);

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
          ? input.useResponsesApi
            ? await this.aiProviderService.createResponseJson(
                [
                  {
                    role: 'user',
                    content: repairUserPrompt,
                  },
                ],
                {
                  previousResponseId:
                    (completion as ResponseCompletionResult).responseId ??
                    input.previousResponseId,
                  debug: { ...debugMeta, attemptLabel: 'repair' },
                  store: true,
                },
              )
            : await this.aiProviderService.createChatCompletion(
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
        status: validation.status === 'valid' ? 'success' : 'invalid_response',
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
          responseId: this.getResponseId(completion),
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

      const { evaluation: flooredEvaluation, adjustments } =
        applyCheckpointScoreFloors(validation.data, context, {
          evaluationMode: input.evaluationMode,
          evidenceSource: input.evidenceSource,
          candidateTurnKind: input.candidateTurnKind,
          candidateDispositionFromClassifier:
            input.candidateDispositionFromClassifier,
        });

      const evaluationWithDisposition =
        input.candidateDispositionFromClassifier
          ? {
              ...flooredEvaluation,
              candidateDisposition: input.candidateDispositionFromClassifier,
            }
          : flooredEvaluation;

      if (adjustments.length > 0) {
        this.logger.log(
          JSON.stringify({
            event: 'checkpoint_guard_adjustment',
            attemptId: context.attemptId,
            interviewQuestionId: context.interviewQuestionId,
            adjustments,
          }),
        );
      }

      return {
        responseId: this.getResponseId(completion),
        rawAssistantContent: completion.content,
        runResult: {
          status: 'valid',
          repairAttempted,
          ...evaluationWithDisposition,
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

  async initializeOpenAiEvaluateState(input: {
    companyId: number;
    attemptId: number;
    interviewQuestionId: number;
    context?: AdaptiveInterviewContextPacket;
  }): Promise<InitializeOpenAiEvaluateStateResult> {
    if (
      !isAdaptiveAiOpenAiResponsesApiEnabled() ||
      !isAdaptiveAiOpenAiServerStateEnabled()
    ) {
      return { status: 'skipped', reason: 'disabled' };
    }

    const client = this.aiProviderService.getClientConfig();
    if (client.provider !== 'openai') {
      return { status: 'skipped', reason: 'provider_not_openai' };
    }

    const combinedTurn = isAdaptiveAiCombinedTurnEnabled();
    const promptVersion = ADAPTIVE_AI_CONVERSATION_EVALUATE_PROMPT_VERSION;
    const model = client.model;
    const existingState =
      await this.adaptiveOpenAiResponseStateService.loadEvaluateState({
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
        promptVersion,
        model,
      });

    if (existingState) {
      return { status: 'skipped', reason: 'existing_state' };
    }

    const context =
      input.context ??
      (await this.adaptiveInterviewContextService.buildContextPacket(
        input.attemptId,
        input.interviewQuestionId,
      ));

    if (context.checkpoints.length === 0) {
      return { status: 'skipped', reason: 'context_unavailable' };
    }

    const correlationId = this.aiUsageLogService.createCorrelationId();
    const debugMeta = {
      attemptId: input.attemptId,
      interviewQuestionId: input.interviewQuestionId,
      operationType: 'evaluate_turn_prewarm',
      correlationId,
      responsesApi: true,
      serverState: true,
      prewarm: true,
      combinedTurn,
    };

    try {
      const completion = await this.aiProviderService.createResponseJson(
        [
          {
            role: 'system',
            content: buildEvaluateConversationSystemPrompt(combinedTurn),
          },
          {
            role: 'user',
            content: buildEvaluateConversationBootstrapPrewarmUserPrompt(
              context,
              combinedTurn,
            ),
          },
        ],
        {
          debug: debugMeta,
          store: true,
          metadata: {
            attemptId: input.attemptId,
            interviewQuestionId: input.interviewQuestionId,
            operationType: 'evaluate_turn_prewarm',
          },
        },
      );

      await this.adaptiveOpenAiResponseStateService.saveEvaluateState({
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
        promptVersion,
        model,
        lastResponseId: completion.responseId,
        previousState: null,
      });

      await this.aiUsageLogService.logCompletion({
        companyId: input.companyId,
        interviewAttemptId: input.attemptId,
        operationType: 'evaluate_turn_prewarm',
        status: 'success',
        correlationId,
        model: completion.model,
        promptTokens: completion.usage.promptTokens,
        completionTokens: completion.usage.completionTokens,
        latencyMs: completion.latencyMs,
      });

      return {
        status: 'initialized',
        responseId: completion.responseId,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'AI provider request failed';

      this.logger.warn(
        `OpenAI evaluate state prewarm failed attemptId=${input.attemptId} interviewQuestionId=${input.interviewQuestionId}: ${message}`,
      );

      await this.aiUsageLogService.logCompletion({
        companyId: input.companyId,
        interviewAttemptId: input.attemptId,
        operationType: 'evaluate_turn_prewarm',
        status: 'error',
        correlationId,
        model,
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: 0,
      });

      return {
        status: 'provider_error',
        message,
      };
    }
  }

  private async createInitialCompletion(
    input: {
      messages?: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
      systemPrompt?: string;
      userPrompt?: string;
      attemptLabel: string;
      useResponsesApi?: boolean;
      previousResponseId?: string;
    },
    debugMeta: Record<string, unknown>,
  ) {
    if (input.messages && input.useResponsesApi) {
      return this.aiProviderService.createResponseJson(input.messages, {
        previousResponseId: input.previousResponseId,
        debug: { ...debugMeta, attemptLabel: input.attemptLabel },
        store: true,
      });
    }

    if (input.messages) {
      return this.aiProviderService.createChatCompletion(input.messages, {
        jsonMode: true,
        debug: { ...debugMeta, attemptLabel: input.attemptLabel },
      });
    }

    return this.aiProviderService.evaluateJson(
      input.systemPrompt!,
      input.userPrompt!,
      { ...debugMeta, attemptLabel: input.attemptLabel },
    );
  }

  private getResponseId(
    completion: Awaited<ReturnType<typeof this.createInitialCompletion>>,
  ): string | undefined {
    if (!('responseId' in completion)) {
      return undefined;
    }

    return typeof completion.responseId === 'string'
      ? completion.responseId
      : undefined;
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
    evaluationMode?: EvaluationMode;
    evidenceSource?: EvaluationEvidenceSource;
    candidateTurnKind?: CandidateTurnKind | null;
    candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
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

    const evaluationMode = input.evaluationMode ?? 'full';

    const aiTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'evaluate_turn.ai_total',
      debugMeta,
    );
    const evaluation = allowsFullCheckpointScoring(evaluationMode)
      ? await this.evaluateTurn(
          input.attemptId,
          input.interviewQuestionId,
          context,
          {
            evaluationMode: input.evaluationMode,
            evidenceSource: input.evidenceSource,
            candidateTurnKind: input.candidateTurnKind,
            candidateDispositionFromClassifier:
              input.candidateDispositionFromClassifier,
          },
        )
      : this.evaluateMetaTurn(context, {
          evaluationMode,
          evidenceSource:
            input.evidenceSource === 'meta_turn' ? 'meta_turn' : undefined,
          candidateTurnKind: input.candidateTurnKind,
          candidateDispositionFromClassifier:
            input.candidateDispositionFromClassifier,
        });
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
    const states =
      await this.checkpointStateRepository.applyTurnEvaluationResults({
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
        candidateMessageId: context.latestCandidateMessageId,
        evidenceSource: input.evidenceSource,
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
      });
    persistTimer.finish({ stateCount: states.length });

    const validEvaluation = evaluation as {
      repairAttempted: boolean;
      candidateDisposition: CandidateAnswerDisposition;
      suggestedFollowUp?: AdaptiveAiSuggestedFollowUp | null;
    };

    return {
      status: 'valid',
      repairAttempted: validEvaluation.repairAttempted,
      candidateDisposition: validEvaluation.candidateDisposition,
      suggestedFollowUp: validEvaluation.suggestedFollowUp ?? null,
      states,
    };
  }

  private evaluateMetaTurn(
    context: AdaptiveInterviewContextPacket,
    input: {
      evaluationMode: EvaluationMode;
      evidenceSource?: 'meta_turn';
      candidateTurnKind?: CandidateTurnKind | null;
      candidateDispositionFromClassifier?: CandidateAnswerDisposition | null;
    },
  ): Extract<PerTurnCheckpointEvaluatorRunResult, { status: 'valid' }> {
    const metaEvaluation = buildMetaTurnEvaluation({
      context,
      evaluationMode: input.evaluationMode,
      candidateTurnKind: input.candidateTurnKind,
      candidateDispositionFromClassifier:
        input.candidateDispositionFromClassifier,
      evidenceSource: input.evidenceSource,
    });

    logAdaptiveAiDebug(this.logger, 'evaluate_turn.meta_turn', {
      attemptId: context.attemptId,
      interviewQuestionId: context.interviewQuestionId,
      evaluationMode: input.evaluationMode,
      turnKind: input.candidateTurnKind,
      targetCheckpointKeys: metaEvaluation.checkpointResults.map(
        (result) => result.checkpointKey,
      ),
    });

    return {
      status: 'valid',
      repairAttempted: false,
      candidateDisposition: metaEvaluation.candidateDisposition,
      checkpointResults: metaEvaluation.checkpointResults,
      suggestedFollowUp: null,
      model: 'meta_turn',
      latencyMs: 0,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
}
