import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { CompanyQuestionOverrideRepository } from '../question-bank/company-question-override.repository';
import { QuestionBankRepository } from '../question-bank/question-bank.repository';
import { mergeQuestionWithOverride } from '../question-bank/utils/merge-question-with-override';
import type { CreateInterviewInput } from './dto/create-interview.input';
import { mapInterviewToGraphql } from './interview-core.mapper';
import { InterviewCoreRepository } from './interview-core.repository';
import { PublicTokenService } from './public-token.service';
import type { InterviewType } from './types/interview.type';
import type { InterviewStatus } from './types/interview-status.enum';
import {
  DEFAULT_AI_TONE,
  DEFAULT_PROBING_DEPTH,
  DEFAULT_SCORING_STRICTNESS,
} from './types/interview-config.enum';

@Injectable()
export class InterviewCoreService {
  constructor(
    private readonly repository: InterviewCoreRepository,
    private readonly questionBankRepository: QuestionBankRepository,
    private readonly overrideRepository: CompanyQuestionOverrideRepository,
    private readonly database: DatabaseService,
    private readonly publicTokenService: PublicTokenService,
  ) {}

  async createInterview(
    companyId: number,
    userId: number,
    input: CreateInterviewInput,
  ): Promise<InterviewType> {
    const questionIds = input.questionIds.map((id) => Number(id));

    if (new Set(questionIds).size !== questionIds.length) {
      throw new BadRequestException({
        message: 'Duplicate question IDs are not allowed',
        code: 'DUPLICATE_QUESTION_IDS',
      });
    }

    const questions = await Promise.all(
      questionIds.map((id) =>
        this.questionBankRepository.findVisibleById(companyId, id),
      ),
    );

    if (questions.some((question) => !question)) {
      throw new ForbiddenException({
        message: 'One or more questions are not accessible for this company',
        code: 'QUESTION_SCOPE_VIOLATION',
      });
    }

    const loadedQuestions = questions.filter(
      (question): question is NonNullable<(typeof questions)[number]> =>
        question !== null,
    );

    const globalQuestionIds = loadedQuestions
      .filter((question) => question.companyId === null)
      .map((question) => question.id);
    const overrides = await this.overrideRepository.findBySourceQuestionIds(
      companyId,
      globalQuestionIds,
    );

    const mergedQuestions = loadedQuestions.map((question) => {
      if (question.companyId !== null) {
        return question;
      }

      const override = overrides.get(question.id);
      if (!override) {
        return question;
      }

      return mergeQuestionWithOverride(question, override).question;
    });

    const questionTopicWeights = new Map<number, number>();
    for (const question of loadedQuestions) {
      if (question.companyId !== null) {
        continue;
      }

      const override = overrides.get(question.id);
      if (override?.topicWeightOverride != null) {
        questionTopicWeights.set(question.id, override.topicWeightOverride);
      }
    }

    const topicNames = new Map<number, string>();
    const topicWeights = new Map<number, number>();
    await Promise.all(
      mergedQuestions.map(async (question) => {
        const topic = await this.questionBankRepository.findTopicById(
          companyId,
          question.topicId,
        );
        if (topic) {
          topicNames.set(question.topicId, topic.name);
          topicWeights.set(question.topicId, topic.interviewWeight);
        }
      }),
    );

    const publicToken = this.publicTokenService.generate();

    const interview = await this.database.withTransaction((query) =>
      this.repository.createInterview(
        {
          companyId,
          createdByUserId: userId,
          title: input.title.trim(),
          jobRole: input.jobRole.trim(),
          level: input.level,
          interviewLanguage: input.interviewLanguage?.trim() || 'ru',
          questionCount: input.questionCount ?? questionIds.length,
          jobDescription: input.jobDescription?.trim() ?? null,
          professionId: input.professionId ? Number(input.professionId) : null,
          publicToken,
          isVideoEnabled: input.isVideoEnabled ?? false,
          interviewerName: input.interviewerName?.trim() ?? null,
          welcomeMessageTemplate: input.welcomeMessageTemplate?.trim() ?? null,
          aiTone: input.aiTone ?? DEFAULT_AI_TONE,
          probingDepth: input.probingDepth ?? DEFAULT_PROBING_DEPTH,
          scoringStrictness:
            input.scoringStrictness ?? DEFAULT_SCORING_STRICTNESS,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          maxCompletions: input.maxCompletions ?? null,
          allowRetake: input.allowRetake ?? false,
          timeLimitMinutes: input.timeLimitMinutes ?? null,
          passingScore: input.passingScore ?? null,
          requirePhone: input.requirePhone ?? false,
          requireLinkedin: input.requireLinkedin ?? false,
          requireGithub: input.requireGithub ?? false,
          questions: mergedQuestions,
          topicNames,
          topicWeights,
          questionTopicWeights,
        },
        query,
      ),
    );

    return mapInterviewToGraphql(interview);
  }

  async publishInterview(
    companyId: number,
    interviewIdRaw: string,
  ): Promise<InterviewType> {
    const interviewId = Number(interviewIdRaw);
    const interview = await this.repository.publishInterview(
      companyId,
      interviewId,
    );

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return mapInterviewToGraphql(interview);
  }

  async pauseInterview(
    companyId: number,
    interviewIdRaw: string,
  ): Promise<InterviewType> {
    return this.transitionStatus(companyId, interviewIdRaw, {
      from: ['active'],
      to: 'paused',
      code: 'INTERVIEW_NOT_PAUSABLE',
      message: 'Only active interviews can be paused',
    });
  }

  async resumeInterview(
    companyId: number,
    interviewIdRaw: string,
  ): Promise<InterviewType> {
    return this.transitionStatus(companyId, interviewIdRaw, {
      from: ['paused'],
      to: 'active',
      code: 'INTERVIEW_NOT_RESUMABLE',
      message: 'Only paused interviews can be resumed',
    });
  }

  async archiveInterview(
    companyId: number,
    interviewIdRaw: string,
  ): Promise<InterviewType> {
    return this.transitionStatus(companyId, interviewIdRaw, {
      from: ['draft', 'active', 'paused'],
      to: 'archived',
      code: 'INTERVIEW_ALREADY_ARCHIVED',
      message: 'Interview is already archived',
    });
  }

  private async transitionStatus(
    companyId: number,
    interviewIdRaw: string,
    transition: {
      from: InterviewStatus[];
      to: InterviewStatus;
      code: string;
      message: string;
    },
  ): Promise<InterviewType> {
    const interviewId = Number(interviewIdRaw);
    const current = await this.repository.findByIdForCompany(
      companyId,
      interviewId,
    );

    if (!current) {
      throw new NotFoundException('Interview not found');
    }

    if (!transition.from.includes(current.status)) {
      throw new BadRequestException({
        message: transition.message,
        code: transition.code,
      });
    }

    const updated = await this.repository.updateStatus(
      companyId,
      interviewId,
      transition.to,
    );

    if (!updated) {
      throw new NotFoundException('Interview not found');
    }

    return mapInterviewToGraphql(updated);
  }

  async getInterview(
    companyId: number,
    interviewIdRaw: string,
  ): Promise<InterviewType> {
    const interview = await this.repository.findByIdForCompany(
      companyId,
      Number(interviewIdRaw),
    );

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return mapInterviewToGraphql(interview);
  }
}
