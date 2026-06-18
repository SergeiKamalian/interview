import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import type { InterviewQuestionEntity } from '../../interview-core/entities/interview-question.entity';
import type { InterviewMessageEntity } from '../../interview-core/entities/interview-message.entity';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { InterviewMessageKindEnum } from '../../interview-core/types/interview.type';
import { InterviewRealtimeService } from '../../interview-realtime/interview-realtime.service';
import { InterviewAiMessageStreamService } from '../../interview-realtime/interview-ai-message-stream.service';
import { FollowUpRepository } from '../repositories/follow-up.repository';
import type {
  AdaptiveSubmitInput,
  AdaptiveSubmitResult,
} from '../types/adaptive-submit.types';
import { FollowUpPlannerService } from './follow-up-planner.service';
import { PerTurnCheckpointEvaluatorService } from './per-turn-checkpoint-evaluator.service';
import { CheckpointStateService } from './checkpoint-state.service';
import { QuestionSummaryService } from './question-summary.service';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';
import { AdaptiveAiConversationService } from './adaptive-ai-conversation.service';
import { AdaptiveOpenAiResponseStateService } from './adaptive-openai-response-state.service';
import {
  logAdaptiveAiDebug,
  startAdaptiveAiPhaseTimer,
  summarizeAdaptiveContextPacket,
} from '../utils/adaptive-ai-debug.util';
import { shouldSkipFollowUps } from '../utils/candidate-decline.util';
import { buildCandidateTurnClassifierInput } from '../utils/build-candidate-turn-classifier-input.util';
import { resolveClassifierEmergencyFallback } from '../utils/classifier-emergency-fallback.util';
import type {
  CandidateTurnKind,
  TopicOpenerReadiness,
} from '../types/candidate-turn-classifier.types';
import {
  isMetaTurnMode,
  resolveEvaluationMode,
  shouldSkipEvaluation,
} from '../utils/resolve-evaluation-mode.util';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import { CandidateTurnClassifierService } from './candidate-turn-classifier.service';
import { MediaAssetService } from '../../media/media-asset.service';
import { MainQuestionOpenerService } from './main-question-opener.service';
import { TopicOpenerScoringGateService } from './topic-opener-scoring-gate.service';
import { shouldScoreTopicOpenerAnswer } from '../utils/topic-opener-scoring.util';

@Injectable()
export class AdaptiveInterviewSubmitService {
  private readonly logger = new Logger(AdaptiveInterviewSubmitService.name);

  constructor(
    private readonly repository: InterviewCoreRepository,
    private readonly database: DatabaseService,
    private readonly checkpointStateService: CheckpointStateService,
    private readonly perTurnCheckpointEvaluatorService: PerTurnCheckpointEvaluatorService,
    private readonly followUpPlannerService: FollowUpPlannerService,
    private readonly followUpRepository: FollowUpRepository,
    private readonly questionSummaryService: QuestionSummaryService,
    private readonly interviewRealtimeService: InterviewRealtimeService,
    private readonly aiMessageStreamService: InterviewAiMessageStreamService,
    private readonly adaptiveInterviewContextService: AdaptiveInterviewContextService,
    private readonly adaptiveAiConversationService: AdaptiveAiConversationService,
    private readonly adaptiveOpenAiResponseStateService: AdaptiveOpenAiResponseStateService,
    private readonly mediaAssetService: MediaAssetService,
    private readonly mainQuestionOpenerService: MainQuestionOpenerService,
    private readonly candidateTurnClassifierService: CandidateTurnClassifierService,
    private readonly topicOpenerScoringGateService: TopicOpenerScoringGateService,
  ) {}

  async assertCanSubmit(
    attemptId: number,
    totalMainQuestions: number,
  ): Promise<void> {
    const [answeredMain, awaitingFollowUp, awaitingTopicOpener] =
      await Promise.all([
        this.repository.countMainAnswerMessages(attemptId),
        this.followUpRepository.findAwaitingAnswer(attemptId),
        this.repository.findAwaitingTopicOpener(attemptId),
      ]);

    if (
      !awaitingFollowUp &&
      !awaitingTopicOpener &&
      answeredMain >= totalMainQuestions
    ) {
      throw new BadRequestException({
        message: 'All questions already answered',
        code: 'INTERVIEW_ALREADY_COMPLETE',
      });
    }
  }

