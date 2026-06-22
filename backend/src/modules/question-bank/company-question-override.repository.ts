import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type { DbQueryParam } from '../../common/database/database.types';
import type {
  CompanyQuestionOverrideEntity,
  OverrideAnswerExampleEntity,
} from './entities/company-question-override.entity';
import type { AnswerExampleType } from './types/answer-example-type.enum';

interface OverrideRow extends RowDataPacket {
  id: number;
  company_id: number;
  source_question_id: number;
  extra_must_concepts: unknown;
  extra_false_claims: unknown;
  extra_answer_examples: unknown;
  topic_weight_override: string | null;
  created_at: Date;
  updated_at: Date;
}

export type CompanyQuestionOverrideUpsertData = {
  sourceQuestionId: number;
  extraMustConcepts: string[] | null;
  extraFalseClaims: string[] | null;
  extraAnswerExamples: OverrideAnswerExampleEntity[] | null;
  topicWeightOverride: number | null;
};

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

@Injectable()
export class CompanyQuestionOverrideRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByCompanyAndSourceQuestionId(
    companyId: number,
    sourceQuestionId: number,
  ): Promise<CompanyQuestionOverrideEntity | null> {
    const rows = await this.database.query<OverrideRow[]>(
      `SELECT id, company_id, source_question_id,
              extra_must_concepts, extra_false_claims, extra_answer_examples,
              topic_weight_override, created_at, updated_at
       FROM company_question_overrides
       WHERE company_id = ? AND source_question_id = ?
       LIMIT 1`,
      [companyId, sourceQuestionId],
    );

    const row = rows[0];
    return row ? this.mapOverride(row) : null;
  }

  async findBySourceQuestionIds(
    companyId: number,
    sourceQuestionIds: number[],
  ): Promise<Map<number, CompanyQuestionOverrideEntity>> {
    if (sourceQuestionIds.length === 0) {
      return new Map();
    }

    const placeholders = sourceQuestionIds.map(() => '?').join(', ');
    const rows = await this.database.query<OverrideRow[]>(
      `SELECT id, company_id, source_question_id,
              extra_must_concepts, extra_false_claims, extra_answer_examples,
              topic_weight_override, created_at, updated_at
       FROM company_question_overrides
       WHERE company_id = ? AND source_question_id IN (${placeholders})`,
      [companyId, ...sourceQuestionIds],
    );

    const result = new Map<number, CompanyQuestionOverrideEntity>();
    for (const row of rows) {
      result.set(row.source_question_id, this.mapOverride(row));
    }
    return result;
  }

  async upsert(
    companyId: number,
    data: CompanyQuestionOverrideUpsertData,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<CompanyQuestionOverrideEntity> {
    await query<ResultSetHeader>(
      `INSERT INTO company_question_overrides (
         company_id, source_question_id,
         extra_must_concepts, extra_false_claims, extra_answer_examples,
         topic_weight_override
       ) VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         extra_must_concepts = VALUES(extra_must_concepts),
         extra_false_claims = VALUES(extra_false_claims),
         extra_answer_examples = VALUES(extra_answer_examples),
         topic_weight_override = VALUES(topic_weight_override),
         updated_at = CURRENT_TIMESTAMP`,
      [
        companyId,
        data.sourceQuestionId,
        data.extraMustConcepts
          ? JSON.stringify(data.extraMustConcepts)
          : null,
        data.extraFalseClaims
          ? JSON.stringify(data.extraFalseClaims)
          : null,
        data.extraAnswerExamples
          ? JSON.stringify(data.extraAnswerExamples)
          : null,
        data.topicWeightOverride,
      ],
    );

    const override = await this.findByCompanyAndSourceQuestionId(
      companyId,
      data.sourceQuestionId,
    );

    if (!override) {
      throw new Error('Failed to load override after upsert');
    }

    return override;
  }

  async delete(
    companyId: number,
    sourceQuestionId: number,
  ): Promise<boolean> {
    const result = await this.database.query<ResultSetHeader>(
      `DELETE FROM company_question_overrides
       WHERE company_id = ? AND source_question_id = ?`,
      [companyId, sourceQuestionId],
    );

    return result.affectedRows > 0;
  }

  private mapOverride(row: OverrideRow): CompanyQuestionOverrideEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      sourceQuestionId: row.source_question_id,
      extraMustConcepts: parseStringArrayJson(row.extra_must_concepts),
      extraFalseClaims: parseStringArrayJson(row.extra_false_claims),
      extraAnswerExamples: parseExtraAnswerExamplesJson(
        row.extra_answer_examples,
      ),
      topicWeightOverride:
        row.topic_weight_override != null
          ? Number(row.topic_weight_override)
          : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

function parseStringArrayJson(raw: unknown): string[] | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : null;
}

function parseExtraAnswerExamplesJson(
  raw: unknown,
): OverrideAnswerExampleEntity[] | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const examples: OverrideAnswerExampleEntity[] = [];

  for (const item of value) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      continue;
    }

    const record = item as Record<string, unknown>;
    const exampleType = record.exampleType;
    const exampleText =
      typeof record.exampleText === 'string' ? record.exampleText.trim() : '';
    const sortOrder =
      typeof record.sortOrder === 'number' && Number.isInteger(record.sortOrder)
        ? record.sortOrder
        : null;
    const checkpointKey =
      typeof record.checkpointKey === 'string' &&
      record.checkpointKey.trim().length > 0
        ? record.checkpointKey.trim()
        : null;

    if (
      (exampleType !== 'good' && exampleType !== 'bad') ||
      exampleText.length === 0 ||
      sortOrder === null ||
      sortOrder < 0
    ) {
      continue;
    }

    examples.push({
      exampleType: exampleType as AnswerExampleType,
      exampleText,
      sortOrder,
      checkpointKey,
    });
  }

  return examples.length > 0 ? examples : null;
}
