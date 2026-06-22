import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import type { CreateCompanyQuestionPlaybookInput } from './dto/create-company-question-playbook.input';
import type { UpdateCompanyQuestionPlaybookInput } from './dto/update-company-question-playbook.input';
import {
  CompanyQuestionPlaybookRepository,
  type PlaybookItemUpsertData,
} from './company-question-playbook.repository';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionSuggestionService } from './question-suggestion.service';
import type { CompanyQuestionPlaybookItemEntity } from './entities/company-question-playbook.entity';
import type {
  ApplyPlaybookToInterviewDraftPayload,
  CompanyQuestionPlaybookType,
} from './types/company-question-playbook.type';
import type { QuestionLevel } from './types/question-level.enum';
import { QuestionLevelEnum } from './types/question.type';

const DEFAULT_APPLY_COUNT = 10;
const MAX_APPLY_COUNT = 50;

@Injectable()
export class CompanyQuestionPlaybookService {
  constructor(
    private readonly playbookRepository: CompanyQuestionPlaybookRepository,
    private readonly questionBankRepository: QuestionBankRepository,
    private readonly questionSuggestionService: QuestionSuggestionService,
    private readonly database: DatabaseService,
  ) {}

  async list(companyId: number): Promise<CompanyQuestionPlaybookType[]> {
    const playbooks = await this.playbookRepository.findByCompany(companyId);
    return Promise.all(
      playbooks.map((playbook) => this.toGraphql(companyId, playbook.id)),
    );
  }

  async getById(
    companyId: number,
    playbookIdRaw: string,
  ): Promise<CompanyQuestionPlaybookType> {
    const playbookId = this.parseId(playbookIdRaw, 'playbookId');
    const playbook = await this.requirePlaybook(companyId, playbookId);
    return this.toGraphql(companyId, playbook.id);
  }

  async create(
    companyId: number,
    input: CreateCompanyQuestionPlaybookInput,
  ): Promise<CompanyQuestionPlaybookType> {
    const professionId = this.parseId(input.professionId, 'professionId');
    await this.assertProfessionExists(professionId);
    const items = await this.validateAndNormalizeItems(companyId, input.items);

    const created = await this.database.withTransaction((query) =>
      this.playbookRepository.create(
        {
          companyId,
          name: input.name.trim(),
          professionId,
          level: input.level as QuestionLevel,
          skillIds: this.parseSkillIds(input.skillIds),
        },
        items,
        query,
      ),
    );

    return this.toGraphql(companyId, created.id);
  }

  async update(
    companyId: number,
    input: UpdateCompanyQuestionPlaybookInput,
  ): Promise<CompanyQuestionPlaybookType> {
    const playbookId = this.parseId(input.id, 'id');
    await this.requirePlaybook(companyId, playbookId);

    const patch: {
      name?: string;
      professionId?: number;
      level?: QuestionLevel;
      skillIds?: number[] | null;
    } = {};

    if (input.name !== undefined) {
      patch.name = input.name.trim();
    }
    if (input.professionId !== undefined) {
      const professionId = this.parseId(input.professionId, 'professionId');
      await this.assertProfessionExists(professionId);
      patch.professionId = professionId;
    }
    if (input.level !== undefined) {
      patch.level = input.level as QuestionLevel;
    }
    if (input.skillIds !== undefined) {
      patch.skillIds = input.skillIds
        ? this.parseSkillIds(input.skillIds)
        : null;
    }

    const items =
      input.items !== undefined
        ? await this.validateAndNormalizeItems(companyId, input.items)
        : undefined;

    const updated = await this.database.withTransaction((query) =>
      this.playbookRepository.update(
        companyId,
        playbookId,
        patch,
        items,
        query,
      ),
    );

    return this.toGraphql(companyId, updated.id);
  }

  async archive(companyId: number, idRaw: string): Promise<boolean> {
    const playbookId = this.parseId(idRaw, 'id');
    await this.requirePlaybook(companyId, playbookId);
    await this.playbookRepository.archive(companyId, playbookId);
    return true;
  }

