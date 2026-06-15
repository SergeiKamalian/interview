import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import { ADAPTIVE_INTERVIEW_TABLES } from '../adaptive-interview.schema';
import type {
  InterviewQuestionSummaryEntity,
  UpsertInterviewQuestionSummaryData,
} from '../entities/interview-question-summary.entity';

interface SummaryRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  interview_question_id: number;
  score: string;
  max_score: string;
  summary: string;
  strengths: string | string[] | null;
  weaknesses: string | string[] | null;
  unclear_checkpoints: string | string[] | null;
  follow_up_count: number;
  needs_manual_review: number;
  created_at: Date;
  updated_at: Date;
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

@Injectable()
export class QuestionSummaryRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByAttemptId(
    attemptId: number,
  ): Promise<InterviewQuestionSummaryEntity[]> {
    const rows = await this.database.query<SummaryRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id, score, max_score,
              summary, strengths, weaknesses, unclear_checkpoints, follow_up_count,
              needs_manual_review, created_at, updated_at
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewQuestionSummaries}
       WHERE interview_attempt_id = ?
       ORDER BY interview_question_id ASC`,
      [attemptId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  async findByAttemptAndQuestion(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<InterviewQuestionSummaryEntity | null> {
    const rows = await this.database.query<SummaryRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id, score, max_score,
              summary, strengths, weaknesses, unclear_checkpoints, follow_up_count,
              needs_manual_review, created_at, updated_at
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewQuestionSummaries}
       WHERE interview_attempt_id = ? AND interview_question_id = ?
       LIMIT 1`,
      [attemptId, interviewQuestionId],
    );

    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async upsert(
    input: UpsertInterviewQuestionSummaryData,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewQuestionSummaryEntity> {
    await query<ResultSetHeader>(
      `INSERT INTO ${ADAPTIVE_INTERVIEW_TABLES.interviewQuestionSummaries} (
         company_id, interview_attempt_id, interview_question_id, score, max_score,
         summary, strengths, weaknesses, unclear_checkpoints, follow_up_count,
         needs_manual_review
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         score = VALUES(score),
         max_score = VALUES(max_score),
         summary = VALUES(summary),
         strengths = VALUES(strengths),
         weaknesses = VALUES(weaknesses),
         unclear_checkpoints = VALUES(unclear_checkpoints),
         follow_up_count = VALUES(follow_up_count),
         needs_manual_review = VALUES(needs_manual_review)`,
      [
        input.companyId,
        input.interviewAttemptId,
        input.interviewQuestionId,
        input.score,
        input.maxScore,
        input.summary,
        input.strengths ? JSON.stringify(input.strengths) : null,
        input.weaknesses ? JSON.stringify(input.weaknesses) : null,
        input.unclearCheckpoints ? JSON.stringify(input.unclearCheckpoints) : null,
        input.followUpCount,
        input.needsManualReview ? 1 : 0,
      ],
    );

    const saved = await this.findByAttemptAndQuestion(
      input.interviewAttemptId,
      input.interviewQuestionId,
    );

    if (!saved) {
      throw new Error('Failed to load question summary after upsert');
    }

    return saved;
  }

  private mapRow(row: SummaryRow): InterviewQuestionSummaryEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewQuestionId: row.interview_question_id,
      score: Number(row.score),
      maxScore: Number(row.max_score),
      summary: row.summary,
      strengths: parseJsonArray(row.strengths),
      weaknesses: parseJsonArray(row.weaknesses),
      unclearCheckpoints: parseJsonArray(row.unclear_checkpoints),
      followUpCount: row.follow_up_count,
      needsManualReview: row.needs_manual_review === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

function parseJsonArray(value: string | string[] | null): string[] | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
}
