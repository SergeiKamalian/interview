import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../../common/database/database.service';
import type {
  CompanyQuestionPlaybookEntity,
  CompanyQuestionPlaybookItemEntity,
} from './entities/company-question-playbook.entity';
import type { QuestionLevel } from './types/question-level.enum';

type DbQueryParam = string | number | boolean | null | Date;

type PlaybookRow = RowDataPacket & {
  id: number;
  company_id: number;
  name: string;
  profession_id: number;
  level: QuestionLevel;
  skill_ids: string | null;
  is_active: 0 | 1;
  created_at: Date;
  updated_at: Date;
};

type PlaybookItemRow = RowDataPacket & {
  id: number;
  playbook_id: number;
  question_id: number;
  sort_order: number;
  is_pinned: 0 | 1;
};

export type PlaybookUpsertData = {
  companyId: number;
  name: string;
  professionId: number;
  level: QuestionLevel;
  skillIds: number[] | null;
};

export type PlaybookItemUpsertData = {
  questionId: number;
  sortOrder: number;
  isPinned: boolean;
};

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

function parseSkillIds(raw: string | null): number[] | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed
      .map((value) => Number(value))
      .filter((id) => Number.isInteger(id) && id > 0);
  } catch {
    return null;
  }
}

function mapPlaybookRow(row: PlaybookRow): CompanyQuestionPlaybookEntity {
  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    name: row.name,
    professionId: Number(row.profession_id),
    level: row.level,
    skillIds: parseSkillIds(row.skill_ids),
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPlaybookItemRow(
  row: PlaybookItemRow,
): CompanyQuestionPlaybookItemEntity {
  return {
    id: Number(row.id),
    playbookId: Number(row.playbook_id),
    questionId: Number(row.question_id),
    sortOrder: Number(row.sort_order),
    isPinned: row.is_pinned === 1,
  };
}

@Injectable()
export class CompanyQuestionPlaybookRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByCompany(
    companyId: number,
    activeOnly = true,
  ): Promise<CompanyQuestionPlaybookEntity[]> {
    const clauses = ['company_id = ?'];
    const params: DbQueryParam[] = [companyId];
    if (activeOnly) {
      clauses.push('is_active = 1');
    }

    const rows = await this.database.query<PlaybookRow[]>(
      `SELECT id, company_id, name, profession_id, level, skill_ids, is_active,
              created_at, updated_at
       FROM company_question_playbooks
       WHERE ${clauses.join(' AND ')}
       ORDER BY updated_at DESC, id DESC`,
      params,
    );

    return rows.map(mapPlaybookRow);
  }

  async findByIdForCompany(
    companyId: number,
    playbookId: number,
    query?: QueryFn,
  ): Promise<CompanyQuestionPlaybookEntity | null> {
    const run = query ?? this.database.query.bind(this.database);
    const rows = await run<PlaybookRow[]>(
      `SELECT id, company_id, name, profession_id, level, skill_ids, is_active,
              created_at, updated_at
       FROM company_question_playbooks
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [playbookId, companyId],
    );

    return rows[0] ? mapPlaybookRow(rows[0]) : null;
  }

  async findItemsByPlaybookId(
    playbookId: number,
  ): Promise<CompanyQuestionPlaybookItemEntity[]> {
    const rows = await this.database.query<PlaybookItemRow[]>(
      `SELECT id, playbook_id, question_id, sort_order, is_pinned
       FROM company_question_playbook_items
       WHERE playbook_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [playbookId],
    );

    return rows.map(mapPlaybookItemRow);
  }

  async create(
    data: PlaybookUpsertData,
    items: PlaybookItemUpsertData[],
    query?: QueryFn,
  ): Promise<CompanyQuestionPlaybookEntity> {
    const run = query ?? this.database.query.bind(this.database);
    const skillIdsJson =
      data.skillIds && data.skillIds.length > 0
        ? JSON.stringify(data.skillIds)
        : null;

    const header = await run<ResultSetHeader>(
      `INSERT INTO company_question_playbooks
         (company_id, name, profession_id, level, skill_ids)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.companyId,
        data.name,
        data.professionId,
        data.level,
        skillIdsJson,
      ],
    );

    const playbookId = Number(header.insertId);
    await this.replaceItems(playbookId, items, run);

    const created = await this.findByIdForCompany(
      data.companyId,
      playbookId,
      run,
    );
    if (!created) {
      throw new Error('Failed to reload created playbook');
    }
    return created;
  }

  async update(
    companyId: number,
    playbookId: number,
    data: Partial<PlaybookUpsertData>,
    items: PlaybookItemUpsertData[] | undefined,
    query?: QueryFn,
  ): Promise<CompanyQuestionPlaybookEntity> {
    const run = query ?? this.database.query.bind(this.database);
    const sets: string[] = [];
    const params: DbQueryParam[] = [];

    if (data.name !== undefined) {
      sets.push('name = ?');
      params.push(data.name);
    }
    if (data.professionId !== undefined) {
      sets.push('profession_id = ?');
      params.push(data.professionId);
    }
    if (data.level !== undefined) {
      sets.push('level = ?');
      params.push(data.level);
    }
    if (data.skillIds !== undefined) {
      sets.push('skill_ids = ?');
      params.push(
        data.skillIds && data.skillIds.length > 0
          ? JSON.stringify(data.skillIds)
          : null,
      );
    }

    if (sets.length > 0) {
      await run<ResultSetHeader>(
        `UPDATE company_question_playbooks
         SET ${sets.join(', ')}
         WHERE id = ? AND company_id = ?`,
        [...params, playbookId, companyId],
      );
    }

    if (items !== undefined) {
      await this.replaceItems(playbookId, items, run);
    }

    const updated = await this.findByIdForCompany(
      companyId,
      playbookId,
      run,
    );
    if (!updated) {
      throw new Error('Failed to reload updated playbook');
    }
    return updated;
  }

  async archive(companyId: number, playbookId: number): Promise<void> {
    await this.database.query<ResultSetHeader>(
      `UPDATE company_question_playbooks
       SET is_active = 0
       WHERE id = ? AND company_id = ?`,
      [playbookId, companyId],
    );
  }

  private async replaceItems(
    playbookId: number,
    items: PlaybookItemUpsertData[],
    run: QueryFn,
  ): Promise<void> {
    await run<ResultSetHeader>(
      `DELETE FROM company_question_playbook_items WHERE playbook_id = ?`,
      [playbookId],
    );

    for (const item of items) {
      await run<ResultSetHeader>(
        `INSERT INTO company_question_playbook_items
           (playbook_id, question_id, sort_order, is_pinned)
         VALUES (?, ?, ?, ?)`,
        [
          playbookId,
          item.questionId,
          item.sortOrder,
          item.isPinned ? 1 : 0,
        ],
      );
    }
  }
}