  async applyToInterviewDraft(
    companyId: number,
    playbookIdRaw: string,
    countRaw?: number,
  ): Promise<ApplyPlaybookToInterviewDraftPayload> {
    const playbookId = this.parseId(playbookIdRaw, 'playbookId');
    const playbook = await this.requirePlaybook(companyId, playbookId);
    const items = await this.playbookRepository.findItemsByPlaybookId(playbookId);

    if (items.length === 0) {
      throw new BadRequestException({
        message: 'Playbook has no items',
        code: 'PLAYBOOK_EMPTY',
      });
    }

    await this.assertItemsVisible(companyId, items);

    const targetCount = this.resolveApplyCount(countRaw);
    const pinnedIds = items
      .filter((item) => item.isPinned)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => item.questionId);
    const recommendedIds = items
      .filter((item) => !item.isPinned)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => item.questionId);

    const selectedIds: number[] = [];
    const seen = new Set<number>();

    for (const id of [...pinnedIds, ...recommendedIds]) {
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      selectedIds.push(id);
      if (selectedIds.length >= targetCount) {
        break;
      }
    }

    const remainingCount = Math.max(0, targetCount - selectedIds.length);
    if (remainingCount > 0) {
      const suggestion = await this.questionSuggestionService.suggest(
        companyId,
        {
          professionId: String(playbook.professionId),
          level: playbook.level as QuestionLevelEnum,
          skillIds: playbook.skillIds?.map(String),
          count: remainingCount,
          excludeQuestionIds: selectedIds.map(String),
        },
      );

      for (const idRaw of suggestion.questionIds) {
        const id = Number(idRaw);
        if (!Number.isInteger(id) || seen.has(id)) {
          continue;
        }
        seen.add(id);
        selectedIds.push(id);
        if (selectedIds.length >= targetCount) {
          break;
        }
      }
    }

    const pinnedQuestionIds = pinnedIds
      .filter((id) => selectedIds.includes(id))
      .map(String);

    return {
      questionIds: selectedIds.map(String),
      pinnedQuestionIds,
      count: selectedIds.length,
    };
  }

  private async toGraphql(
    companyId: number,
    playbookId: number,
  ): Promise<CompanyQuestionPlaybookType> {
    const playbook = await this.requirePlaybook(companyId, playbookId);
    const items = await this.playbookRepository.findItemsByPlaybookId(playbookId);

    return {
      id: String(playbook.id),
      name: playbook.name,
      professionId: String(playbook.professionId),
      level: playbook.level as QuestionLevelEnum,
      skillIds: playbook.skillIds?.map(String) ?? null,
      isActive: playbook.isActive,
      items: items.map((item) => ({
        questionId: String(item.questionId),
        sortOrder: item.sortOrder,
        isPinned: item.isPinned,
      })),
      itemCount: items.length,
      pinnedCount: items.filter((item) => item.isPinned).length,
    };
  }

  private async requirePlaybook(companyId: number, playbookId: number) {
    const playbook = await this.playbookRepository.findByIdForCompany(
      companyId,
      playbookId,
    );
    if (!playbook || !playbook.isActive) {
      throw new NotFoundException('Playbook not found');
    }
    return playbook;
  }

  private async assertProfessionExists(professionId: number): Promise<void> {
    const profession =
      await this.questionBankRepository.findProfessionById(professionId);
    if (!profession) {
      throw new BadRequestException({
        message: 'Profession not found',
        code: 'PROFESSION_NOT_FOUND',
      });
    }
  }

  private async validateAndNormalizeItems(
    companyId: number,
    items: Array<{
      questionId: string;
      sortOrder: number;
      isPinned: boolean;
    }>,
  ): Promise<PlaybookItemUpsertData[]> {
    if (items.length === 0) {
      throw new BadRequestException({
        message: 'Playbook must contain at least one question',
        code: 'PLAYBOOK_ITEMS_REQUIRED',
      });
    }

    const normalized: PlaybookItemUpsertData[] = [];
    const seen = new Set<number>();

    for (const [index, item] of items.entries()) {
      const questionId = this.parseId(item.questionId, 'questionId');
      if (seen.has(questionId)) {
        throw new BadRequestException({
          message: 'Duplicate question in playbook items',
          code: 'DUPLICATE_PLAYBOOK_QUESTION',
        });
      }
      seen.add(questionId);
      normalized.push({
        questionId,
        sortOrder: item.sortOrder ?? index,
        isPinned: item.isPinned === true,
      });
    }

    await this.assertItemsVisible(
      companyId,
      normalized.map((item, index) => ({
        id: index,
        playbookId: 0,
        questionId: item.questionId,
        sortOrder: item.sortOrder,
        isPinned: item.isPinned,
      })),
    );

    return normalized;
  }

  private async assertItemsVisible(
    companyId: number,
    items: CompanyQuestionPlaybookItemEntity[],
  ): Promise<void> {
    for (const item of items) {
      const question = await this.questionBankRepository.findVisibleById(
        companyId,
        item.questionId,
      );
      if (!question || !question.isActive || question.deletedAt) {
        throw new BadRequestException({
          message: `Question ${item.questionId} is not visible to company`,
          code: 'QUESTION_NOT_VISIBLE',
        });
      }
    }
  }

  private parseSkillIds(raw?: string[]): number[] | null {
    if (!raw || raw.length === 0) {
      return null;
    }
    const ids = raw
      .map((value) => this.parseId(value, 'skillId'))
      .filter((id, index, array) => array.indexOf(id) === index);
    return ids.length > 0 ? ids : null;
  }

  private parseId(raw: string, field: string): number {
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException({
        message: `Invalid ${field}`,
        code: 'INVALID_ID',
      });
    }
    return parsed;
  }

  private resolveApplyCount(countRaw?: number): number {
    if (countRaw === undefined || countRaw === null) {
      return DEFAULT_APPLY_COUNT;
    }
    if (!Number.isInteger(countRaw) || countRaw <= 0 || countRaw > MAX_APPLY_COUNT) {
      throw new BadRequestException({
        message: `count must be between 1 and ${MAX_APPLY_COUNT}`,
        code: 'INVALID_APPLY_COUNT',
      });
    }
    return countRaw;
  }
}
