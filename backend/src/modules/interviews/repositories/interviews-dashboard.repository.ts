import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import type { CompanyInterviewsFilterInput } from '../graphql/company-interviews.input';
import { CompanyInterviewsSortField } from '../graphql/company-interviews.input';

interface ListRow extends RowDataPacket {
  attempt_id: number;
  interview_id: number;
  interview_title: string;
  job_role: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  started_at: Date | null;
  completed_at: Date | null;
  total_score: string | null;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export type CompanyInterviewListRow = {
  attemptId: number;
  interviewId: number;
  interviewTitle: string;
  jobRole: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  overallScore: number | null;
  createdAt: Date;
};

@Injectable()
export class InterviewsDashboardRepository {
  constructor(private readonly database: DatabaseService) {}

  async listForCompany(
    companyId: number,
    filters: CompanyInterviewsFilterInput,
  ): Promise<{ items: CompanyInterviewListRow[]; total: number }> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const offset = (page - 1) * pageSize;

    const conditions = ['ia.company_id = ?'];
    const params: DbQueryParam[] = [companyId];

    if (filters.status) {
      conditions.push('ia.status = ?');
      params.push(filters.status);
    }

    if (filters.dateFrom) {
      conditions.push('ia.created_at >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('ia.created_at <= ?');
      params.push(`${filters.dateTo} 23:59:59`);
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        '(c.full_name LIKE ? OR c.email LIKE ? OR i.job_role LIKE ? OR i.title LIKE ?)',
      );
      params.push(term, term, term, term);
    }

    const whereClause = conditions.join(' AND ');
    const sortField =
      filters.sort === CompanyInterviewsSortField.OVERALL_SCORE
        ? 'fe.total_score'
        : 'ia.created_at';
    const sortDirection = filters.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countRows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM interview_attempts ia
       INNER JOIN candidates c ON c.id = ia.candidate_id
       INNER JOIN interviews i ON i.id = ia.interview_id
       LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
       WHERE ${whereClause}`,
      params,
    );

    const rows = await this.database.query<ListRow[]>(
      `SELECT ia.id AS attempt_id,
              ia.interview_id,
              i.title AS interview_title,
              i.job_role,
              c.full_name AS candidate_name,
              c.email AS candidate_email,
              ia.status,
              ia.started_at,
              ia.completed_at,
              fe.total_score,
              ia.created_at
       FROM interview_attempts ia
       INNER JOIN candidates c ON c.id = ia.candidate_id
       INNER JOIN interviews i ON i.id = ia.interview_id
       LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
       WHERE ${whereClause}
       ORDER BY ${sortField} ${sortDirection}, ia.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params,
    );

    return {
      items: rows.map((row) => this.mapRow(row)),
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  private mapRow(row: ListRow): CompanyInterviewListRow {
    return {
      attemptId: row.attempt_id,
      interviewId: row.interview_id,
      interviewTitle: row.interview_title,
      jobRole: row.job_role,
      candidateName: row.candidate_name,
      candidateEmail: row.candidate_email,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      overallScore: row.total_score != null ? Number(row.total_score) : null,
      createdAt: row.created_at,
    };
  }
}
