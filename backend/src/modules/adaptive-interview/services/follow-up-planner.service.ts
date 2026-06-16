import { Injectable, Logger } from '@nestjs/common';
import { InterviewAiMessageStreamService } from '../../interview-realtime/interview-ai-message-stream.service';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import {
  getAdaptiveInterviewContextLimits,
  isFollowUpLlmEnabled,
  isAdaptiveAiCombinedTurnEnabled,
} from '../config/adaptive-interview-context.config';
import {
  buildFollowUpPlannerRepairUserPrompt,
  FOLLOW_UP_PLANNER_REPAIR_INSTRUCTION,
} from '../prompts/follow-up-planner-repair.prompt';
import {
  buildFollowUpPlannerSystemPrompt,
  buildFollowUpPlannerStreamingSystemPrompt,
  buildFollowUpPlannerStreamingUserPrompt,
  buildFollowUpPlannerUserPrompt,
} from '../prompts/follow-up-planner.prompt';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import { FollowUpRepository } from '../repositories/follow-up.repository';
import type {
  FollowUpPlannerRunResult,
  FollowUpPlannerOptions,
} from '../types/follow-up-planner.types';
import { boundText } from '../utils/build-adaptive-interview-context.util';
import { normalizeFollowUpQuestionForCandidate } from '../utils/checkpoint-expected-speech.util';
import { buildNaturalTemplateFollowUp } from '../utils/follow-up-policy.util';
import { isSuggestedFollowUpUsable } from '../utils/parse-suggested-follow-up.util';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';
import { FollowUpPlannerValidatorService } from './follow-up-planner-validator.service';
import { FollowUpPolicyService } from './follow-up-policy.service';
import {
  logAdaptiveAiDebug,
  startAdaptiveAiPhaseTimer,
  summarizeAdaptiveContextPacket,
  summarizeAiPrompts,
} from '../utils/adaptive-ai-debug.util';

function prepareFollowUpQuestion(text: string, maxLength: number): string {
  return boundText(normalizeFollowUpQuestionForCandidate(text), maxLength);
}

@Injectable()
export class FollowUpPlannerService {
  private readonly logger = new Logger(FollowUpPlannerService.name);

  constructor(
    private readonly adaptiveInterviewContextService: AdaptiveInterviewContextService,
    private readonly followUpPolicyService: FollowUpPolicyService,
    private readonly checkpointStateRepository: CheckpointStateRepository,
    private readonly followUpRepository: FollowUpRepository,
    private readonly followUpPlannerValidatorService: FollowUpPlannerValidatorService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiUsageLogService: AiUsageLogService,
    private readonly aiMessageStreamService: InterviewAiMessageStreamService,
  ) {}

  async planFollowUp(
    attemptId: number,
    interviewQuestionId: number,
    options: FollowUpPlannerOptions = {},
  ): Promise<FollowUpPlannerRunResult> {
    const debugMeta = {
      attemptId,
      interviewQuestionId,
      operationType: 'plan_follow_up',
    };
    const totalTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'plan_follow_up.total',
      debugMeta,
    );

