import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { AI_EVALUATION_TABLES } from '../ai-evaluation.schema';
import type {
  QuestionEvaluationEntity,
  UpsertQuestionEvaluationData,
} from '../entities/question-evaluation.entity';

interface QuestionEvaluationRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  interview_message_id: number;
  interview_question_id: number;
  score: string;
  max_score: string;
  short_summary: string | null;
  review: string | null;
  raw_response: string | Record<string, unknown> | null;
  needs_manual_review: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class QuestionEvaluationRepository {
  constructor(private readonly database: DatabaseService) {}

  async upsertByInterviewMessage(
    data: UpsertQuestionEvaluationData,
  ): Promise<QuestionEvaluationEntity> {
    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${AI_EVALUATION_TABLES.questionEvaluations} (
         company_id, interview_attempt_id, interview_message_id, interview_question_id,
         score, max_score, short_summary, review, raw_response, needs_manual_review
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         score = VALUES(score),
         max_score = VALUES(max_score),
         short_summary = VALUES(short_summary),
         review = VALUES(review),
         raw_response = VALUES(raw_response),
         needs_manual_review = VALUES(needs_manual_review),
         updated_at = CURRENT_TIMESTAMP`,
      [
        data.companyId,
        data.interviewAttemptId,
        data.interviewMessageId,
        data.interviewQuestionId,
        data.score,
        data.maxScore,
        data.shortSummary,
        data.review,
        JSON.stringify(data.rawResponse),
        data.needsManualReview ? 1 : 0,
      ],
    );

    const rows = await this.database.query<QuestionEvaluationRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_message_id,
              interview_question_id, score, max_score, short_summary, review,
              raw_response, needs_manual_review, created_at, updated_at
       FROM ${AI_EVALUATION_TABLES.questionEvaluations}
       WHERE interview_message_id = ?
       LIMIT 1`,
      [data.interviewMessageId],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load question evaluation after upsert');
    }

    return this.mapRow(row);
  }

  async findByInterviewId(
    companyId: number,
    interviewId: number,
  ): Promise<QuestionEvaluationEntity[]> {
    const rows = await this.database.query<QuestionEvaluationRow[]>(
      `SELECT qe.id, qe.company_id, qe.interview_attempt_id, qe.interview_message_id,
              qe.interview_question_id, qe.score, qe.max_score, qe.short_summary, qe.review,
              qe.raw_response, qe.needs_manual_review, qe.created_at, qe.updated_at
       FROM ${AI_EVALUATION_TABLES.questionEvaluations} qe
       INNER JOIN interview_attempts ia ON ia.id = qe.interview_attempt_id
       WHERE qe.company_id = ? AND ia.interview_id = ?
       ORDER BY qe.interview_question_id ASC, qe.created_at ASC`,
      [companyId, interviewId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  async findByAttemptId(
    companyId: number,
    attemptId: number,
  ): Promise<QuestionEvaluationEntity[]> {
    const rows = await this.database.query<QuestionEvaluationRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_message_id,
              interview_question_id, score, max_score, short_summary, review,
              raw_response, needs_manual_review, created_at, updated_at
       FROM ${AI_EVALUATION_TABLES.questionEvaluations}
       WHERE company_id = ? AND interview_attempt_id = ?
       ORDER BY interview_question_id ASC, created_at ASC`,
      [companyId, attemptId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: QuestionEvaluationRow): QuestionEvaluationEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewMessageId: row.interview_message_id,
      interviewQuestionId: row.interview_question_id,
      score: Number(row.score),
      maxScore: Number(row.max_score),
      shortSummary: row.short_summary,
      review: row.review,
      rawResponse: this.parseRawResponse(row.raw_response),
      needsManualReview: row.needs_manual_review === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private parseRawResponse(
    value: string | Record<string, unknown> | null,
  ): Record<string, unknown> | null {
    if (value === null) {
      return null;
    }

    if (typeof value === 'object') {
      return value;
    }

    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