  async initializeQuestionAiState(input: {
    companyId: number;
    attemptId: number;
    interviewQuestionId: number;
  }): Promise<void> {
    const timer = startAdaptiveAiPhaseTimer(
      this.logger,
      'start_interview.prewarm_openai_state',
      {
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
      },
    );

    try {
      const result =
        await this.perTurnCheckpointEvaluatorService.initializeOpenAiEvaluateState(
          {
            companyId: input.companyId,
            attemptId: input.attemptId,
            interviewQuestionId: input.interviewQuestionId,
          },
        );

      timer.finish({ status: result.status });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown prewarm error';
      this.logger.warn(
        `Adaptive OpenAI state prewarm skipped attempt=${input.attemptId} question=${input.interviewQuestionId}: ${message}`,
      );
      timer.finish({ status: 'skipped', error: message });
    }
  }

  async postTopicOpenerForQuestion(input: {
    companyId: number;
    attemptId: number;
    question: InterviewQuestionEntity;
    answeredMainQuestions: number;
  }): Promise<string> {
    const openerText = await this.mainQuestionOpenerService.generateTopicOpener(
      {
        attemptId: input.attemptId,
        interviewQuestionId: input.question.id,
        questionText: input.question.questionText,
        referenceAnswer: input.question.shortAnswer,
        isFirstQuestion: input.answeredMainQuestions === 0,
        previousQuestionCount: input.answeredMainQuestions,
        seed: input.attemptId + input.question.id,
      },
    );

    const streamedText = this.aiMessageStreamService.isEnabled()
      ? await this.aiMessageStreamService.streamStaticText({
          attemptId: input.attemptId,
          interviewQuestionId: input.question.id,
          messageKind: 'topic_opener',
          text: openerText,
        })
      : openerText;

    const aiMessage = await this.database.withTransaction(async (query) => {
      const sequenceOrder = await this.repository.getNextSequenceOrder(
        input.attemptId,
        query,
      );

      const message = await this.repository.appendMessage(
        {
          companyId: input.companyId,
          attemptId: input.attemptId,
          interviewQuestionId: input.question.id,
          role: 'ai',
          content: streamedText,
          sequenceOrder,
          messageKind: 'topic_opener',
        },
        query,
      );

      await this.checkpointStateService.ensureCheckpointStatesForQuestion(
        {
          companyId: input.companyId,
          attemptId: input.attemptId,
          interviewQuestionId: input.question.id,
        },
        query,
      );

      return message;
    });

    this.interviewRealtimeService.emit({
      attemptId: input.attemptId,
      eventType: 'message.appended',
      interviewQuestionId: input.question.id,
      messageId: aiMessage.id,
      sequenceOrder: aiMessage.sequenceOrder,
      messageKind: 'topic_opener',
    });

    return streamedText;
  }

  async submitAnswer(
    input: AdaptiveSubmitInput,
  ): Promise<AdaptiveSubmitResult> {
    const { attempt, questions, trimmedAnswer } = input;
    const attemptId = attempt.id;
    const totalMainQuestions = questions.length;
    const submitTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.total',
      { attemptId, operationType: 'submit_answer' },
    );

    logAdaptiveAiDebug(this.logger, 'submit_answer.received', {
      attemptId,
      answerChars: trimmedAnswer.length,
      answerPreview:
        trimmedAnswer.length > 300
          ? `${trimmedAnswer.slice(0, 300)}…`
          : trimmedAnswer,
    });

    const [answeredMainBefore, awaitingFollowUp, awaitingTopicOpener] =
      await Promise.all([
        this.repository.countMainAnswerMessages(attemptId),
        this.followUpRepository.findAwaitingAnswer(attemptId),
        this.repository.findAwaitingTopicOpener(attemptId),
      ]);

    if (
      !awaitingFollowUp &&
      !awaitingTopicOpener &&
      answeredMainBefore >= totalMainQuestions
    ) {
      throw new Error('All main questions already answered');
    }

