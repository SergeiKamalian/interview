import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { AiEvaluationService } from '../ai-evaluation/services/ai-evaluation.service';
import { DatabaseService } from '../../common/database/database.service';
import type { StartPublicInterviewInput } from './dto/start-public-interview.input';
import {
  buildSessionPayload,
  buildStartPayload,
  buildSubmitPayload,
  mapPublicInterview,
} from './interview-core.mapper';
import { InterviewCoreRepository } from './interview-core.repository';
import { PublicTokenService } from './public-token.service';
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
    @Inject(forwardRef(() => AiEvaluationService))
    private readonly aiEvaluationService: AiEvaluationService,
  ) {}

  private scheduleEvaluation(companyId: number, attemptId: number): void {
    void this.aiEvaluationService
      .evaluateAttempt(companyId, attemptId)
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
        attempt = await this.repository.createAttempt(
          {
            companyId: interview.companyId,
            interviewId: interview.id,
            candidateId: candidate.id,
          },
          query,
        );

        const firstQuestion = questions[0];
        await this.repository.appendMessage(
          {
            companyId: interview.companyId,
            attemptId: attempt.id,
            interviewQuestionId: firstQuestion.id,
            role: 'ai',
            content: firstQuestion.questionText,
            sequenceOrder: 1,
          },
          query,
        );
      }

      const answered = await this.repository.countCandidateMessages(attempt.id);
      const currentQuestion = questions[answered] ?? questions[0];

      return {
        attemptId: attempt.id,
        currentQuestionText: currentQuestion.questionText,
        totalQuestions: questions.length,
      };
    });

    return buildStartPayload(result);
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

    const [questions, messages, answeredQuestions] = await Promise.all([
      this.repository.listQuestionsForInterview(attempt.interviewId),
      this.repository.listMessages(attemptId),
      this.repository.countCandidateMessages(attemptId),
    ]);

    const currentQuestion =
      attempt.status === 'in_progress' && answeredQuestions < questions.length
        ? questions[answeredQuestions]
        : null;

    return buildSessionPayload({
      attempt,
      messages,
      totalQuestions: questions.length,
      answeredQuestions,
      currentQuestionText: currentQuestion?.questionText ?? null,
      currentQuestionId: currentQuestion?.id ?? null,
    });
  }

  async submitAnswer(
    publicToken: string,
    attemptIdRaw: string,
    answer: string,
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

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      throw new BadRequestException({
        message: 'Answer cannot be empty',
        code: 'EMPTY_ANSWER',
      });
    }

    const questions = await this.repository.listQuestionsForInterview(
      attempt.interviewId,
    );

    const answeredBefore =
      await this.repository.countCandidateMessages(attemptId);

    if (answeredBefore >= questions.length) {
      throw new BadRequestException({
        message: 'All questions already answered',
        code: 'INTERVIEW_ALREADY_COMPLETE',
      });
    }

    const currentQuestion = questions[answeredBefore];

    const result = await this.database.withTransaction(async (query) => {
      const sequenceOrder = await this.repository.getNextSequenceOrder(
        attemptId,
        query,
      );

      await this.repository.appendMessage(
        {
          companyId: attempt.companyId,
          attemptId,
          interviewQuestionId: currentQuestion.id,
          role: 'candidate',
          content: trimmedAnswer,
          sequenceOrder,
        },
        query,
      );

      const answeredAfter = answeredBefore + 1;

      if (answeredAfter < questions.length) {
        const nextQuestion = questions[answeredAfter];
        const nextSequence = sequenceOrder + 1;

        await this.repository.appendMessage(
          {
            companyId: attempt.companyId,
            attemptId,
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
          totalQuestions: questions.length,
        };
      }

      await this.repository.completeAttempt(attemptId, query);

      return {
        status: 'completed' as const,
        nextQuestionText: null,
        answeredQuestions: answeredAfter,
        totalQuestions: questions.length,
      };
    });

    if (result.status === 'completed') {
      this.scheduleEvaluation(attempt.companyId, attemptId);
    }

    return buildSubmitPayload(result);
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
