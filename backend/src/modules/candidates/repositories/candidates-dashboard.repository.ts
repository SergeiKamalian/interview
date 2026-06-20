import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import type { CompanyCandidatesFilterInput } from '../graphql/candidates-dashboard.input';

interface ListRow extends RowDataPacket {
  candidate_id: number;
  full_name: string;
  email: string;
  interviews_count: number;
  avg_score: string | null;
  last_interview_date: Date | null;
  shortlist_status: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

@Injectable()
export class CandidatesDashboardRepository {
  constructor(private readonly database: DatabaseService) {}

  async listForCompany(
    companyId: number,
    filters: CompanyCandidatesFilterInput,
  ): Promise<{ items: ListRow[]; total: number }> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const offset = (page - 1) * pageSize;

    const conditions = ['c.company_id = ?'];
    const params: DbQueryParam[] = [companyId, companyId];

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push('(c.full_name LIKE ? OR c.email LIKE ?)');
      params.push(term, term);
    }

    if (filters.minScore != null) {
      conditions.push('stats.avg_score >= ?');
      params.push(filters.minScore);
    }

    if (filters.maxScore != null) {
      conditions.push('stats.avg_score <= ?');
      params.push(filters.maxScore);
    }

    if (filters.shortlistedOnly) {
      conditions.push("COALESCE(cs.status, 'none') = 'shortlisted'");
    }

    const whereClause = conditions.join(' AND ');
    const sortField =
      filters.sort === 'last_interview_date'
        ? 'stats.last_interview_date'
        : 'stats.avg_score';
    const sortDirection =
      filters.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const fromClause = `
      FROM candidates c
      INNER JOIN (
        SELECT ia.candidate_id,
               COUNT(DISTINCT ia.id) AS interviews_count,
               AVG(fe.total_score) AS avg_score,
               MAX(ia.completed_at) AS last_interview_date
        FROM interview_attempts ia
        LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
        WHERE ia.company_id = ? AND ia.is_preview = 0
        GROUP BY ia.candidate_id
      ) stats ON stats.candidate_id = c.id
      LEFT JOIN candidate_shortlist cs ON cs.candidate_id = c.id AND cs.company_id = c.company_id
    `;

    const countRows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total ${fromClause} WHERE ${whereClause}`,
      params,
    );

    const rows = await this.database.query<ListRow[]>(
      `SELECT c.id AS candidate_id,
              c.full_name,
              c.email,
              stats.interviews_count,
              stats.avg_score,
              stats.last_interview_date,
              COALESCE(cs.status, 'none') AS shortlist_status
       ${fromClause}
       WHERE ${whereClause}
       ORDER BY ${sortField} ${sortDirection}, c.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params,
    );

    return {
      items: rows,
      total: Number(countRows[0]?.total ?? 0),
    };
  }
}
