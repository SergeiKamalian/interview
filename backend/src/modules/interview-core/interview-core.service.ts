import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { QuestionBankRepository } from '../question-bank/question-bank.repository';
import type { CreateInterviewInput } from './dto/create-interview.input';
import { mapInterviewToGraphql } from './interview-core.mapper';
import { InterviewCoreRepository } from './interview-core.repository';
import { PublicTokenService } from './public-token.service';
import type { InterviewType } from './types/interview.type';

@Injectable()
export class InterviewCoreService {
  constructor(
    private readonly repository: InterviewCoreRepository,
    private readonly questionBankRepository: QuestionBankRepository,
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

    const topicNames = new Map<number, string>();
    await Promise.all(
      loadedQuestions.map(async (question) => {
        const topic = await this.questionBankRepository.findTopicById(
          question.topicId,
        );
        if (topic) {
          topicNames.set(question.topicId, topic.name);
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
          questions: loadedQuestions,
          topicNames,
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
