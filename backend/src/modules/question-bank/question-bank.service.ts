import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import type { CreateQuestionInput } from './dto/create-question.input';
import type { QuestionBankFilterInput } from './dto/question-filter.input';
import type { UpdateQuestionInput } from './dto/update-question.input';
import { mapQuestionToGraphql } from './question-bank.mapper';
import {
  QuestionBankRepository,
  type QuestionUpsertData,
} from './question-bank.repository';
import type {
  QuestionBankListPayload,
  QuestionType,
} from './types/question.type';
import { validateQuestionInput } from './validation/question-bank.validator';

@Injectable()
export class QuestionBankService {
  constructor(
    private readonly repository: QuestionBankRepository,
    private readonly database: DatabaseService,
  ) {}

  async list(
    companyId: number,
    filters: QuestionBankFilterInput,
  ): Promise<QuestionBankListPayload> {
    const result = await this.repository.list(companyId, filters);
    const items = await Promise.all(
      result.items.map((question) => this.mapQuestionWithLookups(question)),
    );

    return {
      items,
      total: result.total,
    };
  }

  async getById(companyId: number, questionId: number): Promise<QuestionType> {
    const question = await this.repository.findVisibleById(
      companyId,
      questionId,
    );

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.mapQuestionWithLookups(question);
  }

  async create(
    companyId: number,
    input: CreateQuestionInput,
  ): Promise<QuestionType> {
    validateQuestionInput(input);
    const data = await this.prepareUpsertData(companyId, input, companyId);

    const created = await this.database.withTransaction((query) =>
      this.repository.create(data, query),
    );

    return this.mapQuestionWithLookups(created);
  }

  async update(
    companyId: number,
    input: UpdateQuestionInput,
  ): Promise<QuestionType> {
    validateQuestionInput(input);

    const questionId = Number(input.id);
    const existing = await this.repository.findOwnedById(companyId, questionId);

    if (!existing) {
      throw new ForbiddenException(
        'Only company-owned questions can be updated',
      );
    }

    const data = await this.prepareUpsertData(companyId, input, companyId);

    const updated = await this.database.withTransaction((query) =>
      this.repository.update(questionId, data, query),
    );

    return this.mapQuestionWithLookups(updated);
  }

  async archive(
    companyId: number,
    questionIdRaw: string,
  ): Promise<QuestionType> {
    const questionId = Number(questionIdRaw);
    const existing = await this.repository.findVisibleById(
      companyId,
      questionId,
    );

    if (!existing || existing.companyId !== companyId) {
      throw new ForbiddenException(
        'Only company-owned questions can be archived',
      );
    }

    const snapshot = await this.mapQuestionWithLookups(existing);
    const archived = await this.repository.archive(companyId, questionId);

    if (!archived) {
      throw new NotFoundException('Question not found');
    }

    return {
      ...snapshot,
      isActive: false,
    };
  }

  private async prepareUpsertData(
    companyId: number,
    input: CreateQuestionInput,
    ownerCompanyId: number | null,
  ): Promise<QuestionUpsertData> {
    const professionId = Number(input.professionId);
    const topicId = Number(input.topicId);
    const skillIds = input.skillIds.map((id) => Number(id));

    const [profession, topic, skills] = await Promise.all([
      this.repository.findProfessionById(professionId),
      this.repository.findTopicById(topicId),
      this.repository.findSkillsByIds(skillIds),
    ]);

    if (!profession) {
      throw new BadRequestException({
        message: 'Profession not found',
        code: 'PROFESSION_NOT_FOUND',
      });
    }

    if (!topic) {
      throw new BadRequestException({
        message: 'Topic not found',
        code: 'TOPIC_NOT_FOUND',
      });
    }

    if (skills.length !== skillIds.length) {
      throw new BadRequestException({
        message: 'One or more skills not found',
        code: 'SKILL_NOT_FOUND',
      });
    }

    return {
      companyId: ownerCompanyId,
      professionId,
      topicId,
      level: input.level,
      difficulty: input.difficulty,
      questionText: input.questionText.trim(),
      shortAnswer: input.shortAnswer.trim(),
      idealAnswer: input.idealAnswer.trim(),
      maxScore: input.maxScore,
      skillIds,
      checkpoints: input.checkpoints,
      answerExamples: input.answerExamples,
    };
  }

  private async mapQuestionWithLookups(
    question: Awaited<ReturnType<QuestionBankRepository['findVisibleById']>>,
  ): Promise<QuestionType> {
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const [profession, topic, skills] = await Promise.all([
      this.repository.findProfessionById(question.professionId),
      this.repository.findTopicById(question.topicId),
      this.repository.findSkillsByIds(question.skillIds),
    ]);

    if (!profession || !topic) {
      throw new NotFoundException('Question lookup data not found');
    }

    return mapQuestionToGraphql(question, profession, topic, skills);
  }
}
