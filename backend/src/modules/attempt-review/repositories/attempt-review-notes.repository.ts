import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import {
  ATTEMPT_REVIEW_NOTE_BODY_MAX_LENGTH,
  ATTEMPT_REVIEW_TABLES,
} from '../attempt-review.schema';
import { AttemptReviewRepository } from './attempt-review.repository';

interface NoteRow extends RowDataPacket {
  id: number;
  interview_attempt_id: number;
  body: string;
  created_by: number;
  author_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface AttemptReviewNoteRecord {
  id: number;
  attemptId: number;
  body: string;
  authorId: number;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AttemptReviewNotesRepository {
  constructor(
    private readonly database: DatabaseService,
    private readonly attemptReviewRepository: AttemptReviewRepository,
  ) {}

  private normalizeBody(body: string): string {
    const normalized = body.trim();

    if (!normalized) {
      throw new BadRequestException('Note body must not be empty');
    }

    if (normalized.length > ATTEMPT_REVIEW_NOTE_BODY_MAX_LENGTH) {
      throw new BadRequestException(
        `Note body must be at most ${ATTEMPT_REVIEW_NOTE_BODY_MAX_LENGTH} characters`,
      );
    }

    return normalized;
  }

  private mapRow(row: NoteRow): AttemptReviewNoteRecord {
    return {
      id: row.id,
      attemptId: row.interview_attempt_id,
      body: row.body,
      authorId: row.created_by,
      authorName: row.author_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listForAttempt(
    companyId: number,
    attemptId: number,
  ): Promise<AttemptReviewNoteRecord[]> {
    await this.attemptReviewRepository.assertReviewableAttempt(
      companyId,
      attemptId,
    );

    const rows = await this.database.query<NoteRow[]>(
      `SELECT n.id,
              n.interview_attempt_id,
              n.body,
              n.created_by,
              u.full_name AS author_name,
              n.created_at,
              n.updated_at
       FROM ${ATTEMPT_REVIEW_TABLES.notes} n
       INNER JOIN users u ON u.id = n.created_by
       WHERE n.company_id = ? AND n.interview_attempt_id = ?
       ORDER BY n.created_at ASC, n.id ASC`,
      [companyId, attemptId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  async create(input: {
    companyId: number;
    attemptId: number;
    userId: number;
    body: string;
  }): Promise<AttemptReviewNoteRecord> {
    await this.attemptReviewRepository.assertReviewableAttempt(
      input.companyId,
      input.attemptId,
    );

    const body = this.normalizeBody(input.body);

    const result = await this.database.query<ResultSetHeader>(
      `INSERT INTO ${ATTEMPT_REVIEW_TABLES.notes}
         (company_id, interview_attempt_id, body, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?)`,
      [input.companyId, input.attemptId, body, input.userId, input.userId],
    );

    const note = await this.findById(input.companyId, Number(result.insertId));

    if (!note) {
      throw new NotFoundException('Attempt review note not found');
    }

    return note;
  }

  async update(input: {
    companyId: number;
    noteId: number;
    userId: number;
    body: string;
  }): Promise<AttemptReviewNoteRecord> {
    const existing = await this.findById(input.companyId, input.noteId);

    if (!existing) {
      throw new NotFoundException('Attempt review note not found');
    }

    if (existing.authorId !== input.userId) {
      throw new ForbiddenException('Only the note author can edit this note');
    }

    const body = this.normalizeBody(input.body);

    await this.database.query<ResultSetHeader>(
      `UPDATE ${ATTEMPT_REVIEW_TABLES.notes}
       SET body = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND company_id = ?`,
      [body, input.userId, input.noteId, input.companyId],
    );

    const note = await this.findById(input.companyId, input.noteId);

    if (!note) {
      throw new NotFoundException('Attempt review note not found');
    }

    return note;
  }

  private async findById(
    companyId: number,
    noteId: number,
  ): Promise<AttemptReviewNoteRecord | null> {
    const rows = await this.database.query<NoteRow[]>(
      `SELECT n.id,
              n.interview_attempt_id,
              n.body,
              n.created_by,
              u.full_name AS author_name,
              n.created_at,
              n.updated_at
       FROM ${ATTEMPT_REVIEW_TABLES.notes} n
       INNER JOIN users u ON u.id = n.created_by
       WHERE n.company_id = ? AND n.id = ?
       LIMIT 1`,
      [companyId, noteId],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }
}
