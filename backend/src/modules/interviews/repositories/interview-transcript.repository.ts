import { Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';

interface MessageRow extends RowDataPacket {
  id: number;
  role: string;
  content: string;
  sequence_order: number;
  created_at: Date;
  interview_question_id: number | null;
  question_text: string | null;
}

@Injectable()
export class InterviewTranscriptRepository {
  constructor(private readonly database: DatabaseService) {}

  async getTranscript(companyId: number, attemptId: number) {
    const attemptRows = await this.database.query<RowDataPacket[]>(
      `SELECT id FROM interview_attempts WHERE id = ? AND company_id = ? LIMIT 1`,
      [attemptId, companyId],
    );

    if (!attemptRows[0]) {
      throw new NotFoundException('Interview attempt not found');
    }

    const rows = await this.database.query<MessageRow[]>(
      `SELECT im.id,
              im.role,
              im.content,
              im.sequence_order,
              im.created_at,
              im.interview_question_id,
              iq.question_text
       FROM interview_messages im
       LEFT JOIN interview_questions iq ON iq.id = im.interview_question_id
       WHERE im.interview_attempt_id = ? AND im.company_id = ?
       ORDER BY im.sequence_order ASC`,
      [attemptId, companyId],
    );

    return rows;
  }
}
