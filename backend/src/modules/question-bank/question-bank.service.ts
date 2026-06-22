import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { CompanyQuestionOverrideRepository } from './company-question-override.repository';
import type { CreateQuestionInput } from './dto/create-question.input';
import type { CreateCompanySkillInput } from './dto/create-company-skill.input';
import type { CreateCompanyTopicInput } from './dto/create-company-topic.input';
import type { QuestionBankFilterInput } from './dto/question-filter.input';
import type { UpdateQuestionInput } from './dto/update-question.input';
import type { UpdateCompanySkillInput } from './dto/update-company-skill.input';
import type { UpdateCompanyTopicInput } from './dto/update-company-topic.input';
import type { UpsertCompanyQuestionOverrideInput } from './dto/upsert-company-question-override.input';
import {
  mapCompanyQuestionOverrideToGraphql,
  mapProfessionToGraphql,
  mapQuestionToGraphql,
  mapSkillToGraphql,
  mapTopicToGraphql,
} from './question-bank.mapper';
import {
  QuestionBankRepository,
  type QuestionUpsertData,
} from './question-bank.repository';
import type { ProfessionType } from './types/profession.type';
import type {
  QuestionBankListPayload,
  QuestionType,
} from './types/question.type';
import type { CompanyQuestionOverrideType } from './types/company-question-override.type';
import type { SkillType } from './types/skill.type';
import type { TopicType } from './types/topic.type';
import { validateQuestionInput, validateCompanyQuestionMetadata } from './validation/question-bank.validator';
import {
  isDuplicateKeyError,
  validateInterviewWeight,
  validateTaxonomyCode,
} from './validation/taxonomy.validator';

@Injectable()
export class QuestionBankService {
  constructor(
    private readonly repository: QuestionBankRepository,
    private readonly overrideRepository: CompanyQuestionOverrideRepository,
    private readonly database: DatabaseService,
  ) {}

  async list(
    companyId: number,
    filters: QuestionBankFilterInput,
  ): Promise<QuestionBankListPayload> {
    const result = await this.repository.list(companyId, filters);
    const items = await Promise.all(
      result.items.map((question) =>
        this.mapQuestionWithLookups(companyId, question),
      ),
    );

    return {
      items,
      total: result.total,
    };
  }

  async listProfessions(): Promise<ProfessionType[]> {
    const professions = await this.repository.findProfessions();
    return professions.map(mapProfessionToGraphql);
  }

  async listSkills(
    companyId: number,
    professionIdRaw?: string,
  ): Promise<SkillType[]> {
    const professionId = this.parseOptionalId(professionIdRaw);
    const skills = await this.repository.findSkillsByProfession(
      companyId,
      professionId,
    );
    return skills.map(mapSkillToGraphql);
  }

  async listTopics(
    companyId: number,
    skillIdRaw?: string,
    professionIdRaw?: string,
  ): Promise<TopicType[]> {
    const skillId = this.parseOptionalId(skillIdRaw);
    const professionId = this.parseOptionalId(professionIdRaw);
    const topics = await this.repository.findTopics(
      companyId,
      skillId,
      professionId,
    );
    return topics.map(mapTopicToGraphql);
  }

  private parseOptionalId(raw?: string): number | undefined {
    if (raw === undefined || raw === null || raw.trim() === '') {
      return undefined;
    }

    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException({
        message: 'Invalid lookup id',
        code: 'INVALID_LOOKUP_ID',
      });
    }

