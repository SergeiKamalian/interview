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

interface QuestionRow extends RowDataPacket {
  id: number;
  company_id: number | null;
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

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

export type QuestionUpsertData = {
  companyId: number | null;
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
      `SELECT q.id, q.company_id, q.profession_id, q.topic_id, q.level, q.difficulty,
              q.question_text, q.short_answer, q.ideal_answer, q.max_score,
              q.is_active, q.deleted_at, q.created_at, q.updated_at
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
      `SELECT q.id, q.company_id, q.profession_id, q.topic_id, q.level, q.difficulty,
              q.question_text, q.short_answer, q.ideal_answer, q.max_score,
              q.is_active, q.deleted_at, q.created_at, q.updated_at
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
      `SELECT q.id, q.company_id, q.profession_id, q.topic_id, q.level, q.difficulty,
              q.question_text, q.short_answer, q.ideal_answer, q.max_score,
              q.is_active, q.deleted_at, q.created_at, q.updated_at
       FROM questions q
       WHERE q.id = ?
         AND q.company_id = ?
         AND q.deleted_at IS NULL`,
      [questionId, companyId],
    );

    const row = rows[0];
    return row ? this.mapQuestion(row) : null;
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

  async findTopicById(id: number): Promise<TopicEntity | null> {
    const rows = await this.database.query<TopicWithSkillRow[]>(
      `SELECT t.id, t.skill_id, t.code, t.name, t.interview_weight, t.is_active,
              t.created_at, t.updated_at,
              s.id AS skill_lookup_id, s.code AS skill_code, s.name AS skill_name,
              s.is_active AS skill_is_active, s.created_at AS skill_created_at,
              s.updated_at AS skill_updated_at
       FROM topics t
       LEFT JOIN skills s ON s.id = t.skill_id
       WHERE t.id = ? AND t.is_active = 1
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.mapTopicWithSkill(row) : null;
  }

  async findSkillsByIds(ids: number[]): Promise<SkillEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const placeholders = ids.map(() => '?').join(', ');
    const rows = await this.database.query<LookupRow[]>(
      `SELECT id, code, name, is_active, created_at, updated_at
       FROM skills
       WHERE id IN (${placeholders}) AND is_active = 1`,
      ids,
    );

    return rows.map((row) => this.mapSkill(row));
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
    const result = await query<ResultSetHeader>(
      `INSERT INTO questions (
         company_id, profession_id, topic_id, level, difficulty,
         question_text, short_answer, ideal_answer, max_score
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.companyId,
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
    await query<ResultSetHeader>(
      `UPDATE questions
       SET profession_id = ?, topic_id = ?, level = ?, difficulty = ?,
           question_text = ?, short_answer = ?, ideal_answer = ?, max_score = ?
       WHERE id = ? AND company_id = ? AND deleted_at IS NULL`,
      [
        data.professionId,
        data.topicId,
        data.level,
        data.difficulty,
        data.questionText,
        data.shortAnswer,
        data.idealAnswer,
        data.maxScore,
        questionId,
        data.companyId,
      ],
    );

    await this.replaceChildren(questionId, data, query);

    const updated = await this.findVisibleByIdForReload(
      data.companyId,
      questionId,
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
  ): Promise<QuestionWithDetailsEntity | null> {
    const rows = await this.database.query<QuestionRow[]>(
      `SELECT q.id, q.company_id, q.profession_id, q.topic_id, q.level, q.difficulty,
              q.question_text, q.short_answer, q.ideal_answer, q.max_score,
              q.is_active, q.deleted_at, q.created_at, q.updated_at
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

    return this.loadQuestionDetails(this.mapQuestion(row));
  }

  private async loadQuestionDetails(
    question: QuestionEntity,
  ): Promise<QuestionWithDetailsEntity> {
    const [skillRows, checkpointRows, exampleRows] = await Promise.all([
      this.database.query<RowDataPacket[]>(
        `SELECT skill_id FROM question_skills WHERE question_id = ?`,
        [question.id],
      ),
      this.database.query<CheckpointRow[]>(
        `SELECT id, question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order, created_at, updated_at
         FROM question_checkpoints
         WHERE question_id = ?
         ORDER BY sort_order ASC`,
        [question.id],
      ),
      this.database.query<ExampleRow[]>(
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

    return {
      whereSql: clauses.map((clause) => `(${clause})`).join(' AND '),
      params,
    };
  }

  private mapQuestion(row: QuestionRow): QuestionEntity {
    return {
      id: row.id,
      companyId: row.company_id,
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

    if (row.skill_lookup_id === null || row.skill_code === null || row.skill_name === null) {
      return { ...topic, skill: null };
    }

    return {
      ...topic,
      skill: {
        id: row.skill_lookup_id,
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
