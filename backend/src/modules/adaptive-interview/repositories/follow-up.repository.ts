import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import { ADAPTIVE_INTERVIEW_TABLES } from '../adaptive-interview.schema';
import type {
  CreateInterviewFollowUpData,
  InterviewFollowUpEntity,
} from '../entities/interview-follow-up.entity';

interface FollowUpRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  interview_question_id: number;
  checkpoint_key: string;
  follow_up_question_message_id: number | null;
  candidate_answer_message_id: number | null;
  question_text: string;
  reason: string;
  status: InterviewFollowUpEntity['status'];
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

@Injectable()
export class FollowUpRepository {
  constructor(private readonly database: DatabaseService) {}

  async countUsedForQuestion(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<number> {
    const rows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       WHERE interview_attempt_id = ?
         AND interview_question_id = ?
         AND status IN ('planned', 'asked', 'answered')`,
      [attemptId, interviewQuestionId],
    );

    return Number(rows[0]?.total ?? 0);
  }

  async listByAttemptAndQuestion(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<InterviewFollowUpEntity[]> {
    const rows = await this.database.query<FollowUpRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id, checkpoint_key,
              follow_up_question_message_id, candidate_answer_message_id, question_text,
              reason, status, sort_order, created_at, updated_at
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       WHERE interview_attempt_id = ? AND interview_question_id = ?
       ORDER BY sort_order ASC`,
      [attemptId, interviewQuestionId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  async create(
    input: CreateInterviewFollowUpData,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewFollowUpEntity> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps} (
         company_id, interview_attempt_id, interview_question_id, checkpoint_key,
         question_text, reason, status, sort_order
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.interviewAttemptId,
        input.interviewQuestionId,
        input.checkpointKey,
        input.questionText,
        input.reason,
        input.status,
        input.sortOrder,
      ],
    );

    const rows = await query<FollowUpRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id, checkpoint_key,
              follow_up_question_message_id, candidate_answer_message_id, question_text,
              reason, status, sort_order, created_at, updated_at
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       WHERE id = ?
       LIMIT 1`,
      [Number(result.insertId)],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load follow-up after insert');
    }

    return this.mapRow(row);
  }

  async findAwaitingAnswer(
    attemptId: number,
  ): Promise<InterviewFollowUpEntity | null> {
    const rows = await this.database.query<FollowUpRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id, checkpoint_key,
              follow_up_question_message_id, candidate_answer_message_id, question_text,
              reason, status, sort_order, created_at, updated_at
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       WHERE interview_attempt_id = ?
         AND candidate_answer_message_id IS NULL
         AND status IN ('planned', 'asked')
       ORDER BY sort_order DESC
       LIMIT 1`,
      [attemptId],
    );

    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async markAsked(
    followUpId: number,
    followUpQuestionMessageId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       SET status = 'asked', follow_up_question_message_id = ?
       WHERE id = ?`,
      [followUpQuestionMessageId, followUpId],
    );
  }

  async markAnswered(
    followUpId: number,
    candidateAnswerMessageId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       SET status = 'answered', candidate_answer_message_id = ?
       WHERE id = ?`,
      [candidateAnswerMessageId, followUpId],
    );
  }

  async markSkipped(
    followUpId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       SET status = 'skipped'
       WHERE id = ?`,
      [followUpId],
    );
  }

  async markFailed(
    followUpId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewFollowUps}
       SET status = 'failed'
       WHERE id = ?`,
      [followUpId],
    );
  }

  private mapRow(row: FollowUpRow): InterviewFollowUpEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewQuestionId: row.interview_question_id,
      checkpointKey: row.checkpoint_key,
      followUpQuestionMessageId: row.follow_up_question_message_id,
      candidateAnswerMessageId: row.candidate_answer_message_id,
      questionText: row.question_text,
      reason: row.reason,
      status: row.status,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