    if (awaitingTopicOpener) {
      const topicQuestion = questions.find(
        (question) => question.id === awaitingTopicOpener.interviewQuestionId,
      );

      if (!topicQuestion) {
        throw new Error('Topic opener question not found');
      }

      return this.handleTopicOpenerAnswer({
        attempt,
        questions,
        currentQuestion: topicQuestion,
        trimmedAnswer,
        topicOpenerMessageId: awaitingTopicOpener.topicOpenerMessageId,
        topicOpenerText: awaitingTopicOpener.topicOpenerText,
        answeredMainQuestions: answeredMainBefore,
        totalMainQuestions,
        mediaAssetId: input.mediaAssetId,
      });
    }

    const isFollowUpAnswer = awaitingFollowUp !== null;
    const currentQuestion = isFollowUpAnswer
      ? questions.find(
          (question) => question.id === awaitingFollowUp.interviewQuestionId,
        )
      : questions[answeredMainBefore];

    if (!currentQuestion) {
      throw new Error('Current interview question not found');
    }

    const saveTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.save_message',
      { attemptId, interviewQuestionId: currentQuestion.id },
    );
    const saveResult = await this.database.withTransaction(async (query) => {
      await this.checkpointStateService.ensureCheckpointStatesForQuestion(
        {
          companyId: attempt.companyId,
          attemptId,
          interviewQuestionId: currentQuestion.id,
        },
        query,
      );

      const sequenceOrder = await this.repository.getNextSequenceOrder(
        attemptId,
        query,
      );

      const candidateMessage = await this.repository.appendMessage(
        {
          companyId: attempt.companyId,
          attemptId,
          interviewQuestionId: currentQuestion.id,
          role: 'candidate',
          content: trimmedAnswer,
          sequenceOrder,
          messageKind: isFollowUpAnswer ? 'follow_up_answer' : 'main_answer',
          parentMessageId: isFollowUpAnswer
            ? awaitingFollowUp.followUpQuestionMessageId
            : null,
          targetCheckpointKey: isFollowUpAnswer
            ? awaitingFollowUp.checkpointKey
            : null,
        },
        query,
      );

      if (isFollowUpAnswer) {
        await this.followUpRepository.markAnswered(
          awaitingFollowUp.id,
          candidateMessage.id,
          query,
        );
      }

      return {
        answeredMainQuestions: isFollowUpAnswer
          ? answeredMainBefore
          : answeredMainBefore + 1,
        candidateMessage,
      };
    });
    saveTimer.finish({
      messageId: saveResult.candidateMessage.id,
      isFollowUpAnswer,
    });

    if (input.mediaAssetId) {
      await this.mediaAssetService.linkPendingAssetToMessage({
        mediaAssetId: input.mediaAssetId,
        attemptId,
        messageId: saveResult.candidateMessage.id,
      });
    }

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'answer.received',
      interviewQuestionId: currentQuestion.id,
      messageId: saveResult.candidateMessage.id,
      sequenceOrder: saveResult.candidateMessage.sequenceOrder,
      messageKind: saveResult.candidateMessage.messageKind ?? undefined,
    });

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'ai.evaluation_started',
      interviewQuestionId: currentQuestion.id,
      messageId: saveResult.candidateMessage.id,
    });

    const buildContextTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.build_context',
      { attemptId, interviewQuestionId: currentQuestion.id },
    );
    const contextPacket =
      await this.adaptiveInterviewContextService.buildContextPacket(
        attemptId,
        currentQuestion.id,
      );
    buildContextTimer.finish({
      context: summarizeAdaptiveContextPacket(contextPacket),
    });

    const classifyTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.classify_turn',
      { attemptId, interviewQuestionId: currentQuestion.id },
    );
    const classifierInput = buildCandidateTurnClassifierInput({
      context: contextPacket,
      attemptId,
      interviewQuestionId: currentQuestion.id,
    });
    const classificationResult =
      await this.candidateTurnClassifierService.classifyTurn(classifierInput);
    classifyTimer.finish({
      status: classificationResult.status,
      turnKind:
        classificationResult.status === 'valid'
          ? classificationResult.classification.turnKind
          : undefined,
    });

    let candidateTurnKind: CandidateTurnKind | null = null;
    let candidateDisposition: CandidateAnswerDisposition | null = null;

    if (classificationResult.status === 'valid') {
      candidateTurnKind = classificationResult.classification.turnKind;
      candidateDisposition = classificationResult.classification.disposition;
    } else {
      const emergencyFallback =
        resolveClassifierEmergencyFallback(classifierInput);
      if (emergencyFallback) {
        candidateTurnKind = emergencyFallback.turnKind;
        candidateDisposition = emergencyFallback.disposition;
        logAdaptiveAiDebug(
          this.logger,
          'submit_answer.classifier_emergency_fallback',
          {
            attemptId,
            interviewQuestionId: currentQuestion.id,
            classifierStatus: classificationResult.status,
            turnKind: emergencyFallback.turnKind,
            disposition: emergencyFallback.disposition,
          },
        );
      }
    }

    const evaluationMode = resolveEvaluationMode(candidateTurnKind);

    logAdaptiveAiDebug(this.logger, 'submit_answer.evaluation_mode', {
      attemptId,
      interviewQuestionId: currentQuestion.id,
      evaluationMode,
      turnKind: candidateTurnKind,
    });

    if (shouldSkipEvaluation(evaluationMode)) {
      logAdaptiveAiDebug(this.logger, 'submit_answer.candidate_declined', {
        attemptId,
        interviewQuestionId: currentQuestion.id,
        candidateTurnKind,
        evaluationMode,
        answerPreview: trimmedAnswer,
      });

      await this.checkpointStateService.applyCandidateDeclinedKnowledge({
        attemptId,
        interviewQuestionId: currentQuestion.id,
      });

      const result = await this.completeCurrentQuestion({
        attempt,
        questions,
        currentQuestion,
        answeredMainQuestions: saveResult.answeredMainQuestions,
        totalMainQuestions,
      });
      submitTimer.finish({
        outcome: result.status,
        candidateDeclined: true,
        isFollowUp: result.isFollowUp,
      });
      return result;
    }

    const scoreBefore = contextPacket.checkpointStates.reduce(
      (total, state) => total + state.scoreAwarded,
      0,
    );

    const evaluateTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.evaluate_turn',
      { attemptId, interviewQuestionId: currentQuestion.id },
    );
    const evaluation =
      await this.perTurnCheckpointEvaluatorService.evaluateTurnAndPersist({
        companyId: attempt.companyId,
        attemptId,
        interviewQuestionId: currentQuestion.id,
        context: contextPacket,
        skipEnsureStates: true,
        evaluationMode,
        evidenceSource: isMetaTurnMode(evaluationMode)
          ? 'meta_turn'
          : isFollowUpAnswer
            ? 'follow_up_answer'
            : 'main_answer',
        candidateTurnKind,
        candidateDispositionFromClassifier: candidateDisposition,
      });
    evaluateTimer.finish({ status: evaluation.status });

    const scoreAfter =
      evaluation.status === 'valid'
        ? evaluation.states.reduce(
            (total, state) => total + state.scoreAwarded,
            0,
          )
        : scoreBefore;
    const scoreDelta = scoreAfter - scoreBefore;

    if (
      evaluation.status === 'provider_error' ||
      evaluation.status === 'invalid_ai_response'
    ) {
      this.logger.warn(
        `Adaptive evaluator fallback attempt=${attemptId} question=${currentQuestion.id} status=${evaluation.status}`,
      );
      this.interviewRealtimeService.emit({
        attemptId,
        eventType: 'adaptive.error_recovered',
        interviewQuestionId: currentQuestion.id,
      });
    }

    if (evaluation.status === 'valid') {
      candidateDisposition =
        candidateDisposition ?? evaluation.candidateDisposition;
    }

    if (
      evaluation.status === 'valid' &&
      shouldSkipFollowUps({
        aiDisposition: candidateDisposition,
        candidateTurnKind,
        followUpsUsedForQuestion: contextPacket.followUpLimits.usedForQuestion,
      })
    ) {
      logAdaptiveAiDebug(this.logger, 'submit_answer.candidate_declined_ai', {
        attemptId,
        interviewQuestionId: currentQuestion.id,
        candidateDisposition,
      });

      await this.checkpointStateService.applyCandidateDeclinedKnowledge({
        attemptId,
        interviewQuestionId: currentQuestion.id,
      });

      const result = await this.completeCurrentQuestion({
        attempt,
        questions,
        currentQuestion,
        answeredMainQuestions: saveResult.answeredMainQuestions,
        totalMainQuestions,
      });
      submitTimer.finish({
        outcome: result.status,
        candidateDeclinedAi: true,
        isFollowUp: result.isFollowUp,
      });
      return result;
    }

    const planTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.plan_follow_up',
      { attemptId, interviewQuestionId: currentQuestion.id },
    );
    const planResult = await this.followUpPlannerService.planFollowUp(
      attemptId,
      currentQuestion.id,
      {
        context: contextPacket,
        suggestedFollowUp:
          evaluation.status === 'valid'
            ? evaluation.suggestedFollowUp
            : undefined,
        candidateDispositionFromAi:
          evaluation.status === 'valid' ? candidateDisposition : undefined,
        candidateTurnKind:
          evaluation.status === 'valid' ? candidateTurnKind : undefined,
        evaluationMode,
        followUpsUsedForQuestion: contextPacket.followUpLimits.usedForQuestion,
        avoidLlmFallback: evaluation.status === 'valid',
        recentScoreDeltas: isFollowUpAnswer ? [scoreDelta] : undefined,
        latestCheckpointResults:
          evaluation.status === 'valid'
            ? evaluation.states.map((state) => ({
                checkpointKey: state.checkpointKey,
                status: state.status,
                scoreAwarded: state.scoreAwarded,
                rationale: state.rationale,
              }))
            : undefined,
      },
    );
    planTimer.finish({ status: planResult.status });

    if (planResult.status === 'planned') {
      this.interviewRealtimeService.emit({
        attemptId,
        eventType: 'ai.follow_up_planned',
        interviewQuestionId: currentQuestion.id,
        followUpId: planResult.followUpId,
      });

      return this.appendFollowUpQuestion({
        attempt,
        currentQuestion,
        followUpId: planResult.followUpId,
        followUpQuestion: planResult.followUpQuestion,
        checkpointKey: planResult.checkpointKey,
        answeredMainQuestions: saveResult.answeredMainQuestions,
        totalMainQuestions,
      }).then((result) => {
        submitTimer.finish({ outcome: result.status, isFollowUp: true });
        return result;
      });
    }

    const result = await this.completeCurrentQuestion({
      attempt,
      questions,
      currentQuestion,
      answeredMainQuestions: saveResult.answeredMainQuestions,
      totalMainQuestions,
    });
    submitTimer.finish({
      outcome: result.status,
      isFollowUp: result.isFollowUp,
    });
    return result;
  }

  private async appendFollowUpQuestion(input: {
    attempt: AdaptiveSubmitInput['attempt'];
    currentQuestion: InterviewQuestionEntity;
    followUpId: number;
    followUpQuestion: string;
    checkpointKey: string;
    answeredMainQuestions: number;
    totalMainQuestions: number;
  }): Promise<AdaptiveSubmitResult> {
    const attemptId = input.attempt.id;

    const followUpCount = await this.followUpRepository.countUsedForQuestion(
      attemptId,
      input.currentQuestion.id,
    );

    const aiMessage = await this.database.withTransaction(async (query) => {
      const sequenceOrder = await this.repository.getNextSequenceOrder(
        attemptId,
        query,
      );

      const message = await this.repository.appendMessage(
        {
          companyId: input.attempt.companyId,
          attemptId,
          interviewQuestionId: input.currentQuestion.id,
          role: 'ai',
          content: input.followUpQuestion,
          sequenceOrder,
          messageKind: 'follow_up_question',
          targetCheckpointKey: input.checkpointKey,
        },
        query,
      );

      await this.followUpRepository.markAsked(
        input.followUpId,
        message.id,
        query,
      );

      return message;
    });

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'message.appended',
      interviewQuestionId: input.currentQuestion.id,
      messageId: aiMessage.id,
      followUpId: input.followUpId,
      sequenceOrder: aiMessage.sequenceOrder,
      messageKind: 'follow_up_question',
    });

    return {
      status: 'in_progress',
      nextQuestionText: input.followUpQuestion,
      pendingMessageText: input.followUpQuestion,
      messageKind: InterviewMessageKindEnum.follow_up_question,
      currentInterviewQuestionId: input.currentQuestion.id,
      isFollowUp: true,
      answeredMainQuestions: input.answeredMainQuestions,
      totalMainQuestions: input.totalMainQuestions,
      currentQuestionFollowUpCount: followUpCount,
    };
  }

  private async handleTopicOpenerAnswer(input: {
    attempt: AdaptiveSubmitInput['attempt'];
    questions: InterviewQuestionEntity[];
    currentQuestion: InterviewQuestionEntity;
    trimmedAnswer: string;
    topicOpenerMessageId: number;
    topicOpenerText: string;
    answeredMainQuestions: number;
    totalMainQuestions: number;
    mediaAssetId?: number | null;
  }): Promise<AdaptiveSubmitResult> {
    const attemptId = input.attempt.id;
    const submitTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.topic_opener',
      { attemptId, interviewQuestionId: input.currentQuestion.id },
    );

    const saveResult = await this.database.withTransaction(async (query) => {
      const sequenceOrder = await this.repository.getNextSequenceOrder(
        attemptId,
        query,
      );

      const candidateMessage = await this.repository.appendMessage(
        {
          companyId: input.attempt.companyId,
          attemptId,
          interviewQuestionId: input.currentQuestion.id,
          role: 'candidate',
          content: input.trimmedAnswer,
          sequenceOrder,
          messageKind: 'topic_opener_answer',
          parentMessageId: input.topicOpenerMessageId,
        },
        query,
      );

      return { candidateMessage };
    });

    if (input.mediaAssetId) {
      await this.mediaAssetService.linkPendingAssetToMessage({
        mediaAssetId: input.mediaAssetId,
        attemptId,
        messageId: saveResult.candidateMessage.id,
      });
    }

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'answer.received',
      interviewQuestionId: input.currentQuestion.id,
      messageId: saveResult.candidateMessage.id,
      sequenceOrder: saveResult.candidateMessage.sequenceOrder,
      messageKind: 'topic_opener_answer',
    });

    await this.scoreTopicOpenerAnswerIfEligible({
      attempt: input.attempt,
      currentQuestion: input.currentQuestion,
      trimmedAnswer: input.trimmedAnswer,
      candidateMessageId: saveResult.candidateMessage.id,
    });

    const mainQuestionText =
      await this.mainQuestionOpenerService.generateQuestionInvite({
        attemptId,
        interviewQuestionId: input.currentQuestion.id,
        topicOpenerText: input.topicOpenerText,
        candidateOpenerAnswer: input.trimmedAnswer,
        questionText: input.currentQuestion.questionText,
        referenceAnswer: input.currentQuestion.shortAnswer,
        seed: attemptId + input.currentQuestion.id,
      });

    const streamedMainQuestion = this.aiMessageStreamService.isEnabled()
      ? await this.aiMessageStreamService.streamStaticText({
          attemptId,
          interviewQuestionId: input.currentQuestion.id,
          messageKind: 'main_question',
          text: mainQuestionText,
        })
      : mainQuestionText;

    const aiMessage = await this.database.withTransaction(async (query) => {
      const sequenceOrder = await this.repository.getNextSequenceOrder(
        attemptId,
        query,
      );

      return this.repository.appendMessage(
        {
          companyId: input.attempt.companyId,
          attemptId,
          interviewQuestionId: input.currentQuestion.id,
          role: 'ai',
          content: streamedMainQuestion,
          sequenceOrder,
          messageKind: 'main_question',
        },
        query,
      );
    });

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'message.appended',
      interviewQuestionId: input.currentQuestion.id,
      messageId: aiMessage.id,
      sequenceOrder: aiMessage.sequenceOrder,
      messageKind: 'main_question',
    });

    await this.initializeQuestionAiState({
      companyId: input.attempt.companyId,
      attemptId,
      interviewQuestionId: input.currentQuestion.id,
    });

    submitTimer.finish({ outcome: 'main_question_revealed' });

    return {
      status: 'in_progress',
      nextQuestionText: streamedMainQuestion,
      pendingMessageText: streamedMainQuestion,
      messageKind: InterviewMessageKindEnum.main_question,
      currentInterviewQuestionId: input.currentQuestion.id,
      isFollowUp: false,
      answeredMainQuestions: input.answeredMainQuestions,
      totalMainQuestions: input.totalMainQuestions,
      currentQuestionFollowUpCount: 0,
    };
  }

  private async scoreTopicOpenerAnswerIfEligible(input: {
    attempt: AdaptiveSubmitInput['attempt'];
    currentQuestion: InterviewQuestionEntity;
    trimmedAnswer: string;
    candidateMessageId: number;
  }): Promise<void> {
    const attemptId = input.attempt.id;
    const interviewQuestionId = input.currentQuestion.id;

    await this.checkpointStateService.ensureCheckpointStatesForQuestion({
      companyId: input.attempt.companyId,
      attemptId,
      interviewQuestionId,
    });

    const contextPacket =
      await this.adaptiveInterviewContextService.buildContextPacket(
        attemptId,
        interviewQuestionId,
      );

    const classifierInput = buildCandidateTurnClassifierInput({
      context: contextPacket,
      attemptId,
      interviewQuestionId,
    });
    const classificationResult =
      await this.candidateTurnClassifierService.classifyTurn(classifierInput);

    let candidateTurnKind: CandidateTurnKind | null = null;
    let candidateDisposition: CandidateAnswerDisposition | null = null;
    let openerReadiness: TopicOpenerReadiness | null = null;

    if (classificationResult.status === 'valid') {
      candidateTurnKind = classificationResult.classification.turnKind;
      candidateDisposition = classificationResult.classification.disposition;
      openerReadiness = classificationResult.classification.openerReadiness;
    } else {
      const emergencyFallback =
        resolveClassifierEmergencyFallback(classifierInput);
      if (emergencyFallback) {
        candidateTurnKind = emergencyFallback.turnKind;
        candidateDisposition = emergencyFallback.disposition;
        openerReadiness = emergencyFallback.openerReadiness;
      }
    }

    const evaluationMode = resolveEvaluationMode(candidateTurnKind);

    if (shouldSkipEvaluation(evaluationMode)) {
      await this.checkpointStateService.applyCandidateDeclinedKnowledge({
        attemptId,
        interviewQuestionId,
      });
      return;
    }

    const gateResult = await this.topicOpenerScoringGateService.decide({
      topicOpenerText: classifierInput.lastInterviewerMessage ?? '',
      candidateAnswer: input.trimmedAnswer,
      questionText: input.currentQuestion.questionText,
      referenceAnswer: input.currentQuestion.shortAnswer,
      attemptId,
      interviewQuestionId,
    });

    const gateShouldScore =
      gateResult.status === 'valid' ? gateResult.decision.shouldScore : null;

    const shouldScore = shouldScoreTopicOpenerAnswer({
      evaluationMode,
      candidateTurnKind,
      gateShouldScore,
      openerReadinessFallback: openerReadiness,
    });

    logAdaptiveAiDebug(this.logger, 'submit_answer.topic_opener_scoring', {
      attemptId,
      interviewQuestionId,
      evaluationMode,
      turnKind: candidateTurnKind,
      gateStatus: gateResult.status,
      gateShouldScore,
      openerReadiness,
      shouldScore,
      gateReason:
        gateResult.status === 'valid' ? gateResult.decision.reason : undefined,
    });

    if (!shouldScore) {
      return;
    }

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'ai.evaluation_started',
      interviewQuestionId,
      messageId: input.candidateMessageId,
    });

    const evaluateTimer = startAdaptiveAiPhaseTimer(
      this.logger,
      'submit_answer.topic_opener_evaluate',
      { attemptId, interviewQuestionId },
    );
    const evaluation =
      await this.perTurnCheckpointEvaluatorService.evaluateTurnAndPersist({
        companyId: input.attempt.companyId,
        attemptId,
        interviewQuestionId,
        context: contextPacket,
        skipEnsureStates: true,
        evaluationMode,
        evidenceSource: 'topic_opener_answer',
        candidateTurnKind,
        candidateDispositionFromClassifier: candidateDisposition,
      });
    evaluateTimer.finish({ status: evaluation.status });

    if (
      evaluation.status === 'provider_error' ||
      evaluation.status === 'invalid_ai_response'
    ) {
      this.logger.warn(
        `Topic opener evaluator fallback attempt=${attemptId} question=${interviewQuestionId} status=${evaluation.status}`,
      );
    }
  }

  private async completeCurrentQuestion(input: {
    attempt: AdaptiveSubmitInput['attempt'];
    questions: InterviewQuestionEntity[];
    currentQuestion: InterviewQuestionEntity;
    answeredMainQuestions: number;
    totalMainQuestions: number;
  }): Promise<AdaptiveSubmitResult> {
    const attemptId = input.attempt.id;

    await this.adaptiveAiConversationService.clearQuestionSessions(
      attemptId,
      input.currentQuestion.id,
    );
    await this.adaptiveOpenAiResponseStateService.clearEvaluateState(
      attemptId,
      input.currentQuestion.id,
    );

    await this.questionSummaryService.buildAndPersist({
      companyId: input.attempt.companyId,
      attemptId,
      interviewQuestionId: input.currentQuestion.id,
    });

    const followUpCount = await this.followUpRepository.countUsedForQuestion(
      attemptId,
      input.currentQuestion.id,
    );

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'question.completed',
      interviewQuestionId: input.currentQuestion.id,
    });

    if (input.answeredMainQuestions < input.totalMainQuestions) {
      const nextQuestion = input.questions[input.answeredMainQuestions];
      const nextOpenerText = await this.postTopicOpenerForQuestion({
        companyId: input.attempt.companyId,
        attemptId,
        question: nextQuestion,
        answeredMainQuestions: input.answeredMainQuestions,
      });

      return {
        status: 'in_progress',
        nextQuestionText: nextOpenerText,
        pendingMessageText: nextOpenerText,
        messageKind: InterviewMessageKindEnum.topic_opener,
        currentInterviewQuestionId: nextQuestion.id,
        isFollowUp: false,
        answeredMainQuestions: input.answeredMainQuestions,
        totalMainQuestions: input.totalMainQuestions,
        currentQuestionFollowUpCount: followUpCount,
      };
    }

    await this.repository.completeAttempt(attemptId);

    this.interviewRealtimeService.emit({
      attemptId,
      eventType: 'attempt.completed',
      interviewQuestionId: input.currentQuestion.id,
    });

    return {
      status: 'completed',
      nextQuestionText: null,
      pendingMessageText: null,
      messageKind: null,
      currentInterviewQuestionId: input.currentQuestion.id,
      isFollowUp: false,
      answeredMainQuestions: input.answeredMainQuestions,
      totalMainQuestions: input.totalMainQuestions,
      currentQuestionFollowUpCount: followUpCount,
    };
  }
}

export function resolveSessionProgress(input: {
  messages: InterviewMessageEntity[];
  questions: InterviewQuestionEntity[];
  answeredMainQuestions: number;
  adaptiveEnabled: boolean;
}): {
  currentQuestionText: string | null;
  currentQuestionId: number | null;
} {
  if (!input.adaptiveEnabled) {
    const currentQuestion =
      input.questions[input.answeredMainQuestions] ?? null;

    return {
      currentQuestionText: currentQuestion?.questionText ?? null,
      currentQuestionId: currentQuestion?.id ?? null,
    };
  }

  const lastMessage = input.messages[input.messages.length - 1];

  if (lastMessage?.role === 'ai') {
    return {
      currentQuestionText: lastMessage.content,
      currentQuestionId: lastMessage.interviewQuestionId,
    };
  }

  const nextQuestion = input.questions[input.answeredMainQuestions] ?? null;

  return {
    currentQuestionText: nextQuestion?.questionText ?? null,
    currentQuestionId: nextQuestion?.id ?? null,
  };
}