    return parsed;
  }

  async getById(companyId: number, questionId: number): Promise<QuestionType> {
    const question = await this.repository.findVisibleById(
      companyId,
      questionId,
    );

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.mapQuestionWithLookups(companyId, question);
  }

  async create(
    companyId: number,
    input: CreateQuestionInput,
  ): Promise<QuestionType> {
    validateQuestionInput(input);
    validateCompanyQuestionMetadata(input, { isCompanyOwned: true });
    const data = await this.prepareUpsertData(companyId, input, companyId);

    const created = await this.database.withTransaction((query) =>
      this.repository.create(data, query),
    );

    return this.mapQuestionWithLookups(companyId, created);
  }

  async update(
    companyId: number,
    input: UpdateQuestionInput,
  ): Promise<QuestionType> {
    validateQuestionInput(input);
    validateCompanyQuestionMetadata(input, { isCompanyOwned: true });

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

    return this.mapQuestionWithLookups(companyId, updated);
  }

  async getCompanyQuestionOverride(
    companyId: number,
    sourceQuestionIdRaw: string,
  ): Promise<CompanyQuestionOverrideType | null> {
    const sourceQuestionId = this.parseSourceQuestionId(sourceQuestionIdRaw);
    const override = await this.overrideRepository.findByCompanyAndSourceQuestionId(
      companyId,
      sourceQuestionId,
    );

    return override ? mapCompanyQuestionOverrideToGraphql(override) : null;
  }

  async upsertCompanyQuestionOverride(
    companyId: number,
    input: UpsertCompanyQuestionOverrideInput,
  ): Promise<CompanyQuestionOverrideType> {
    const sourceQuestionId = this.parseSourceQuestionId(input.sourceQuestionId);
    await this.assertGlobalSourceQuestion(sourceQuestionId);

    if (input.topicWeightOverride !== undefined) {
      validateInterviewWeight(input.topicWeightOverride);
    }

    const extraMustConcepts = this.normalizeStringList(input.extraMustConcepts);
    const extraFalseClaims = this.normalizeStringList(input.extraFalseClaims);
    const extraAnswerExamples = input.extraAnswerExamples?.length
      ? input.extraAnswerExamples.map((example) => ({
          exampleType: example.exampleType,
          exampleText: example.exampleText.trim(),
          sortOrder: example.sortOrder,
          checkpointKey: example.checkpointKey?.trim() ?? null,
        }))
      : null;

    const override = await this.overrideRepository.upsert(companyId, {
      sourceQuestionId,
      extraMustConcepts,
      extraFalseClaims,
      extraAnswerExamples,
      topicWeightOverride: input.topicWeightOverride ?? null,
    });

    return mapCompanyQuestionOverrideToGraphql(override);
  }

  async deleteCompanyQuestionOverride(
    companyId: number,
    sourceQuestionIdRaw: string,
  ): Promise<boolean> {
    const sourceQuestionId = this.parseSourceQuestionId(sourceQuestionIdRaw);
    const deleted = await this.overrideRepository.delete(
      companyId,
      sourceQuestionId,
    );

    if (!deleted) {
      throw new NotFoundException('Question override not found');
    }

    return true;
  }

  async forkQuestion(
    companyId: number,
    sourceQuestionIdRaw: string,
  ): Promise<QuestionType> {
    const sourceQuestionId = Number(sourceQuestionIdRaw);
    if (!Number.isInteger(sourceQuestionId) || sourceQuestionId <= 0) {
      throw new BadRequestException({
        message: 'Invalid source question id',
        code: 'INVALID_SOURCE_QUESTION_ID',
      });
    }

    const source = await this.repository.findGlobalQuestionById(sourceQuestionId);
    if (!source) {
      throw new NotFoundException('Global question not found');
    }

    const forked = await this.database.withTransaction((query) =>
      this.repository.forkQuestion(companyId, sourceQuestionId, query),
    );

    return this.mapQuestionWithLookups(companyId, forked);
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

    const snapshot = await this.mapQuestionWithLookups(companyId, existing);
    const archived = await this.repository.archive(companyId, questionId);

    if (!archived) {
      throw new NotFoundException('Question not found');
    }

    return {
      ...snapshot,
      isActive: false,
    };
  }

  async createCompanySkill(
    companyId: number,
    input: CreateCompanySkillInput,
  ): Promise<SkillType> {
    const code = input.code.trim();
    const name = input.name.trim();
    validateTaxonomyCode(code);

    try {
      const skill = await this.repository.createCompanySkill({
        companyId,
        code,
        name,
      });
      return mapSkillToGraphql(skill);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new BadRequestException({
          message: `Skill code already exists: ${code}`,
          code: 'DUPLICATE_SKILL_CODE',
        });
      }
      throw error;
    }
  }

  async updateCompanySkill(
    companyId: number,
    input: UpdateCompanySkillInput,
  ): Promise<SkillType> {
    const skillId = Number(input.id);
    await this.assertCompanyOwnedSkill(companyId, skillId);

    const updates: { code?: string; name?: string } = {};
    if (input.code !== undefined) {
      const code = input.code.trim();
      validateTaxonomyCode(code);
      updates.code = code;
    }
    if (input.name !== undefined) {
      updates.name = input.name.trim();
    }

    try {
      const skill = await this.repository.updateCompanySkill(
        companyId,
        skillId,
        updates,
      );

      if (!skill) {
        throw new NotFoundException('Skill not found');
      }

      return mapSkillToGraphql(skill);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new BadRequestException({
          message: `Skill code already exists: ${input.code}`,
          code: 'DUPLICATE_SKILL_CODE',
        });
      }
      throw error;
    }
  }

  async archiveCompanySkill(
    companyId: number,
    skillIdRaw: string,
  ): Promise<SkillType> {
    const skillId = Number(skillIdRaw);
    const existing = await this.repository.findOwnedSkillById(
      companyId,
      skillId,
    );

    if (!existing) {
      const row = await this.repository.findSkillRowById(skillId);
      if (row?.companyId === null) {
        throw new ForbiddenException('Global skills cannot be modified');
      }
      throw new NotFoundException('Skill not found');
    }

    const snapshot = mapSkillToGraphql(existing);
    const archived = await this.repository.archiveCompanySkill(
      companyId,
      skillId,
    );

    if (!archived) {
      throw new NotFoundException('Skill not found');
    }

    return snapshot;
  }

  async createCompanyTopic(
    companyId: number,
    input: CreateCompanyTopicInput,
  ): Promise<TopicType> {
    const code = input.code.trim();
    const name = input.name.trim();
    const skillId = Number(input.skillId);
    const interviewWeight = input.interviewWeight ?? 5;

    validateTaxonomyCode(code);
    validateInterviewWeight(interviewWeight);

    const skill = await this.repository.findSkillVisibleToCompany(
      companyId,
      skillId,
    );
    if (!skill) {
      throw new BadRequestException({
        message: 'Skill not found',
        code: 'SKILL_NOT_FOUND',
      });
    }

    try {
      const topic = await this.repository.createCompanyTopic({
        companyId,
        code,
        name,
        skillId,
        interviewWeight,
      });
      return mapTopicToGraphql(topic);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new BadRequestException({
          message: `Topic code already exists: ${code}`,
          code: 'DUPLICATE_TOPIC_CODE',
        });
      }
      throw error;
    }
  }

  async updateCompanyTopic(
    companyId: number,
    input: UpdateCompanyTopicInput,
  ): Promise<TopicType> {
    const topicId = Number(input.id);
    await this.assertCompanyOwnedTopic(companyId, topicId);

    const updates: {
      code?: string;
      name?: string;
      skillId?: number;
      interviewWeight?: number;
    } = {};

    if (input.code !== undefined) {
      const code = input.code.trim();
      validateTaxonomyCode(code);
      updates.code = code;
    }
    if (input.name !== undefined) {
      updates.name = input.name.trim();
    }
    if (input.skillId !== undefined) {
      const skillId = Number(input.skillId);
      const skill = await this.repository.findSkillVisibleToCompany(
        companyId,
        skillId,
      );
      if (!skill) {
        throw new BadRequestException({
          message: 'Skill not found',
          code: 'SKILL_NOT_FOUND',
        });
      }
      updates.skillId = skillId;
    }
    if (input.interviewWeight !== undefined) {
      validateInterviewWeight(input.interviewWeight);
      updates.interviewWeight = input.interviewWeight;
    }

    try {
      const topic = await this.repository.updateCompanyTopic(
        companyId,
        topicId,
        updates,
      );

      if (!topic) {
        throw new NotFoundException('Topic not found');
      }

      return mapTopicToGraphql(topic);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new BadRequestException({
          message: `Topic code already exists: ${input.code}`,
          code: 'DUPLICATE_TOPIC_CODE',
        });
      }
      throw error;
    }
  }

  async archiveCompanyTopic(
    companyId: number,
    topicIdRaw: string,
  ): Promise<TopicType> {
    const topicId = Number(topicIdRaw);
    const existing = await this.repository.findOwnedTopicById(
      companyId,
      topicId,
    );

    if (!existing) {
      const row = await this.repository.findTopicRowById(topicId);
      if (row?.companyId === null) {
        throw new ForbiddenException('Global topics cannot be modified');
      }
      throw new NotFoundException('Topic not found');
    }

    const snapshot = mapTopicToGraphql(existing);
    const archived = await this.repository.archiveCompanyTopic(
      companyId,
      topicId,
    );

    if (!archived) {
      throw new NotFoundException('Topic not found');
    }

    return snapshot;
  }

  private parseSourceQuestionId(raw: string): number {
    const sourceQuestionId = Number(raw);
    if (!Number.isInteger(sourceQuestionId) || sourceQuestionId <= 0) {
      throw new BadRequestException({
        message: 'Invalid source question id',
        code: 'INVALID_SOURCE_QUESTION_ID',
      });
    }

    return sourceQuestionId;
  }

  private normalizeStringList(values?: string[]): string[] | null {
    if (!values || values.length === 0) {
      return null;
    }

    const normalized = values
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    return normalized.length > 0 ? normalized : null;
  }

  private async assertGlobalSourceQuestion(
    sourceQuestionId: number,
  ): Promise<void> {
    const source = await this.repository.findGlobalQuestionById(sourceQuestionId);
    if (!source) {
      throw new NotFoundException('Global question not found');
    }
  }

  private async assertCompanyOwnedSkill(
    companyId: number,
    skillId: number,
  ): Promise<void> {
    const owned = await this.repository.findOwnedSkillById(companyId, skillId);
    if (owned) {
      return;
    }

    const row = await this.repository.findSkillRowById(skillId);
    if (row?.companyId === null) {
      throw new ForbiddenException('Global skills cannot be modified');
    }

    throw new NotFoundException('Skill not found');
  }

  private async assertCompanyOwnedTopic(
    companyId: number,
    topicId: number,
  ): Promise<void> {
    const owned = await this.repository.findOwnedTopicById(companyId, topicId);
    if (owned) {
      return;
    }

    const row = await this.repository.findTopicRowById(topicId);
    if (row?.companyId === null) {
      throw new ForbiddenException('Global topics cannot be modified');
    }

    throw new NotFoundException('Topic not found');
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
      this.repository.findTopicById(companyId, topicId),
      this.repository.findSkillsByIds(companyId, skillIds),
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
      sourceQuestionId: null,
      status: input.status,
      companyPriority: input.companyPriority,
      isRequired: input.isRequired,
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
    companyId: number,
    question: Awaited<ReturnType<QuestionBankRepository['findVisibleById']>>,
  ): Promise<QuestionType> {
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const [profession, topic, skills] = await Promise.all([
      this.repository.findProfessionById(question.professionId),
      this.repository.findTopicById(companyId, question.topicId),
      this.repository.findSkillsByIds(companyId, question.skillIds),
    ]);

    if (!profession || !topic) {
      throw new NotFoundException('Question lookup data not found');
    }

    return mapQuestionToGraphql(question, profession, topic, skills);
  }
}
