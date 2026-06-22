import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '../../common/redis/redis.service';
import { DatabaseService } from '../../common/database/database.service';
import type { CommitCompanyQuestionImportInput } from './dto/commit-company-import.input';
import { QuestionBankRepository, type QuestionUpsertData } from './question-bank.repository';
import type {
  CompanyImportBundle,
  CompanyImportCacheEntry,
  CompanyImportCommitResult,
  CompanyImportPreviewDiff,
} from './types/company-import-internal.type';
import type {
  CompanyQuestionImportCommitPayload,
  CompanyQuestionImportPreviewPayload,
} from './types/company-question-import.type';
import type { QuestionStatus } from './types/question-status.enum';
import { AnswerExampleTypeEnum } from './types/question-answer-example.type';
import { parseCompanyImportFile } from './utils/parse-company-import-file';

const IMPORT_TOKEN_TTL_SECONDS = 15 * 60;
const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class CompanyQuestionImportService {
  constructor(
    private readonly repository: QuestionBankRepository,
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  async previewFromBuffer(
    companyId: number,
    buffer: Buffer,
    filename: string,
  ): Promise<CompanyQuestionImportPreviewPayload> {
    if (buffer.length > MAX_IMPORT_FILE_BYTES) {
      return {
        toCreate: emptyCreateDiff(),
        toUpdate: emptyUpdateDiff(),
        errors: [
          {
            row: 0,
            field: 'file',
            message: `Import file exceeds ${MAX_IMPORT_FILE_BYTES / (1024 * 1024)} MB limit`,
          },
        ],
        warnings: [],
        importToken: null,
      };
    }

    const parsed = parseCompanyImportFile(buffer, filename);
    if (!parsed.bundle || parsed.errors.length > 0) {
      return {
        toCreate: emptyCreateDiff(),
        toUpdate: emptyUpdateDiff(),
        errors: parsed.errors,
        warnings: parsed.warnings,
        importToken: null,
      };
    }

    const professionErrors = await this.validateProfessions(parsed.bundle);
    if (professionErrors.length > 0) {
      return {
        toCreate: emptyCreateDiff(),
        toUpdate: emptyUpdateDiff(),
        errors: professionErrors,
        warnings: parsed.warnings,
        importToken: null,
      };
    }

    const diff = await this.buildPreviewDiff(companyId, parsed.bundle);
    const importToken = randomUUID();
    const cacheEntry: CompanyImportCacheEntry = {
      companyId,
      bundle: parsed.bundle,
      diff,
      defaultStatus: 'draft',
    };

    await this.redis.setJson(
      this.cacheKey(companyId, importToken),
      cacheEntry,
      IMPORT_TOKEN_TTL_SECONDS,
    );

    return {
      toCreate: diff.toCreate,
      toUpdate: diff.toUpdate,
      errors: [],
      warnings: parsed.warnings,
      importToken,
    };
  }

  async commit(
    companyId: number,
    input: CommitCompanyQuestionImportInput,
  ): Promise<CompanyQuestionImportCommitPayload> {
    const cacheKey = this.cacheKey(companyId, input.importToken);
    const cached = await this.redis.getJson<CompanyImportCacheEntry>(cacheKey);

    if (!cached || cached.companyId !== companyId) {
      throw new NotFoundException({
        message: 'Import token expired or not found',
        code: 'IMPORT_TOKEN_NOT_FOUND',
      });
    }

    const status: QuestionStatus = input.status ?? cached.defaultStatus;
    if (status !== 'draft' && status !== 'published') {
      throw new BadRequestException({
        message: 'Import status must be draft or published',
        code: 'INVALID_IMPORT_STATUS',
      });
    }

    const result = await this.database.withTransaction((query) =>
      this.commitBundle(companyId, cached.bundle, status, query),
    );

    await this.redis.del(cacheKey);

    return result;
  }

  private async validateProfessions(bundle: CompanyImportBundle) {
    const errors: Array<{ row: number; field: string; message: string }> = [];
    const seen = new Set<string>();

    for (const question of bundle.questions) {
      const code = question.professionCode;
      if (seen.has(code)) {
        continue;
      }
      seen.add(code);

      const profession = await this.repository.findProfessionByCode(code);
      if (!profession) {
        errors.push({
          row: 0,
          field: 'profession_code',
          message: `Unknown profession_code: ${code}`,
        });
      }
    }

    return errors;
  }

  private async buildPreviewDiff(
    companyId: number,
    bundle: CompanyImportBundle,
  ): Promise<CompanyImportPreviewDiff> {
    const toCreate: CompanyImportPreviewDiff['toCreate'] = {
      topics: [],
      skills: [],
      questions: [],
      checkpoints: 0,
    };
    const toUpdate: CompanyImportPreviewDiff['toUpdate'] = {
      topics: [],
      questions: [],
    };

    const pendingSkills = new Set<string>();

    for (const topic of bundle.topics) {
      const skill = await this.repository.findSkillByCode(companyId, topic.skillCode);
      if (!skill) {
        pendingSkills.add(topic.skillCode);
      }

      const existingTopic = await this.repository.findOwnedTopicByCode(
        companyId,
        topic.code,
      );

      if (existingTopic) {
        toUpdate.topics.push({
          code: topic.code,
          name: topic.name,
        });
      } else {
        toCreate.topics.push({
          code: topic.code,
          name: topic.name,
        });
      }
    }

    for (const skillCode of pendingSkills) {
      toCreate.skills.push({
        code: skillCode,
        name: skillCode,
      });
    }

    for (const question of bundle.questions) {
      toCreate.checkpoints += question.checkpoints.length;

      const ownedTopic = await this.repository.findOwnedTopicByCode(
        companyId,
        question.topicCode,
      );

      if (ownedTopic) {
        const existingQuestion =
          await this.repository.findOwnedQuestionByTopicAndText(
            companyId,
            ownedTopic.id,
            question.question.questionText,
          );

        if (existingQuestion) {
          toUpdate.questions.push({
            importKey: question.importKey,
            topicCode: question.topicCode,
            questionText: question.question.questionText,
            checkpointCount: question.checkpoints.length,
          });
          continue;
        }
      }

      toCreate.questions.push({
        importKey: question.importKey,
        topicCode: question.topicCode,
        questionText: question.question.questionText,
        checkpointCount: question.checkpoints.length,
      });
    }

    return { toCreate, toUpdate };
  }

  private async commitBundle(
    companyId: number,
    bundle: CompanyImportBundle,
    status: QuestionStatus,
    query: Parameters<Parameters<DatabaseService['withTransaction']>[0]>[0],
  ): Promise<CompanyImportCommitResult> {
    const result: CompanyImportCommitResult = {
      topicsCreated: 0,
      topicsUpdated: 0,
      skillsCreated: 0,
      questionsCreated: 0,
      questionsUpdated: 0,
    };

    const skillIdByCode = new Map<string, number>();
    const topicIdByCode = new Map<string, number>();

    for (const topicMeta of bundle.topics) {
      let skill = await this.repository.findSkillByCode(companyId, topicMeta.skillCode);
      if (!skill) {
        skill = await this.repository.createCompanySkill({
          companyId,
          code: topicMeta.skillCode,
          name: topicMeta.skillCode,
        });
        result.skillsCreated += 1;
      }
      skillIdByCode.set(topicMeta.skillCode, skill.id);

      const existingTopic = await this.repository.findOwnedTopicByCode(
        companyId,
        topicMeta.code,
      );

      if (existingTopic) {
        await this.repository.updateCompanyTopic(companyId, existingTopic.id, {
          name: topicMeta.name,
          skillId: skill.id,
          interviewWeight: topicMeta.interviewWeight,
        });
        topicIdByCode.set(topicMeta.code, existingTopic.id);
        result.topicsUpdated += 1;
      } else {
        const createdTopic = await this.repository.createCompanyTopic({
          companyId,
          code: topicMeta.code,
          name: topicMeta.name,
          skillId: skill.id,
          interviewWeight: topicMeta.interviewWeight,
        });
        topicIdByCode.set(topicMeta.code, createdTopic.id);
        result.topicsCreated += 1;
      }
    }

    for (const questionBundle of bundle.questions) {
      const topicId = topicIdByCode.get(questionBundle.topicCode);
      if (!topicId) {
        throw new BadRequestException({
          message: `Topic not resolved for import: ${questionBundle.topicCode}`,
          code: 'IMPORT_TOPIC_NOT_RESOLVED',
        });
      }

      const profession = await this.repository.findProfessionByCode(
        questionBundle.professionCode,
      );
      if (!profession) {
        throw new BadRequestException({
          message: `Profession not found: ${questionBundle.professionCode}`,
          code: 'PROFESSION_NOT_FOUND',
        });
      }

      const skillId = skillIdByCode.get(questionBundle.topic.skillCode);
      if (!skillId) {
        throw new BadRequestException({
          message: `Skill not resolved: ${questionBundle.topic.skillCode}`,
          code: 'IMPORT_SKILL_NOT_RESOLVED',
        });
      }

      const upsertData: QuestionUpsertData = {
        companyId,
        sourceQuestionId: null,
        status,
        companyPriority: 0,
        isRequired: false,
        professionId: profession.id,
        topicId,
        level: questionBundle.question.level,
        difficulty: questionBundle.question.difficulty,
        questionText: questionBundle.question.questionText,
        shortAnswer: questionBundle.question.shortAnswer,
        idealAnswer: questionBundle.question.idealAnswer,
        maxScore: questionBundle.question.maxScore,
        skillIds: [skillId],
        checkpoints: questionBundle.checkpoints.map((checkpoint) => ({
          checkpointKey: checkpoint.key,
          title: checkpoint.title,
          expected: checkpoint.expected,
          score: checkpoint.score,
          sortOrder: checkpoint.sortOrder,
          evaluationHints: checkpoint.evaluationHints ?? undefined,
        })),
        answerExamples: questionBundle.examples.map((example) => ({
          exampleType:
            example.exampleType === 'good'
              ? AnswerExampleTypeEnum.good
              : AnswerExampleTypeEnum.bad,
          exampleText: example.exampleText,
          sortOrder: example.sortOrder,
          checkpointKey: example.checkpointKey ?? undefined,
        })),
      };

      const existingQuestion =
        await this.repository.findOwnedQuestionByTopicAndText(
          companyId,
          topicId,
          questionBundle.question.questionText,
        );

      if (existingQuestion) {
        await this.repository.update(existingQuestion.id, upsertData, query);
        result.questionsUpdated += 1;
      } else {
        await this.repository.create(upsertData, query);
        result.questionsCreated += 1;
      }
    }

    return result;
  }

  private cacheKey(companyId: number, token: string): string {
    return `company-import:${companyId}:${token}`;
  }
}

function emptyCreateDiff(): CompanyImportPreviewDiff['toCreate'] {
  return {
    topics: [],
    skills: [],
    questions: [],
    checkpoints: 0,
  };
}

function emptyUpdateDiff(): CompanyImportPreviewDiff['toUpdate'] {
  return {
    topics: [],
    questions: [],
  };
}
