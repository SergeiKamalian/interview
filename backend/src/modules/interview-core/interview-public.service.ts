import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { isAdaptiveInterviewEnabled } from '../adaptive-interview/config/adaptive-interview-context.config';
import {
  AdaptiveInterviewSubmitService,
  resolveSessionProgress,
} from '../adaptive-interview/services/adaptive-interview-submit.service';
import { AiEvaluationService } from '../ai-evaluation/services/ai-evaluation.service';
import { CheckpointStateService } from '../adaptive-interview/services/checkpoint-state.service';
import { InterviewRealtimeService } from '../interview-realtime/interview-realtime.service';
import {
  MediaAssetService,
  VOICE_ANSWER_PLACEHOLDER,
} from '../media/media-asset.service';
import { DatabaseService } from '../../common/database/database.service';
import type { StartPublicInterviewInput } from './dto/start-public-interview.input';
import type { BeginInterviewAttemptInput } from './dto/begin-interview-attempt.input';
import {
  buildSessionPayload,
  buildStartPayload,
  buildSubmitPayload,
  mapPublicInterview,
} from './interview-core.mapper';
import { InterviewCoreRepository } from './interview-core.repository';
import { PublicTokenService } from './public-token.service';
import { resolveWelcomeMessage } from './utils/interview-welcome.util';
import type {
  InterviewSessionType,
  PublicInterviewType,
  StartPublicInterviewPayload,
  SubmitInterviewAnswerPayload,
} from './types/interview.type';

@Injectable()
export class InterviewPublicService {
  private readonly logger = new Logger(InterviewPublicService.name);

  constructor(
    private readonly repository: InterviewCoreRepository,
    private readonly database: DatabaseService,
    private readonly publicTokenService: PublicTokenService,
    private readonly checkpointStateService: CheckpointStateService,
    private readonly adaptiveInterviewSubmitService: AdaptiveInterviewSubmitService,
    private readonly interviewRealtimeService: InterviewRealtimeService,
    private readonly mediaAssetService: MediaAssetService,
    @Inject(forwardRef(() => AiEvaluationService))
    private readonly aiEvaluationService: AiEvaluationService,
  ) {}

  private isAdaptiveEnabled(): boolean {
    return isAdaptiveInterviewEnabled();
  }