    const contextTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'plan_follow_up.build_context',
      debugMeta,
    );
    const context =
      options.context ??
      (await this.adaptiveInterviewContextService.buildContextPacket(
        attemptId,
        interviewQuestionId,
      ));
    contextTimer.finish({
      context: summarizeAdaptiveContextPacket(context),
    });

    const policyTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'plan_follow_up.policy',
      debugMeta,
    );
    const [checkpointStates, existingFollowUps, followUpsUsedForQuestion] =
      await Promise.all([
        this.checkpointStateRepository.findByAttemptAndQuestion(
          attemptId,
          interviewQuestionId,
        ),
        this.followUpRepository.listByAttemptAndQuestion(
          attemptId,
          interviewQuestionId,
        ),
        options.followUpsUsedForQuestion !== undefined
          ? Promise.resolve(options.followUpsUsedForQuestion)
          : this.followUpRepository.countUsedForQuestion(
              attemptId,
              interviewQuestionId,
            ),
      ]);

    const policy = this.followUpPolicyService.evaluate(
      context,
      checkpointStates,
      followUpsUsedForQuestion,
      options.candidateDispositionFromAi,
    );
    policyTimer.finish({
      shouldAskFollowUp: policy.shouldAskFollowUp,
      reason: policy.shouldAskFollowUp ? undefined : policy.reason,
      targetCheckpointKey: policy.shouldAskFollowUp
        ? policy.targetCheckpointKey
        : undefined,
    });

    if (!policy.shouldAskFollowUp) {
      totalTimer.finish({ status: 'no_follow_up' });
      return {
        status: 'no_follow_up',
        reason: policy.reason,
      };
    }

    const limits = getAdaptiveInterviewContextLimits();
    const templateQuestion = buildNaturalTemplateFollowUp({
      questionText: context.questionText,
      checkpointExpected: policy.checkpointExpected,
      latestCandidateAnswer: context.latestCandidateAnswer,
      previousFollowUpQuestions: existingFollowUps.map(
        (followUp) => followUp.questionText,
      ),
      seed: attemptId + interviewQuestionId + followUpsUsedForQuestion,
    });
    const correlationId = this.aiUsageLogService.createCorrelationId();
    const aiDebugMeta = { ...debugMeta, correlationId };

    const promptInput = {
      questionText: context.questionText,
      targetCheckpointKey: policy.targetCheckpointKey,
      checkpointTitle: policy.checkpointTitle,
      checkpointExpected: policy.checkpointExpected,
      latestCandidateAnswer: context.latestCandidateAnswer,
      previousFollowUpQuestions: existingFollowUps.map(
        (followUp) => followUp.questionText,
      ),
    };

    const systemPrompt = buildFollowUpPlannerSystemPrompt();
    const userPrompt = buildFollowUpPlannerUserPrompt(promptInput);
    const streamingSystemPrompt = buildFollowUpPlannerStreamingSystemPrompt();
    const streamingUserPrompt =
      buildFollowUpPlannerStreamingUserPrompt(promptInput);

    logAdaptiveAiDebug(this.logger, 'plan_follow_up.prompts', {
      ...aiDebugMeta,
      prompts: summarizeAiPrompts({ systemPrompt, userPrompt }),
    });

    let repairAttempted = false;
    let usedTemplate = !isFollowUpLlmEnabled();
    let followUpQuestion = templateQuestion;
    let plannerReason = policy.reason;
    const avoidLlmFallback = options.avoidLlmFallback === true;

    const combinedSuggested =
      isAdaptiveAiCombinedTurnEnabled() &&
      isSuggestedFollowUpUsable(
        options.suggestedFollowUp,
        policy.targetCheckpointKey,
      )
        ? options.suggestedFollowUp
        : null;

    if (combinedSuggested) {
      followUpQuestion = prepareFollowUpQuestion(
        combinedSuggested.followUpQuestion,
        limits.maxTextLength,
      );
      plannerReason = boundText(combinedSuggested.reason, limits.maxTextLength);
      usedTemplate = false;
      logAdaptiveAiDebug(this.logger, 'plan_follow_up.combined_turn_reuse', {
        ...aiDebugMeta,
        checkpointKey: policy.targetCheckpointKey,
      });

      if (this.aiMessageStreamService.isEnabled()) {
        followUpQuestion = await this.aiMessageStreamService.streamStaticText({
          attemptId,
          interviewQuestionId,
          messageKind: 'follow_up_question',
          text: followUpQuestion,
        });
      }
    }

    if (!combinedSuggested && avoidLlmFallback) {
      usedTemplate = true;
      plannerReason = 'combined_turn_template_fallback';
      logAdaptiveAiDebug(this.logger, 'plan_follow_up.combined_turn_template', {
        ...aiDebugMeta,
        checkpointKey: policy.targetCheckpointKey,
        followUpQuestion: templateQuestion,
      });

      if (this.aiMessageStreamService.isEnabled()) {
        followUpQuestion = await this.aiMessageStreamService.streamStaticText({
          attemptId,
          interviewQuestionId,
          messageKind: 'follow_up_question',
          text: templateQuestion,
        });
      }
    }

    const streamInput = {
      attemptId,
      interviewQuestionId,
      messageKind: 'follow_up_question',
    };

    if (
      !combinedSuggested &&
      !avoidLlmFallback &&
      isFollowUpLlmEnabled() &&
      this.aiMessageStreamService.isEnabled()
    ) {
      try {
        const streamed = await this.aiMessageStreamService.streamLlmText({
          ...streamInput,
          systemPrompt: streamingSystemPrompt,
          userPrompt: streamingUserPrompt,
          operationType: 'plan_follow_up',
          correlationId,
        });
        followUpQuestion = prepareFollowUpQuestion(streamed, limits.maxTextLength);
        usedTemplate = false;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'AI provider request failed';
        this.logger.warn(
          `Follow-up streaming planner error attemptId=${attemptId} interviewQuestionId=${interviewQuestionId}: ${message}`,
        );
        usedTemplate = true;
        followUpQuestion = await this.aiMessageStreamService.streamStaticText({
          ...streamInput,
          text: templateQuestion,
        });
        plannerReason = 'provider_error_template_fallback';
      }
    } else if (
      !combinedSuggested &&
      !avoidLlmFallback &&
      isFollowUpLlmEnabled()
    ) {
      try {
        const aiTimer = startAdaptiveAiPhaseTimer(
          this.logger,
          'plan_follow_up.ai_total',
          aiDebugMeta,
        );
        let completion = await this.aiProviderService.evaluateJson(
          systemPrompt,
          userPrompt,
          { ...aiDebugMeta, attemptLabel: 'initial' },
        );

        let validation = this.followUpPlannerValidatorService.validateResponse(
          completion.content,
        );

        if (validation.status === 'invalid_ai_response') {
          repairAttempted = true;
          completion = await this.aiProviderService.evaluateJson(
            `${systemPrompt}\n\n${FOLLOW_UP_PLANNER_REPAIR_INSTRUCTION}`,
            buildFollowUpPlannerRepairUserPrompt(
              userPrompt,
              completion.content,
              validation.errors,
            ),
            { ...aiDebugMeta, attemptLabel: 'repair' },
          );

          validation = this.followUpPlannerValidatorService.validateResponse(
            completion.content,
          );
        }

        await this.aiUsageLogService.logCompletion({
          companyId: context.companyId,
          interviewAttemptId: attemptId,
          interviewMessageId: context.latestCandidateMessageId ?? undefined,
          operationType: 'plan_follow_up',
          status:
            validation.status === 'valid' ? 'success' : 'invalid_response',
          correlationId,
          model: completion.model,
          promptTokens: completion.usage.promptTokens,
          completionTokens: completion.usage.completionTokens,
          latencyMs: completion.latencyMs,
        });
        aiTimer.finish({
          status: validation.status,
          repairAttempted,
          usedTemplate: validation.status !== 'valid',
        });

        if (validation.status === 'valid') {
          followUpQuestion = prepareFollowUpQuestion(
            validation.data.followUpQuestion,
            limits.maxTextLength,
          );
          plannerReason = boundText(
            validation.data.reason,
            limits.maxTextLength,
          );
          usedTemplate = false;
        } else {
          this.followUpPlannerValidatorService.logInvalidResponse(
            validation.errors,
            completion.content,
          );
          usedTemplate = true;
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'AI provider request failed';

        this.logger.warn(
          `Follow-up planner provider error attemptId=${attemptId} interviewQuestionId=${interviewQuestionId} operationType=plan_follow_up status=provider_error: ${message}`,
        );

        await this.aiUsageLogService.logCompletion({
          companyId: context.companyId,
          interviewAttemptId: attemptId,
          interviewMessageId: context.latestCandidateMessageId ?? undefined,
          operationType: 'plan_follow_up',
          status: 'error',
          correlationId,
          model: this.aiProviderService.getClientConfig().model,
          promptTokens: 0,
          completionTokens: 0,
          latencyMs: 0,
        });

        usedTemplate = true;
        followUpQuestion = templateQuestion;
        plannerReason = 'provider_error_template_fallback';
      }
    } else if (
      !combinedSuggested &&
      !avoidLlmFallback &&
      this.aiMessageStreamService.isEnabled()
    ) {
      logAdaptiveAiDebug(this.logger, 'plan_follow_up.template_stream', {
        ...aiDebugMeta,
        followUpQuestion: templateQuestion,
      });
      followUpQuestion = await this.aiMessageStreamService.streamStaticText({
        ...streamInput,
        text: templateQuestion,
      });
    } else if (!combinedSuggested && !avoidLlmFallback) {
      logAdaptiveAiDebug(this.logger, 'plan_follow_up.template_only', {
        ...aiDebugMeta,
        followUpQuestion: templateQuestion,
      });
    }

    followUpQuestion = prepareFollowUpQuestion(
      followUpQuestion,
      limits.maxTextLength,
    );

    const followUp = await this.followUpRepository.create({
      companyId: context.companyId,
      interviewAttemptId: attemptId,
      interviewQuestionId,
      checkpointKey: policy.targetCheckpointKey,
      questionText: followUpQuestion,
      reason: plannerReason,
      status: 'planned',
      sortOrder: followUpsUsedForQuestion + 1,
    });

    await this.checkpointStateRepository.incrementFollowUpCount(
      attemptId,
      interviewQuestionId,
      policy.targetCheckpointKey,
    );

    totalTimer.finish({
      status: 'planned',
      usedTemplate,
      repairAttempted,
    });

    return {
      status: 'planned',
      followUpId: followUp.id,
      checkpointKey: policy.targetCheckpointKey,
      followUpQuestion,
      reason: plannerReason,
      usedTemplate,
      repairAttempted,
    };
  }
}
