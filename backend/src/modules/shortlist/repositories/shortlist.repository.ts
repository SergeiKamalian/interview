import { Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { SHORTLIST_TABLES } from '../shortlist.schema';

interface CandidateRow extends RowDataPacket {
  id: number;
}

@Injectable()
export class ShortlistRepository {
  constructor(private readonly database: DatabaseService) {}

  async assertCandidateInCompany(companyId: number, candidateId: number) {
    const rows = await this.database.query<CandidateRow[]>(
      `SELECT id FROM candidates WHERE id = ? AND company_id = ? LIMIT 1`,
      [candidateId, companyId],
    );

    if (!rows[0]) {
      throw new NotFoundException('Candidate not found');
    }
  }

  async upsertShortlist(input: {
    companyId: number;
    candidateId: number;
    status: 'shortlisted' | 'removed';
    reason: string | null;
    createdBy: number;
  }) {
    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${SHORTLIST_TABLES.candidateShortlist}
         (company_id, candidate_id, status, reason, created_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         reason = VALUES(reason),
         created_by = VALUES(created_by),
         updated_at = CURRENT_TIMESTAMP`,
      [
        input.companyId,
        input.candidateId,
        input.status,
        input.reason,
        input.createdBy,
      ],
    );
  }

  async appendEvent(input: {
    companyId: number;
    candidateId: number;
    action: 'added' | 'removed' | 'note_added';
    reason: string | null;
    createdBy: number;
  }) {
    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${SHORTLIST_TABLES.candidateShortlistEvents}
         (company_id, candidate_id, action, reason, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.candidateId,
        input.action,
        input.reason,
        input.createdBy,
      ],
    );
  }
}