  private scheduleEvaluation(companyId: number, attemptId: number): void {
    void this.aiEvaluationService
      .evaluateAttempt(companyId, attemptId)
      .then(() => {
        this.interviewRealtimeService.emit({
          attemptId,
          eventType: 'evaluation.ready',
        });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Auto AI evaluation failed for attempt ${attemptId}: ${message}`,
        );
      });
  }

  async getPublicInterview(publicToken: string): Promise<PublicInterviewType> {
    const interview = await this.repository.findByPublicToken(publicToken);

    if (!interview) {
      throw new NotFoundException({
        message: 'Interview not found or not published',
        code: 'PUBLIC_INTERVIEW_NOT_FOUND',
      });
    }

    return mapPublicInterview(interview);
  }

  async startPublicInterview(
    input: StartPublicInterviewInput,
  ): Promise<StartPublicInterviewPayload> {
    const interview = await this.repository.findByPublicToken(
      input.publicToken,
    );

    if (!interview) {
      throw new NotFoundException({
        message: 'Interview not found or not published',
        code: 'PUBLIC_INTERVIEW_NOT_FOUND',
      });
    }

    const questions = await this.repository.listQuestionsForInterview(
      interview.id,
    );

    if (questions.length === 0) {
      throw new BadRequestException({
        message: 'Interview has no questions',
        code: 'INTERVIEW_HAS_NO_QUESTIONS',
      });
    }

    const email = input.email.trim().toLowerCase();
    const adaptiveEnabled = this.isAdaptiveEnabled();

    const result = await this.database.withTransaction(async (query) => {
      const candidate = await this.repository.findOrCreateCandidate(
        {
          companyId: interview.companyId,
          interviewId: interview.id,
          fullName: input.fullName.trim(),
          email,
          phone: input.phone?.trim() ?? null,
          linkedinUrl: input.linkedinUrl?.trim() ?? null,
          githubUrl: input.githubUrl?.trim() ?? null,
        },
        query,
      );

      let attempt = await this.repository.findActiveAttempt(
        interview.id,
        candidate.id,
      );

      if (!attempt) {
        const welcomeText = resolveWelcomeMessage({
          template: interview.welcomeMessageTemplate,
          interviewerName: interview.interviewerName,
          candidateName: input.fullName.trim(),
          jobRole: interview.jobRole,
          title: interview.title,
          questionCount: questions.length,
        });

        attempt = await this.repository.createAttempt(
          {
            companyId: interview.companyId,
            interviewId: interview.id,
            candidateId: candidate.id,
          },
          query,
        );

        await this.repository.appendMessage(
          {
            companyId: interview.companyId,
            attemptId: attempt.id,
            interviewQuestionId: null,
            role: 'ai',
            content: welcomeText,
            sequenceOrder: 1,
            messageKind: 'welcome',
          },
          query,
        );
      }

      const answered = adaptiveEnabled
        ? await this.repository.countMainAnswerMessages(attempt.id)
        : await this.repository.countCandidateMessages(attempt.id);
      const currentQuestion = questions[answered] ?? questions[0];
      const isWelcomePending = attempt.status === 'pending';

      return {
        companyId: interview.companyId,
        attemptId: attempt.id,
        currentQuestionId: isWelcomePending ? null : currentQuestion.id,
        currentQuestionText: isWelcomePending
          ? null
          : currentQuestion.questionText,
        totalQuestions: questions.length,
        isWelcomePending,
      };
    });

    if (adaptiveEnabled && !result.isWelcomePending) {
      await this.adaptiveInterviewSubmitService.initializeQuestionAiState({
        companyId: result.companyId,
        attemptId: result.attemptId,
        interviewQuestionId: result.currentQuestionId!,
      });
    }

    return buildStartPayload(result);
  }

  async beginInterviewAttempt(
    input: BeginInterviewAttemptInput,
  ): Promise<InterviewSessionType> {
    const attemptId = Number(input.attemptId);
    const interview = await this.repository.findInterviewByAttemptId(
      attemptId,
      input.publicToken,
    );

    if (!interview) {
      throw new NotFoundException('Interview attempt not found');
    }

    const attempt = await this.repository.findAttemptById(
      attemptId,
      input.publicToken,
    );

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    if (attempt.status !== 'pending') {
      return this.getSession(input.publicToken, input.attemptId);
    }

    const questions = await this.repository.listQuestionsForInterview(
      interview.id,
    );

    if (questions.length === 0) {
      throw new BadRequestException({
        message: 'Interview has no questions',
        code: 'INTERVIEW_HAS_NO_QUESTIONS',
      });
    }

    const adaptiveEnabled = this.isAdaptiveEnabled();
    const firstQuestion = questions[0];

    const began = await this.database.withTransaction(async (query) => {
      const started = await this.repository.beginAttempt(attemptId, query);
      return started;
    });

    if (!began) {
      return this.getSession(input.publicToken, input.attemptId);
    }

    if (adaptiveEnabled) {
      await this.adaptiveInterviewSubmitService.postTopicOpenerForQuestion({
        companyId: interview.companyId,
        attemptId,
        question: firstQuestion,
        answeredMainQuestions: 0,
      });
    } else {
      await this.database.withTransaction(async (query) => {
        await this.repository.appendMessage(
          {
            companyId: interview.companyId,
            attemptId,
            interviewQuestionId: firstQuestion.id,
            role: 'ai',
            content: firstQuestion.questionText,
            sequenceOrder: 2,
            messageKind: null,
          },
          query,
        );

        await this.checkpointStateService.ensureCheckpointStatesForQuestion(
          {
            companyId: interview.companyId,
            attemptId,
            interviewQuestionId: firstQuestion.id,
          },
          query,
        );
      });
    }

    return this.getSession(input.publicToken, input.attemptId);
  }

  private async resolveSessionWelcomeContext(
    attemptId: number,
    publicToken: string,
  ): Promise<{
    welcomeMessage: string | null;
    isWelcomePending: boolean;
  }> {
    const attempt = await this.repository.findAttemptById(attemptId, publicToken);
    if (!attempt) {
      return { welcomeMessage: null, isWelcomePending: false };
    }

    const isWelcomePending = attempt.status === 'pending';
    if (!isWelcomePending) {
      return { welcomeMessage: null, isWelcomePending: false };
    }

    const [interview, candidate] = await Promise.all([
      this.repository.findInterviewByAttemptId(attemptId, publicToken),
      this.repository.findCandidateByAttemptId(attemptId),
    ]);

    if (!interview || !candidate) {
      return { welcomeMessage: null, isWelcomePending: true };
    }

    const questions = await this.repository.listQuestionsForInterview(
      interview.id,
    );

    return {
      welcomeMessage: resolveWelcomeMessage({
        template: interview.welcomeMessageTemplate,
        interviewerName: interview.interviewerName,
        candidateName: candidate.fullName,
        jobRole: interview.jobRole,
        title: interview.title,
        questionCount: questions.length,
      }),
      isWelcomePending: true,
    };
  }

  async getSession(
    publicToken: string,
    attemptIdRaw: string,
  ): Promise<InterviewSessionType> {
    const attemptId = Number(attemptIdRaw);
    const attempt = await this.repository.findAttemptById(
      attemptId,
      publicToken,
    );

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    const adaptiveEnabled = this.isAdaptiveEnabled();
    const [questions, messages, answeredMainQuestions] = await Promise.all([
      this.repository.listQuestionsForInterview(attempt.interviewId),
      this.repository.listMessages(attemptId),
      adaptiveEnabled
        ? this.repository.countMainAnswerMessages(attemptId)
        : this.repository.countCandidateMessages(attemptId),
    ]);

    const progress = resolveSessionProgress({
      messages,
      questions,
      answeredMainQuestions,
      adaptiveEnabled,
    });

    const welcomeContext = await this.resolveSessionWelcomeContext(
      attemptId,
      publicToken,
    );

    const sessionInProgress =
      attempt.status === 'in_progress' &&
      (answeredMainQuestions < questions.length ||
        (adaptiveEnabled &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === 'ai'));

    const currentQuestion = sessionInProgress
      ? progress
      : { currentQuestionText: null, currentQuestionId: null };

    return buildSessionPayload({
      attempt,
      messages,
      totalQuestions: questions.length,
      answeredQuestions: answeredMainQuestions,
      currentQuestionText: welcomeContext.isWelcomePending
        ? null
        : currentQuestion.currentQuestionText,
      currentQuestionId: welcomeContext.isWelcomePending
        ? null
        : currentQuestion.currentQuestionId,
      welcomeMessage: welcomeContext.welcomeMessage,
      isWelcomePending: welcomeContext.isWelcomePending,
    });
  }

  async submitAnswer(
    publicToken: string,
    attemptIdRaw: string,
    answer: string,
    mediaAssetIdRaw?: string | null,
  ): Promise<SubmitInterviewAnswerPayload> {
    const attemptId = Number(attemptIdRaw);
    const attempt = await this.repository.findAttemptById(
      attemptId,
      publicToken,
    );

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestException({
        message: 'Interview attempt is not active',
        code: 'ATTEMPT_NOT_ACTIVE',
      });
    }

    const mediaAssetId = this.parseMediaAssetId(mediaAssetIdRaw);
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer && !mediaAssetId) {
      throw new BadRequestException({
        message: 'Answer cannot be empty',
        code: 'EMPTY_ANSWER',
      });
    }

    const effectiveAnswer = trimmedAnswer || VOICE_ANSWER_PLACEHOLDER;

    const questions = await this.repository.listQuestionsForInterview(
      attempt.interviewId,
    );

    if (!this.isAdaptiveEnabled()) {
      return this.submitLegacyAnswer({
        attempt,
        attemptId,
        questions,
        trimmedAnswer: effectiveAnswer,
        mediaAssetId,
      });
    }

    await this.adaptiveInterviewSubmitService.assertCanSubmit(
      attemptId,
      questions.length,
    );

    const adaptiveResult =
      await this.adaptiveInterviewSubmitService.submitAnswer({
        attempt,
        questions,
        trimmedAnswer: effectiveAnswer,
        mediaAssetId,
      });

    if (adaptiveResult.status === 'completed') {
      this.scheduleEvaluation(attempt.companyId, attemptId);
    }

    return buildSubmitPayload({
      status: adaptiveResult.status,
      nextQuestionText: adaptiveResult.nextQuestionText,
      pendingMessageText: adaptiveResult.pendingMessageText,
      messageKind: adaptiveResult.messageKind,
      currentInterviewQuestionId: adaptiveResult.currentInterviewQuestionId,
      isFollowUp: adaptiveResult.isFollowUp,
      answeredMainQuestions: adaptiveResult.answeredMainQuestions,
      totalMainQuestions: adaptiveResult.totalMainQuestions,
      currentQuestionFollowUpCount: adaptiveResult.currentQuestionFollowUpCount,
      answeredQuestions: adaptiveResult.answeredMainQuestions,
      totalQuestions: adaptiveResult.totalMainQuestions,
    });
  }

  private async submitLegacyAnswer(input: {
    attempt: { companyId: number; id: number };
    attemptId: number;
    questions: Awaited<
      ReturnType<InterviewCoreRepository['listQuestionsForInterview']>
    >;
    trimmedAnswer: string;
    mediaAssetId: number | null;
  }): Promise<SubmitInterviewAnswerPayload> {
    const answeredBefore = await this.repository.countCandidateMessages(
      input.attemptId,
    );

    if (answeredBefore >= input.questions.length) {
      throw new BadRequestException({
        message: 'All questions already answered',
        code: 'INTERVIEW_ALREADY_COMPLETE',
      });
    }

    const currentQuestion = input.questions[answeredBefore];

    const result = await this.database.withTransaction(async (query) => {
      await this.checkpointStateService.ensureCheckpointStatesForQuestion(
        {
          companyId: input.attempt.companyId,
          attemptId: input.attemptId,
          interviewQuestionId: currentQuestion.id,
        },
        query,
      );

      const sequenceOrder = await this.repository.getNextSequenceOrder(
        input.attemptId,
        query,
      );

      const candidateMessage = await this.repository.appendMessage(
        {
          companyId: input.attempt.companyId,
          attemptId: input.attemptId,
          interviewQuestionId: currentQuestion.id,
          role: 'candidate',
          content: input.trimmedAnswer,
          sequenceOrder,
        },
        query,
      );

      if (input.mediaAssetId) {
        await this.mediaAssetService.linkPendingAssetToMessage({
          mediaAssetId: input.mediaAssetId,
          attemptId: input.attemptId,
          messageId: candidateMessage.id,
        });
      }

      const answeredAfter = answeredBefore + 1;

      if (answeredAfter < input.questions.length) {
        const nextQuestion = input.questions[answeredAfter];
        const nextSequence = sequenceOrder + 1;

        await this.repository.appendMessage(
          {
            companyId: input.attempt.companyId,
            attemptId: input.attemptId,
            interviewQuestionId: nextQuestion.id,
            role: 'ai',
            content: nextQuestion.questionText,
            sequenceOrder: nextSequence,
          },
          query,
        );

        return {
          status: 'in_progress' as const,
          nextQuestionText: nextQuestion.questionText,
          answeredQuestions: answeredAfter,
          totalQuestions: input.questions.length,
        };
      }

      await this.repository.completeAttempt(input.attemptId, query);

      return {
        status: 'completed' as const,
        nextQuestionText: null,
        answeredQuestions: answeredAfter,
        totalQuestions: input.questions.length,
      };
    });

    if (result.status === 'completed') {
      this.scheduleEvaluation(input.attempt.companyId, input.attemptId);
    }

    return buildSubmitPayload({
      ...result,
      answeredMainQuestions: result.answeredQuestions,
      totalMainQuestions: result.totalQuestions,
      isFollowUp: false,
      currentQuestionFollowUpCount: 0,
    });
  }

  private parseMediaAssetId(mediaAssetIdRaw?: string | null): number | null {
    if (!mediaAssetIdRaw?.trim()) {
      return null;
    }

    const mediaAssetId = Number(mediaAssetIdRaw);
    if (!Number.isInteger(mediaAssetId) || mediaAssetId < 1) {
      throw new BadRequestException({
        message: 'Invalid media asset id',
        code: 'INVALID_MEDIA_ASSET',
      });
    }

    return mediaAssetId;
  }

  async completeAttempt(
    publicToken: string,
    attemptIdRaw: string,
  ): Promise<InterviewSessionType> {
    const attemptId = Number(attemptIdRaw);
    const attempt = await this.repository.findAttemptById(
      attemptId,
      publicToken,
    );

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    if (attempt.status === 'in_progress') {
      await this.repository.completeAttempt(attemptId);
      this.scheduleEvaluation(attempt.companyId, attemptId);
    }

    return this.getSession(publicToken, attemptIdRaw);
  }

  maskToken(token: string): string {
    return this.publicTokenService.mask(token);
  }
}
