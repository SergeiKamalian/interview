import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { ATTEMPT_REVIEW_TABLES } from '../attempt-review.schema';

export type AttemptShareTokenRecord = {
  id: number;
  companyId: number;
  interviewAttemptId: number;
  token: string;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdBy: number | null;
  createdAt: Date;
};

export type AttemptShareContextRow = {
  attemptId: number;
  companyId: number;
  interviewId: number;
  status: string;
  isPreview: boolean;
  completedAt: Date | null;
  candidateName: string;
  interviewTitle: string;
  jobRole: string;
  interviewLevel: string;
};

interface ShareTokenRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  token: string;
  expires_at: Date | null;
  revoked_at: Date | null;
  created_by: number | null;
  created_at: Date;
}

interface AttemptContextRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_id: number;
  status: string;
  is_preview: number;
  completed_at: Date | null;
  candidate_name: string;
  interview_title: string;
  job_role: string;
  interview_level: string;
}

@Injectable()
export class AttemptShareRepository {
  constructor(private readonly database: DatabaseService) {}

  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async findAttemptContext(
    companyId: number,
    attemptId: number,
  ): Promise<AttemptShareContextRow | null> {
    const rows = await this.database.query<AttemptContextRow[]>(
      `SELECT ia.id,
              ia.company_id,
              ia.interview_id,
              ia.status,
              ia.is_preview,
              ia.completed_at,
              c.full_name AS candidate_name,
              i.title AS interview_title,
              i.job_role,
              i.level AS interview_level
       FROM interview_attempts ia
       INNER JOIN candidates c ON c.id = ia.candidate_id
       INNER JOIN interviews i ON i.id = ia.interview_id
       WHERE ia.id = ? AND ia.company_id = ?
       LIMIT 1`,
      [attemptId, companyId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      attemptId: row.id,
      companyId: row.company_id,
      interviewId: row.interview_id,
      status: row.status,
      isPreview: row.is_preview === 1,
      completedAt: row.completed_at,
      candidateName: row.candidate_name,
      interviewTitle: row.interview_title,
      jobRole: row.job_role,
      interviewLevel: row.interview_level,
    };
  }

  async findActiveTokenByAttempt(
    companyId: number,
    attemptId: number,
  ): Promise<AttemptShareTokenRecord | null> {
    const rows = await this.database.query<ShareTokenRow[]>(
      `SELECT id, company_id, interview_attempt_id, token, expires_at, revoked_at,
              created_by, created_at
       FROM ${ATTEMPT_REVIEW_TABLES.shareTokens}
       WHERE company_id = ? AND interview_attempt_id = ?
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC
       LIMIT 1`,
      [companyId, attemptId],
    );

    const row = rows[0];
    return row ? this.mapTokenRow(row) : null;
  }

  async findValidTokenByValue(token: string): Promise<AttemptShareTokenRecord | null> {
    const rows = await this.database.query<ShareTokenRow[]>(
      `SELECT id, company_id, interview_attempt_id, token, expires_at, revoked_at,
              created_by, created_at
       FROM ${ATTEMPT_REVIEW_TABLES.shareTokens}
       WHERE token = ?
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       LIMIT 1`,
      [token],
    );

    const row = rows[0];
    return row ? this.mapTokenRow(row) : null;
  }

  async findAttemptContextByToken(
    token: string,
  ): Promise<(AttemptShareContextRow & { tokenRecord: AttemptShareTokenRecord }) | null> {
    const tokenRecord = await this.findValidTokenByValue(token);
    if (!tokenRecord) {
      return null;
    }

    const rows = await this.database.query<AttemptContextRow[]>(
      `SELECT ia.id,
              ia.company_id,
              ia.interview_id,
              ia.status,
              ia.is_preview,
              ia.completed_at,
              c.full_name AS candidate_name,
              i.title AS interview_title,
              i.job_role,
              i.level AS interview_level
       FROM interview_attempts ia
       INNER JOIN candidates c ON c.id = ia.candidate_id
       INNER JOIN interviews i ON i.id = ia.interview_id
       WHERE ia.id = ? AND ia.company_id = ?
         AND ia.status = 'completed' AND ia.is_preview = 0
       LIMIT 1`,
      [tokenRecord.interviewAttemptId, tokenRecord.companyId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      attemptId: row.id,
      companyId: row.company_id,
      interviewId: row.interview_id,
      status: row.status,
      isPreview: row.is_preview === 1,
      completedAt: row.completed_at,
      candidateName: row.candidate_name,
      interviewTitle: row.interview_title,
      jobRole: row.job_role,
      interviewLevel: row.interview_level,
      tokenRecord,
    };
  }

  async revokeActiveTokens(companyId: number, attemptId: number): Promise<number> {
    const result = await this.database.query<ResultSetHeader>(
      `UPDATE ${ATTEMPT_REVIEW_TABLES.shareTokens}
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE company_id = ? AND interview_attempt_id = ? AND revoked_at IS NULL`,
      [companyId, attemptId],
    );

    return result.affectedRows;
  }

  async createToken(input: {
    companyId: number;
    attemptId: number;
    createdBy: number;
    expiresAt: Date | null;
  }): Promise<AttemptShareTokenRecord> {
    const token = this.generateToken();

    const result = await this.database.query<ResultSetHeader>(
      `INSERT INTO ${ATTEMPT_REVIEW_TABLES.shareTokens}
         (company_id, interview_attempt_id, token, expires_at, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.attemptId,
        token,
        input.expiresAt,
        input.createdBy,
      ],
    );

    const rows = await this.database.query<ShareTokenRow[]>(
      `SELECT id, company_id, interview_attempt_id, token, expires_at, revoked_at,
              created_by, created_at
       FROM ${ATTEMPT_REVIEW_TABLES.shareTokens}
       WHERE id = ?
       LIMIT 1`,
      [result.insertId],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load share token after insert');
    }

    return this.mapTokenRow(row);
  }

  private mapTokenRow(row: ShareTokenRow): AttemptShareTokenRecord {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      token: row.token,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
