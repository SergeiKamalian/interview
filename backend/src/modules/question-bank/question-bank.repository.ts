import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type { DbQueryParam } from '../../common/database/database.types';
import { parseCheckpointEvaluationHints } from '../adaptive-interview/types/checkpoint-evaluation-hints.type';
import type { AnswerExampleEntity } from './entities/answer-example.entity';
import type { ProfessionEntity } from './entities/profession.entity';
import type { QuestionCheckpointEntity } from './entities/question-checkpoint.entity';
import type {
  QuestionEntity,
  QuestionWithDetailsEntity,
} from './entities/question.entity';
import type { SkillEntity } from './entities/skill.entity';
import type { TopicEntity } from './entities/topic.entity';
import type { CreateQuestionInput } from './dto/create-question.input';
import type { QuestionBankFilterInput } from './dto/question-filter.input';
import { QUESTION_VISIBILITY_FILTER } from './question-bank.schema';
import type { AnswerExampleType } from './types/answer-example-type.enum';
import type { QuestionDifficulty } from './types/question-difficulty.enum';
import type { QuestionLevel } from './types/question-level.enum';
import type { QuestionStatus } from './types/question-status.enum';

interface QuestionRow extends RowDataPacket {
  id: number;
  company_id: number | null;
  source_question_id: number | null;
  status: QuestionStatus;
  company_priority: number;
  is_required: number;
  profession_id: number;
  topic_id: number;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  question_text: string;
  short_answer: string;
  ideal_answer: string;
  max_score: string;
  is_active: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface LookupRow extends RowDataPacket {
  id: number;
  company_id: number | null;
  code: string;
  name: string;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

interface TopicRow extends LookupRow {
  skill_id: number | null;
  interview_weight: string;
}

interface TopicWithSkillRow extends TopicRow {
  skill_lookup_id: number | null;
  skill_company_id: number | null;
  skill_code: string | null;
  skill_name: string | null;
  skill_is_active: number | null;
  skill_created_at: Date | null;
  skill_updated_at: Date | null;
}

interface CheckpointRow extends RowDataPacket {
  id: number;
  question_id: number;
  checkpoint_key: string;
  title: string;
  expected: string;
  evaluation_hints: unknown;
  score: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

interface ExampleRow extends RowDataPacket {
  id: number;
  question_id: number;
  checkpoint_key: string | null;
  example_type: AnswerExampleType;
  example_text: string;
  sort_order: number;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface SuggestionCandidateRow extends RowDataPacket {
  id: number;
  question_text: string;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  max_score: string;
  company_id: number | null;
  company_priority: number;
  is_required: number;
  topic_id: number;
  topic_name: string;
  interview_weight: string;
  skill_codes: string | null;
}

export type SuggestionCandidateEntity = {
  id: number;
  questionText: string;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  maxScore: number;
  topicId: number;
  topicName: string;
  interviewWeight: number;
  skillCodes: string[];
  isCustom: boolean;
  companyPriority: number;
  isRequired: boolean;
};

type SuggestionCandidateFilterParams = {
  professionId: number;
  level?: QuestionLevel;
  skillIds?: number[];
};

/**
 * When company has a published fork of a global question, hide the global row
 * from selection/list (fork replaces it for that tenant).
 */
export const FORK_REPLACEMENT_EXCLUSION_SQL = `NOT (
  q.company_id IS NULL
  AND EXISTS (
    SELECT 1 FROM questions fq
    WHERE fq.company_id = ?
      AND fq.source_question_id = q.id
      AND fq.status = 'published'
      AND fq.deleted_at IS NULL
      AND fq.is_active = 1
  )
)`;

function appendForkReplacementExclusion(
  clauses: string[],
  queryParams: DbQueryParam[],
  companyId: number,
): void {
  clauses.push(FORK_REPLACEMENT_EXCLUSION_SQL);
  queryParams.push(companyId);
}

function buildSuggestionCandidateFilters(
  companyId: number,
  params: SuggestionCandidateFilterParams,
): { clauses: string[]; queryParams: DbQueryParam[] } {
  const clauses = [
    '(q.company_id IS NULL OR q.company_id = ?)',
    'q.deleted_at IS NULL',
    'q.is_active = 1',
    "q.status = 'published'",
    'q.profession_id = ?',
  ];
  const queryParams: DbQueryParam[] = [companyId, params.professionId];

  appendForkReplacementExclusion(clauses, queryParams, companyId);

  if (params.level) {
    clauses.push('q.level = ?');
    queryParams.push(params.level);
  }

  const skillIds = (params.skillIds ?? []).filter(
    (id) => Number.isInteger(id) && id > 0,
  );
  if (skillIds.length > 0) {
    const placeholders = skillIds.map(() => '?').join(', ');
    clauses.push(
      `EXISTS (
         SELECT 1 FROM question_skills qs
         WHERE qs.question_id = q.id
           AND qs.skill_id IN (${placeholders})
       )`,
    );
    queryParams.push(...skillIds);
  }

  return { clauses, queryParams };
}

const SUGGESTION_CANDIDATE_SELECT = `q.id, q.question_text, q.level, q.difficulty, q.max_score,
              q.company_id, q.company_priority, q.is_required,
              t.id AS topic_id, t.name AS topic_name, t.interview_weight`;

const SUGGESTION_CANDIDATE_GROUP_BY = `q.id, q.question_text, q.level, q.difficulty, q.max_score,
                q.company_id, q.company_priority, q.is_required,
                t.id, t.name, t.interview_weight`;

const SUGGESTION_CANDIDATE_ORDER_BY = `q.is_required DESC,
         (q.company_id IS NOT NULL) DESC,
         q.company_priority DESC,
         t.interview_weight DESC,
         q.id ASC`;

function mapSuggestionCandidateRow(
  row: SuggestionCandidateRow,
): SuggestionCandidateEntity {
  return {
    id: Number(row.id),
    questionText: row.question_text,
    level: row.level,
    difficulty: row.difficulty,
    maxScore: Number(row.max_score),
    topicId: Number(row.topic_id),
    topicName: row.topic_name,
    interviewWeight: Number(row.interview_weight),
    skillCodes: row.skill_codes ? row.skill_codes.split(',') : [],
    isCustom: row.company_id !== null,
    companyPriority: Number(row.company_priority),
    isRequired: row.is_required === 1,
  };
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

export type QuestionUpsertData = {
  companyId: number | null;
  sourceQuestionId?: number | null;
  status?: QuestionStatus;
  companyPriority?: number;
  isRequired?: boolean;
  professionId: number;
  topicId: number;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  questionText: string;
  shortAnswer: string;
  idealAnswer: string;
  maxScore: number;
  skillIds: number[];
  checkpoints: CreateQuestionInput['checkpoints'];
  answerExamples: CreateQuestionInput['answerExamples'];
};

const QUESTION_SELECT_COLUMNS = `q.id, q.company_id, q.source_question_id, q.status,
              q.company_priority, q.is_required, q.profession_id, q.topic_id, q.level, q.difficulty,
              q.question_text, q.short_answer, q.ideal_answer, q.max_score,
              q.is_active, q.deleted_at, q.created_at, q.updated_at`;

export type CompanySkillUpsertData = {
  companyId: number;
  code: string;
  name: string;
};

export type CompanyTopicUpsertData = {
  companyId: number;
  code: string;
  name: string;
  skillId: number;
  interviewWeight: number;
};

@Injectable()
export class QuestionBankRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(
    companyId: number,
    filters: QuestionBankFilterInput,
  ): Promise<{ items: QuestionWithDetailsEntity[]; total: number }> {
    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 2000);
    const offset = Math.max(filters.offset ?? 0, 0);
    const { whereSql, params } = this.buildFilterClause(companyId, filters);

    const countRows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM questions q
       WHERE ${whereSql}`,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);
    if (total === 0) {
      return { items: [], total: 0 };
    }

    const questionRows = await this.database.query<QuestionRow[]>(
      `SELECT ${QUESTION_SELECT_COLUMNS}
       FROM questions q
       WHERE ${whereSql}
       ORDER BY q.updated_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    const items = await Promise.all(
      questionRows.map((row) =>
        this.loadQuestionDetails(this.mapQuestion(row)),
      ),
    );

    return { items, total };
  }

  async findVisibleById(
    companyId: number,
    questionId: number,
  ): Promise<QuestionWithDetailsEntity | null> {
    const rows = await this.database.query<QuestionRow[]>(
      `SELECT ${QUESTION_SELECT_COLUMNS}
       FROM questions q
       WHERE q.id = ?
         AND ${QUESTION_VISIBILITY_FILTER}`,
      [questionId, companyId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return this.loadQuestionDetails(this.mapQuestion(row));
  }

  async findOwnedById(
    companyId: number,
    questionId: number,
  ): Promise<QuestionEntity | null> {
    const rows = await this.database.query<QuestionRow[]>(
      `SELECT ${QUESTION_SELECT_COLUMNS}
       FROM questions q
       WHERE q.id = ?
         AND q.company_id = ?
         AND q.deleted_at IS NULL`,
      [questionId, companyId],
    );

    const row = rows[0];
    return row ? this.mapQuestion(row) : null;
  }

  async findGlobalQuestionById(
    questionId: number,
  ): Promise<QuestionWithDetailsEntity | null> {
    const rows = await this.database.query<QuestionRow[]>(
      `SELECT ${QUESTION_SELECT_COLUMNS}
       FROM questions q
       WHERE q.id = ?
         AND q.company_id IS NULL
         AND q.deleted_at IS NULL
         AND q.is_active = 1`,
      [questionId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return this.loadQuestionDetails(this.mapQuestion(row));
  }

  async forkQuestion(
    companyId: number,
    sourceQuestionId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<QuestionWithDetailsEntity> {
    const source = await this.findGlobalQuestionById(sourceQuestionId);
    if (!source) {
      throw new Error('SOURCE_QUESTION_NOT_FOUND');
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO questions (
         company_id, source_question_id, status, company_priority, is_required,
         profession_id, topic_id, level, difficulty,
         question_text, short_answer, ideal_answer, max_score
       ) VALUES (?, ?, 'draft', 0, 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        sourceQuestionId,
        source.professionId,
        source.topicId,
        source.level,
        source.difficulty,
        source.questionText,
        source.shortAnswer,
        source.idealAnswer,
        source.maxScore,
      ],
    );

    const forkedQuestionId = Number(result.insertId);

    await this.copyQuestionChildren(forkedQuestionId, source, query);

    const forked = await this.findOwnedQuestionWithDetails(
      companyId,
      forkedQuestionId,
      query,
    );

    if (!forked) {
      throw new Error('Failed to load forked question');
    }

    return forked;
  }

  async findProfessionById(id: number): Promise<ProfessionEntity | null> {
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, code, name, is_active, created_at, updated_at
       FROM professions
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.mapProfession(row) : null;
  }

  async findProfessionByCode(code: string): Promise<ProfessionEntity | null> {
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, code, name, is_active, created_at, updated_at
       FROM professions
       WHERE code = ? AND is_active = 1
       LIMIT 1`,
      [code],
    );

    const row = rows[0];
    return row ? this.mapProfession(row) : null;
  }

  async findSkillByCode(
    companyId: number,
    code: string,
  ): Promise<SkillEntity | null> {
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, company_id, code, name, is_active, created_at, updated_at
       FROM skills
       WHERE code = ?
         AND is_active = 1
         AND (company_id = ? OR company_id IS NULL)
       ORDER BY (company_id IS NOT NULL) DESC
       LIMIT 1`,
      [code, companyId],
    );

    const row = rows[0];
    return row ? this.mapSkill(row) : null;
  }

  async findOwnedTopicByCode(
    companyId: number,
    code: string,
  ): Promise<TopicEntity | null> {
    const rows = await this.database.query<TopicWithSkillRow[]>(
      `SELECT t.id, t.company_id, t.skill_id, t.code, t.name, t.interview_weight, t.is_active,
              t.created_at, t.updated_at,
              s.id AS skill_lookup_id, s.company_id AS skill_company_id,
              s.code AS skill_code, s.name AS skill_name,
              s.is_active AS skill_is_active, s.created_at AS skill_created_at,
              s.updated_at AS skill_updated_at
       FROM topics t
       LEFT JOIN skills s ON s.id = t.skill_id
       WHERE t.code = ?
         AND t.company_id = ?
         AND t.is_active = 1
       LIMIT 1`,
      [code, companyId],
    );

    const row = rows[0];
    return row ? this.mapTopicWithSkill(row) : null;
  }

  async findOwnedQuestionByTopicAndText(
    companyId: number,
    topicId: number,
    questionText: string,
  ): Promise<QuestionWithDetailsEntity | null> {
    const rows = await this.database.query<QuestionRow[]>(
      `SELECT ${QUESTION_SELECT_COLUMNS}
       FROM questions q
       WHERE q.company_id = ?
         AND q.topic_id = ?
         AND q.question_text = ?
         AND q.deleted_at IS NULL
         AND q.is_active = 1
       LIMIT 1`,
      [companyId, topicId, questionText],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return this.loadQuestionDetails(this.mapQuestion(row));
  }

  async findTopicById(
    companyId: number,
    id: number,
  ): Promise<TopicEntity | null> {
    const rows = await this.database.query<TopicWithSkillRow[]>(
      `SELECT t.id, t.company_id, t.skill_id, t.code, t.name, t.interview_weight, t.is_active,
              t.created_at, t.updated_at,
              s.id AS skill_lookup_id, s.company_id AS skill_company_id,
              s.code AS skill_code, s.name AS skill_name,
              s.is_active AS skill_is_active, s.created_at AS skill_created_at,
              s.updated_at AS skill_updated_at
       FROM topics t
       LEFT JOIN skills s ON s.id = t.skill_id
       WHERE t.id = ?
         AND t.is_active = 1
         AND (t.company_id IS NULL OR t.company_id = ?)
       LIMIT 1`,
      [id, companyId],
    );

    const row = rows[0];
    return row ? this.mapTopicWithSkill(row) : null;
  }

  async findOwnedTopicById(
    companyId: number,
    topicId: number,
  ): Promise<TopicEntity | null> {
    const rows = await this.database.query<TopicWithSkillRow[]>(
      `SELECT t.id, t.company_id, t.skill_id, t.code, t.name, t.interview_weight, t.is_active,
              t.created_at, t.updated_at,
              s.id AS skill_lookup_id, s.company_id AS skill_company_id,
              s.code AS skill_code, s.name AS skill_name,
              s.is_active AS skill_is_active, s.created_at AS skill_created_at,
              s.updated_at AS skill_updated_at
       FROM topics t
       LEFT JOIN skills s ON s.id = t.skill_id
       WHERE t.id = ?
         AND t.company_id = ?
         AND t.is_active = 1
       LIMIT 1`,
      [topicId, companyId],
    );

    const row = rows[0];
    return row ? this.mapTopicWithSkill(row) : null;
  }

  async findTopicRowById(id: number): Promise<{
    id: number;
    companyId: number | null;
    isActive: boolean;
  } | null> {
    const rows = await this.database.query<
      (RowDataPacket & {
        id: number;
        company_id: number | null;
        is_active: number;
      })[]
    >(
      `SELECT id, company_id, is_active
       FROM topics
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      companyId: row.company_id,
      isActive: row.is_active === 1,
    };
  }

  async findSkillVisibleToCompany(
    companyId: number,
    skillId: number,
  ): Promise<SkillEntity | null> {
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, company_id, code, name, is_active, created_at, updated_at
       FROM skills
       WHERE id = ?
         AND is_active = 1
         AND (company_id IS NULL OR company_id = ?)
       LIMIT 1`,
      [skillId, companyId],
    );

    const row = rows[0];
    return row ? this.mapSkill(row) : null;
  }

  async findOwnedSkillById(
    companyId: number,
    skillId: number,
  ): Promise<SkillEntity | null> {
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, company_id, code, name, is_active, created_at, updated_at
       FROM skills
       WHERE id = ?
         AND company_id = ?
         AND is_active = 1
       LIMIT 1`,
      [skillId, companyId],
    );

    const row = rows[0];
    return row ? this.mapSkill(row) : null;
  }

  async findSkillRowById(id: number): Promise<{
    id: number;
    companyId: number | null;
    isActive: boolean;
  } | null> {
    const rows = await this.database.query<
      (RowDataPacket & {
        id: number;
        company_id: number | null;
        is_active: number;
      })[]
    >(
      `SELECT id, company_id, is_active
       FROM skills
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      companyId: row.company_id,
      isActive: row.is_active === 1,
    };
  }

  /**
   * Lightweight candidate descriptors for AI question selection (TASK-16.4).
   * Only returns questions visible to the company (global or company-owned),
   * filtered by profession (required) and optional level / skillIds (OR).
   */
  /**
   * Published company questions pinned as required for the given filters.
   * Used as a pre-pass before AI / fallback selection (TASK-20.6).
   */
  async findRequiredSuggestionCandidates(
    companyId: number,
    params: SuggestionCandidateFilterParams,
  ): Promise<SuggestionCandidateEntity[]> {
    const { clauses, queryParams } = buildSuggestionCandidateFilters(
      companyId,
      params,
    );
    clauses.push('q.company_id = ?', 'q.is_required = 1');
    queryParams.push(companyId);

    const rows = await this.database.query<SuggestionCandidateRow[]>(
      `SELECT ${SUGGESTION_CANDIDATE_SELECT},
              GROUP_CONCAT(DISTINCT s.code ORDER BY s.code SEPARATOR ',') AS skill_codes
       FROM questions q
       JOIN topics t ON t.id = q.topic_id
       LEFT JOIN question_skills qs ON qs.question_id = q.id
       LEFT JOIN skills s ON s.id = qs.skill_id
       WHERE ${clauses.map((clause) => `(${clause})`).join(' AND ')}
       GROUP BY ${SUGGESTION_CANDIDATE_GROUP_BY}
       ORDER BY ${SUGGESTION_CANDIDATE_ORDER_BY}`,
      queryParams,
    );

    return rows.map(mapSuggestionCandidateRow);
  }

  async findSuggestionCandidates(
    companyId: number,
    params: SuggestionCandidateFilterParams & { limit: number },
  ): Promise<SuggestionCandidateEntity[]> {
    const { clauses, queryParams } = buildSuggestionCandidateFilters(
      companyId,
      params,
    );

    const limit = Math.min(Math.max(params.limit, 1), 500);

    const rows = await this.database.query<SuggestionCandidateRow[]>(
      `SELECT ${SUGGESTION_CANDIDATE_SELECT},
              GROUP_CONCAT(DISTINCT s.code ORDER BY s.code SEPARATOR ',') AS skill_codes
       FROM questions q
       JOIN topics t ON t.id = q.topic_id
       LEFT JOIN question_skills qs ON qs.question_id = q.id
       LEFT JOIN skills s ON s.id = qs.skill_id
       WHERE ${clauses.map((clause) => `(${clause})`).join(' AND ')}
       GROUP BY ${SUGGESTION_CANDIDATE_GROUP_BY}
       ORDER BY ${SUGGESTION_CANDIDATE_ORDER_BY}
       LIMIT ${limit}`,
      queryParams,
    );

    return rows.map(mapSuggestionCandidateRow);
  }

  async findProfessions(): Promise<ProfessionEntity[]> {
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, code, name, is_active, created_at, updated_at
       FROM professions
       WHERE is_active = 1
       ORDER BY name ASC`,
    );

    return rows.map((row) => this.mapProfession(row));
  }

  /**
   * Skills relevant to a profession are derived from data: distinct skills of
   * questions visible to the company (global or company-owned). No separate
   * `profession_skills` table. Without a profession filter, all active skills
   * are returned as a global lookup.
   */
  async findSkillsByProfession(
    companyId: number,
    professionId?: number,
  ): Promise<SkillEntity[]> {
    if (professionId === undefined) {
      const rows = await this.database.query<LookupRow[]>(
        `SELECT id, company_id, code, name, is_active, created_at, updated_at
         FROM skills
         WHERE is_active = 1
           AND (company_id IS NULL OR company_id = ?)
         ORDER BY name ASC`,
        [companyId],
      );

      return rows.map((row) => this.mapSkill(row));
    }

    const rows = await this.database.query<LookupRow[]>(
      `SELECT DISTINCT s.id, s.company_id, s.code, s.name, s.is_active, s.created_at, s.updated_at
       FROM skills s
       LEFT JOIN question_skills qs ON qs.skill_id = s.id
       LEFT JOIN questions q ON q.id = qs.question_id
         AND q.profession_id = ?
         AND (q.company_id IS NULL OR q.company_id = ?)
         AND q.deleted_at IS NULL
         AND q.is_active = 1
       WHERE s.is_active = 1
         AND (s.company_id IS NULL OR s.company_id = ?)
         AND (s.company_id = ? OR q.id IS NOT NULL)
       ORDER BY s.name ASC`,
      [professionId, companyId, companyId, companyId],
    );

    return rows.map((row) => this.mapSkill(row));
  }

  /**
   * Topics filtered by skill (`topics.skill_id`) and/or by profession (topics
   * that have at least one visible question for that profession).
   */
  async findTopics(
    companyId: number,
    skillId?: number,
    professionId?: number,
  ): Promise<TopicEntity[]> {
    const clauses = [
      't.is_active = 1',
      '(t.company_id IS NULL OR t.company_id = ?)',
    ];
    const params: DbQueryParam[] = [companyId];

    if (skillId !== undefined) {
      clauses.push('t.skill_id = ?');
      params.push(skillId);
    }

    if (professionId !== undefined) {
      clauses.push(
        `(
           t.company_id = ?
           OR EXISTS (
             SELECT 1 FROM questions q
             WHERE q.topic_id = t.id
               AND q.profession_id = ?
               AND (q.company_id IS NULL OR q.company_id = ?)
               AND q.deleted_at IS NULL
               AND q.is_active = 1
           )
         )`,
      );
      params.push(companyId, professionId, companyId);
    }

    const rows = await this.database.query<TopicWithSkillRow[]>(
      `SELECT t.id, t.company_id, t.skill_id, t.code, t.name, t.interview_weight, t.is_active,
              t.created_at, t.updated_at,
              s.id AS skill_lookup_id, s.company_id AS skill_company_id,
              s.code AS skill_code, s.name AS skill_name,
              s.is_active AS skill_is_active, s.created_at AS skill_created_at,
              s.updated_at AS skill_updated_at
       FROM topics t
       LEFT JOIN skills s ON s.id = t.skill_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY t.name ASC`,
      params,
    );

    return rows.map((row) => this.mapTopicWithSkill(row));
  }

  async findSkillsByIds(
    companyId: number,
    ids: number[],
  ): Promise<SkillEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const placeholders = ids.map(() => '?').join(', ');
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, company_id, code, name, is_active, created_at, updated_at
       FROM skills
       WHERE id IN (${placeholders})
         AND is_active = 1
         AND (company_id IS NULL OR company_id = ?)`,
      [...ids, companyId],
    );

    return rows.map((row) => this.mapSkill(row));
  }

  async createCompanySkill(data: CompanySkillUpsertData): Promise<SkillEntity> {
    const result = await this.database.query<ResultSetHeader>(
      `INSERT INTO skills (company_id, code, name)
       VALUES (?, ?, ?)`,
      [data.companyId, data.code, data.name],
    );

    const skill = await this.findOwnedSkillById(
      data.companyId,
      Number(result.insertId),
    );

    if (!skill) {
      throw new Error('Failed to load skill after insert');
    }

    return skill;
  }

  async updateCompanySkill(
    companyId: number,
    skillId: number,
    data: Partial<Pick<CompanySkillUpsertData, 'code' | 'name'>>,
  ): Promise<SkillEntity | null> {
    const sets: string[] = [];
    const params: DbQueryParam[] = [];

    if (data.code !== undefined) {
      sets.push('code = ?');
      params.push(data.code);
    }

    if (data.name !== undefined) {
      sets.push('name = ?');
      params.push(data.name);
    }

    if (sets.length === 0) {
      return this.findOwnedSkillById(companyId, skillId);
    }

    await this.database.query<ResultSetHeader>(
      `UPDATE skills
       SET ${sets.join(', ')}
       WHERE id = ? AND company_id = ? AND is_active = 1`,
      [...params, skillId, companyId],
    );

    return this.findOwnedSkillById(companyId, skillId);
  }

  async archiveCompanySkill(
    companyId: number,
    skillId: number,
  ): Promise<boolean> {
    const result = await this.database.query<ResultSetHeader>(
      `UPDATE skills
       SET is_active = 0
       WHERE id = ? AND company_id = ? AND is_active = 1`,
      [skillId, companyId],
    );

    return result.affectedRows > 0;
  }

  async createCompanyTopic(data: CompanyTopicUpsertData): Promise<TopicEntity> {
    const result = await this.database.query<ResultSetHeader>(
      `INSERT INTO topics (company_id, skill_id, code, name, interview_weight)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.companyId,
        data.skillId,
        data.code,
        data.name,
        data.interviewWeight,
      ],
    );

    const topic = await this.findOwnedTopicById(
      data.companyId,
      Number(result.insertId),
    );

    if (!topic) {
      throw new Error('Failed to load topic after insert');
    }

    return topic;
  }

  async updateCompanyTopic(
    companyId: number,
    topicId: number,
    data: Partial<
      Pick<CompanyTopicUpsertData, 'code' | 'name' | 'skillId' | 'interviewWeight'>
    >,
  ): Promise<TopicEntity | null> {
    const sets: string[] = [];
    const params: DbQueryParam[] = [];

    if (data.code !== undefined) {
      sets.push('code = ?');
      params.push(data.code);
    }

    if (data.name !== undefined) {
      sets.push('name = ?');
      params.push(data.name);
    }

    if (data.skillId !== undefined) {
      sets.push('skill_id = ?');
      params.push(data.skillId);
    }

    if (data.interviewWeight !== undefined) {
      sets.push('interview_weight = ?');
      params.push(data.interviewWeight);
    }

    if (sets.length === 0) {
      return this.findOwnedTopicById(companyId, topicId);
    }

    await this.database.query<ResultSetHeader>(
      `UPDATE topics
       SET ${sets.join(', ')}
       WHERE id = ? AND company_id = ? AND is_active = 1`,
      [...params, topicId, companyId],
    );

    return this.findOwnedTopicById(companyId, topicId);
  }

  async archiveCompanyTopic(
    companyId: number,
    topicId: number,
  ): Promise<boolean> {
    const result = await this.database.query<ResultSetHeader>(
      `UPDATE topics
       SET is_active = 0
       WHERE id = ? AND company_id = ? AND is_active = 1`,
      [topicId, companyId],
    );

    return result.affectedRows > 0;
  }

  async findCheckpointsByQuestionId(
    questionId: number,
  ): Promise<QuestionCheckpointEntity[]> {
    const rows = await this.database.query<CheckpointRow[]>(
      `SELECT id, question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order, created_at, updated_at
       FROM question_checkpoints
       WHERE question_id = ?
       ORDER BY sort_order ASC`,
      [questionId],
    );

    return rows.map((row) => this.mapCheckpoint(row));
  }

  async create(
    data: QuestionUpsertData,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<QuestionWithDetailsEntity> {
    const status = data.status ?? 'draft';
    const companyPriority = data.companyPriority ?? 0;
    const isRequired = data.isRequired ? 1 : 0;

    const result = await query<ResultSetHeader>(
      `INSERT INTO questions (
         company_id, source_question_id, status, company_priority, is_required,
         profession_id, topic_id, level, difficulty,
         question_text, short_answer, ideal_answer, max_score
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.companyId,
        data.sourceQuestionId ?? null,
        status,
        companyPriority,
        isRequired,
        data.professionId,
        data.topicId,
        data.level,
        data.difficulty,
        data.questionText,
        data.shortAnswer,
        data.idealAnswer,
        data.maxScore,
      ],
    );

    const questionId = Number(result.insertId);
    await this.replaceChildren(questionId, data, query);

    const created = await this.findVisibleByIdForReload(
      data.companyId,
      questionId,
      query,
    );

    if (!created) {
      throw new Error('Failed to load question after insert');
    }

    return created;
  }

  async update(
    questionId: number,
    data: QuestionUpsertData,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<QuestionWithDetailsEntity> {
    const sets = [
      'profession_id = ?',
      'topic_id = ?',
      'level = ?',
      'difficulty = ?',
      'question_text = ?',
      'short_answer = ?',
      'ideal_answer = ?',
      'max_score = ?',
    ];
    const params: DbQueryParam[] = [
      data.professionId,
      data.topicId,
      data.level,
      data.difficulty,
      data.questionText,
      data.shortAnswer,
      data.idealAnswer,
      data.maxScore,
    ];

    if (data.status !== undefined) {
      sets.push('status = ?');
      params.push(data.status);
    }

    if (data.companyPriority !== undefined) {
      sets.push('company_priority = ?');
      params.push(data.companyPriority);
    }

    if (data.isRequired !== undefined) {
      sets.push('is_required = ?');
      params.push(data.isRequired ? 1 : 0);
    }

    params.push(questionId, data.companyId);

    await query<ResultSetHeader>(
      `UPDATE questions
       SET ${sets.join(', ')}
       WHERE id = ? AND company_id = ? AND deleted_at IS NULL`,
      params,
    );

    await this.replaceChildren(questionId, data, query);

    const updated = await this.findVisibleByIdForReload(
      data.companyId,
      questionId,
      query,
    );

    if (!updated) {
      throw new Error('Failed to load question after update');
    }

    return updated;
  }

  async archive(companyId: number, questionId: number): Promise<boolean> {
    const result = await this.database.query<ResultSetHeader>(
      `UPDATE questions
       SET is_active = 0, deleted_at = CURRENT_TIMESTAMP
       WHERE id = ? AND company_id = ? AND deleted_at IS NULL`,
      [questionId, companyId],
    );

    return result.affectedRows > 0;
  }

  private async replaceChildren(
    questionId: number,
    data: QuestionUpsertData,
    query: QueryFn,
  ): Promise<void> {
    await query<ResultSetHeader>(
      `DELETE FROM question_skills WHERE question_id = ?`,
      [questionId],
    );

    for (const skillId of data.skillIds) {
      await query<ResultSetHeader>(
        `INSERT INTO question_skills (question_id, skill_id) VALUES (?, ?)`,
        [questionId, skillId],
      );
    }

    await query<ResultSetHeader>(
      `DELETE FROM question_checkpoints WHERE question_id = ?`,
      [questionId],
    );

    for (const checkpoint of data.checkpoints) {
      await query<ResultSetHeader>(
        `INSERT INTO question_checkpoints (
           question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          questionId,
          checkpoint.checkpointKey,
          checkpoint.title,
          checkpoint.expected,
          checkpoint.evaluationHints
            ? JSON.stringify(checkpoint.evaluationHints)
            : null,
          checkpoint.score,
          checkpoint.sortOrder,
        ],
      );
    }

    await query<ResultSetHeader>(
      `DELETE FROM answer_examples WHERE question_id = ?`,
      [questionId],
    );

    for (const example of data.answerExamples) {
      await query<ResultSetHeader>(
        `INSERT INTO answer_examples (
           question_id, checkpoint_key, example_type, example_text, sort_order
         ) VALUES (?, ?, ?, ?, ?)`,
        [
          questionId,
          example.checkpointKey ?? null,
          example.exampleType,
          example.exampleText,
          example.sortOrder,
        ],
      );
    }
  }

  private async findVisibleByIdForReload(
    companyId: number | null,
    questionId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<QuestionWithDetailsEntity | null> {
    const rows = await query<QuestionRow[]>(
      `SELECT ${QUESTION_SELECT_COLUMNS}
       FROM questions q
       WHERE q.id = ?
         AND q.deleted_at IS NULL
         AND q.is_active = 1
         AND (q.company_id IS NULL OR q.company_id = ?)`,
      [questionId, companyId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return this.loadQuestionDetails(this.mapQuestion(row), query);
  }

  private async loadQuestionDetails(
    question: QuestionEntity,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<QuestionWithDetailsEntity> {
    const [skillRows, checkpointRows, exampleRows] = await Promise.all([
      query<RowDataPacket[]>(
        `SELECT skill_id FROM question_skills WHERE question_id = ?`,
        [question.id],
      ),
      query<CheckpointRow[]>(
        `SELECT id, question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order, created_at, updated_at
         FROM question_checkpoints
         WHERE question_id = ?
         ORDER BY sort_order ASC`,
        [question.id],
      ),
      query<ExampleRow[]>(
        `SELECT id, question_id, checkpoint_key, example_type, example_text, sort_order, created_at
         FROM answer_examples
         WHERE question_id = ?
         ORDER BY sort_order ASC`,
        [question.id],
      ),
    ]);

    return {
      ...question,
      skillIds: skillRows.map((row) => Number(row.skill_id)),
      checkpoints: checkpointRows.map((row) => this.mapCheckpoint(row)),
      answerExamples: exampleRows.map((row) => this.mapExample(row)),
    };
  }

  private buildFilterClause(
    companyId: number,
    filters: QuestionBankFilterInput,
  ): { whereSql: string; params: DbQueryParam[] } {
    const clauses = [QUESTION_VISIBILITY_FILTER];
    const params: DbQueryParam[] = [companyId];

    if (filters.professionId) {
      clauses.push('q.profession_id = ?');
      params.push(Number(filters.professionId));
    }

    if (filters.topicId) {
      clauses.push('q.topic_id = ?');
      params.push(Number(filters.topicId));
    }

    if (filters.skillIds && filters.skillIds.length > 0) {
      const skillIds = filters.skillIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (skillIds.length > 0) {
        const placeholders = skillIds.map(() => '?').join(', ');
        clauses.push(
          `EXISTS (
             SELECT 1 FROM question_skills qs
             WHERE qs.question_id = q.id
               AND qs.skill_id IN (${placeholders})
           )`,
        );
        params.push(...skillIds);
      }
    }

    if (filters.level) {
      clauses.push('q.level = ?');
      params.push(filters.level);
    }

    if (filters.difficulty) {
      clauses.push('q.difficulty = ?');
      params.push(filters.difficulty);
    }

    if (filters.search?.trim()) {
      clauses.push('q.question_text LIKE ?');
      params.push(`%${filters.search.trim()}%`);
    }

    if (filters.scope === 'global') {
      clauses.push('q.company_id IS NULL');
    } else if (filters.scope === 'company') {
      clauses.push('q.company_id = ?');
      params.push(companyId);
    }

    const includeForkReplacedGlobal = filters.includeForkReplacedGlobal === true;
    if (filters.scope !== 'global' && !includeForkReplacedGlobal) {
      appendForkReplacementExclusion(clauses, params, companyId);
    }

    if (filters.status) {
      clauses.push('q.status = ?');
      params.push(filters.status);
    }

    return {
      whereSql: clauses.map((clause) => `(${clause})`).join(' AND '),
      params,
    };
  }

  private mapQuestion(row: QuestionRow): QuestionEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      sourceQuestionId: row.source_question_id,
      status: row.status,
      companyPriority: Number(row.company_priority),
      isRequired: row.is_required === 1,
      professionId: row.profession_id,
      topicId: row.topic_id,
      level: row.level,
      difficulty: row.difficulty,
      questionText: row.question_text,
      shortAnswer: row.short_answer,
      idealAnswer: row.ideal_answer,
      maxScore: Number(row.max_score),
      isActive: row.is_active === 1,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async copyQuestionChildren(
    targetQuestionId: number,
    source: QuestionWithDetailsEntity,
    query: QueryFn,
  ): Promise<void> {
    for (const skillId of source.skillIds) {
      await query<ResultSetHeader>(
        `INSERT INTO question_skills (question_id, skill_id) VALUES (?, ?)`,
        [targetQuestionId, skillId],
      );
    }

    for (const checkpoint of source.checkpoints) {
      await query<ResultSetHeader>(
        `INSERT INTO question_checkpoints (
           question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          targetQuestionId,
          checkpoint.checkpointKey,
          checkpoint.title,
          checkpoint.expected,
          checkpoint.evaluationHints
            ? JSON.stringify(checkpoint.evaluationHints)
            : null,
          checkpoint.score,
          checkpoint.sortOrder,
        ],
      );
    }

    for (const example of source.answerExamples) {
      await query<ResultSetHeader>(
        `INSERT INTO answer_examples (
           question_id, checkpoint_key, example_type, example_text, sort_order
         ) VALUES (?, ?, ?, ?, ?)`,
        [
          targetQuestionId,
          example.checkpointKey ?? null,
          example.exampleType,
          example.exampleText,
          example.sortOrder,
        ],
      );
    }
  }

  private async findOwnedQuestionWithDetails(
    companyId: number,
    questionId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<QuestionWithDetailsEntity | null> {
    const rows = await query<QuestionRow[]>(
      `SELECT ${QUESTION_SELECT_COLUMNS}
       FROM questions q
       WHERE q.id = ?
         AND q.company_id = ?
         AND q.deleted_at IS NULL
         AND q.is_active = 1`,
      [questionId, companyId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    const question = this.mapQuestion(row);
    return this.loadQuestionDetailsWithQuery(question, query);
  }

  private async loadQuestionDetailsWithQuery(
    question: QuestionEntity,
    query: QueryFn,
  ): Promise<QuestionWithDetailsEntity> {
    const [skillRows, checkpointRows, exampleRows] = await Promise.all([
      query<RowDataPacket[]>(
        `SELECT skill_id FROM question_skills WHERE question_id = ?`,
        [question.id],
      ),
      query<CheckpointRow[]>(
        `SELECT id, question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order, created_at, updated_at
         FROM question_checkpoints
         WHERE question_id = ?
         ORDER BY sort_order ASC`,
        [question.id],
      ),
      query<ExampleRow[]>(
        `SELECT id, question_id, checkpoint_key, example_type, example_text, sort_order, created_at
         FROM answer_examples
         WHERE question_id = ?
         ORDER BY sort_order ASC`,
        [question.id],
      ),
    ]);

    return {
      ...question,
      skillIds: skillRows.map((row) => Number(row.skill_id)),
      checkpoints: checkpointRows.map((row) => this.mapCheckpoint(row)),
      answerExamples: exampleRows.map((row) => this.mapExample(row)),
    };
  }

  private mapProfession(row: LookupRow): ProfessionEntity {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapTopic(row: TopicRow): TopicEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      skillId: row.skill_id,
      code: row.code,
      name: row.name,
      interviewWeight: Number(row.interview_weight),
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapTopicWithSkill(row: TopicWithSkillRow): TopicEntity {
    const topic = this.mapTopic(row);

    if (
      row.skill_lookup_id === null ||
      row.skill_code === null ||
      row.skill_name === null
    ) {
      return { ...topic, skill: null };
    }

    return {
      ...topic,
      skill: {
        id: row.skill_lookup_id,
        companyId: row.skill_company_id,
        code: row.skill_code,
        name: row.skill_name,
        isActive: row.skill_is_active === 1,
        createdAt: row.skill_created_at ?? topic.createdAt,
        updatedAt: row.skill_updated_at ?? topic.updatedAt,
      },
    };
  }

  private mapSkill(row: LookupRow): SkillEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      name: row.name,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapCheckpoint(row: CheckpointRow): QuestionCheckpointEntity {
    return {
      id: row.id,
      questionId: row.question_id,
      checkpointKey: row.checkpoint_key,
      title: row.title,
      expected: row.expected,
      evaluationHints: parseCheckpointEvaluationHints(row.evaluation_hints),
      score: Number(row.score),
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapExample(row: ExampleRow): AnswerExampleEntity {
    return {
      id: row.id,
      questionId: row.question_id,
      checkpointKey: row.checkpoint_key,
      exampleType: row.example_type,
      exampleText: row.example_text,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  }
}
