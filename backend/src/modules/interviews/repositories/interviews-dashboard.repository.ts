import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import type { CompanyInterviewsFilterInput } from '../graphql/company-interviews.input';
import type { CompanyInterviewSummariesFilterInput } from '../graphql/company-interview-summaries.input';
import { CompanyInterviewsSortField } from '../graphql/company-interviews.input';
import { CompanyInterviewSummariesSortField } from '../graphql/company-interview-summaries.input';

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

interface SummaryListRow extends RowDataPacket {
  interview_id: number;
  title: string;
  job_role: string;
  status: string;
  level: string;
  interview_language: string;
  question_count: number;
  public_token: string;
  created_at: Date;
  attempts_total: number;
  attempts_completed: number;
  attempts_in_progress: number;
  attempts_abandoned: number;
  attempts_pending: number;
  completion_rate: string | null;
  shortlisted_count: number;
  strong_invite_count: number;
  needs_manual_review_count: number;
  avg_score: string | null;
  last_activity_at: Date | null;
}

export type CompanyInterviewSummaryRow = {
  interviewId: number;
  title: string;
  jobRole: string;
  status: string;
  level: string;
  interviewLanguage: string;
  questionCount: number;
  publicToken: string;
  createdAt: Date;
  attemptsTotal: number;
  attemptsCompleted: number;
  attemptsInProgress: number;
  attemptsAbandoned: number;
  attemptsPending: number;
  completionRate: number | null;
  shortlistedCount: number;
  strongInviteCount: number;
  needsManualReviewCount: number;
  avgScore: number | null;
  lastActivityAt: Date | null;
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

    const conditions = ['ia.company_id = ?', 'ia.is_preview = 0'];
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
    const sortDirection =
      filters.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

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

  async listInterviewSummariesForCompany(
    companyId: number,
    filters: CompanyInterviewSummariesFilterInput,
  ): Promise<{ items: CompanyInterviewSummaryRow[]; total: number }> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 100);
    const offset = (page - 1) * pageSize;

    const conditions = ['i.company_id = ?'];
    const params: DbQueryParam[] = [companyId, companyId];

    if (filters.status) {
      conditions.push('i.status = ?');
      params.push(filters.status);
    }

    if (filters.level) {
      conditions.push('i.level = ?');
      params.push(filters.level);
    }

    if (filters.interviewLanguage?.trim()) {
      conditions.push('i.interview_language = ?');
      params.push(filters.interviewLanguage.trim());
    }

    if (filters.hasAttemptsOnly) {
      conditions.push('COALESCE(stats.attempts_total, 0) > 0');
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push('(i.title LIKE ? OR i.job_role LIKE ?)');
      params.push(term, term);
    }

    const whereClause = conditions.join(' AND ');
    const sortField = this.resolveSummarySortField(filters.sort);
    const sortDirection =
      filters.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const fromClause = `
      FROM interviews i
      LEFT JOIN (
        SELECT ia.interview_id,
               COUNT(*) AS attempts_total,
               SUM(ia.status = 'completed') AS attempts_completed,
               SUM(ia.status = 'in_progress') AS attempts_in_progress,
               SUM(ia.status = 'abandoned') AS attempts_abandoned,
               SUM(ia.status = 'pending') AS attempts_pending,
               CASE
                 WHEN SUM(ia.status IN ('completed', 'abandoned', 'in_progress')) > 0
                 THEN ROUND(
                   100.0 * SUM(ia.status = 'completed') /
                   SUM(ia.status IN ('completed', 'abandoned', 'in_progress')),
                   1
                 )
                 ELSE NULL
               END AS completion_rate,
               COUNT(
                 DISTINCT CASE
                   WHEN cs.status = 'shortlisted' THEN ia.candidate_id
                 END
               ) AS shortlisted_count,
               SUM(fe.hire_recommendation = 'strong_invite') AS strong_invite_count,
               SUM(fe.needs_manual_review = 1) AS needs_manual_review_count,
               AVG(fe.total_score) AS avg_score,
               MAX(
                 GREATEST(
                   COALESCE(ia.started_at, ia.created_at),
                   COALESCE(ia.completed_at, ia.created_at)
                 )
               ) AS last_activity_at
        FROM interview_attempts ia
        LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
        LEFT JOIN candidate_shortlist cs
          ON cs.candidate_id = ia.candidate_id
         AND cs.company_id = ia.company_id
        WHERE ia.company_id = ? AND ia.is_preview = 0
        GROUP BY ia.interview_id
      ) stats ON stats.interview_id = i.id
    `;

    const countRows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total ${fromClause} WHERE ${whereClause}`,
      params,
    );

    const rows = await this.database.query<SummaryListRow[]>(
      `SELECT i.id AS interview_id,
              i.title,
              i.job_role,
              i.status,
              i.level,
              i.interview_language,
              i.question_count,
              i.public_token,
              i.created_at,
              COALESCE(stats.attempts_total, 0) AS attempts_total,
              COALESCE(stats.attempts_completed, 0) AS attempts_completed,
              COALESCE(stats.attempts_in_progress, 0) AS attempts_in_progress,
              COALESCE(stats.attempts_abandoned, 0) AS attempts_abandoned,
              COALESCE(stats.attempts_pending, 0) AS attempts_pending,
              stats.completion_rate,
              COALESCE(stats.shortlisted_count, 0) AS shortlisted_count,
              COALESCE(stats.strong_invite_count, 0) AS strong_invite_count,
              COALESCE(stats.needs_manual_review_count, 0) AS needs_manual_review_count,
              stats.avg_score,
              stats.last_activity_at
       ${fromClause}
       WHERE ${whereClause}
       ORDER BY ${sortField} ${sortDirection}, i.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params,
    );

    return {
      items: rows.map((row) => this.mapSummaryRow(row)),
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async getInterviewSummaryFacets(companyId: number): Promise<{
    total: number;
    active: number;
    draft: number;
    archived: number;
    withAttempts: number;
  }> {
    interface FacetsRow extends RowDataPacket {
      total: number;
      active: number;
      draft: number;
      archived: number;
      with_attempts: number;
    }

    const rows = await this.database.query<FacetsRow[]>(
      `SELECT
         COUNT(*) AS total,
         SUM(i.status = 'active') AS active,
         SUM(i.status = 'draft') AS draft,
         SUM(i.status = 'archived') AS archived,
         SUM(COALESCE(stats.attempts_total, 0) > 0) AS with_attempts
       FROM interviews i
       LEFT JOIN (
         SELECT ia.interview_id,
                COUNT(*) AS attempts_total
         FROM interview_attempts ia
         WHERE ia.company_id = ? AND ia.is_preview = 0
         GROUP BY ia.interview_id
       ) stats ON stats.interview_id = i.id
       WHERE i.company_id = ?`,
      [companyId, companyId],
    );

    const row = rows[0];

    return {
      total: Number(row?.total ?? 0),
      active: Number(row?.active ?? 0),
      draft: Number(row?.draft ?? 0),
      archived: Number(row?.archived ?? 0),
      withAttempts: Number(row?.with_attempts ?? 0),
    };
  }

  private resolveSummarySortField(sort?: string): string {
    switch (sort) {
      case CompanyInterviewSummariesSortField.CREATED_AT:
        return 'i.created_at';
      case CompanyInterviewSummariesSortField.ATTEMPTS_TOTAL:
        return 'COALESCE(stats.attempts_total, 0)';
      case CompanyInterviewSummariesSortField.AVG_SCORE:
        return 'stats.avg_score';
      case CompanyInterviewSummariesSortField.COMPLETION_RATE:
        return 'stats.completion_rate';
      case CompanyInterviewSummariesSortField.LAST_ACTIVITY_AT:
      default:
        return 'COALESCE(stats.last_activity_at, i.created_at)';
    }
  }

  private mapSummaryRow(row: SummaryListRow): CompanyInterviewSummaryRow {
    return {
      interviewId: row.interview_id,
      title: row.title,
      jobRole: row.job_role,
      status: row.status,
      level: row.level,
      interviewLanguage: row.interview_language,
      questionCount: row.question_count,
      publicToken: row.public_token,
      createdAt: row.created_at,
      attemptsTotal: Number(row.attempts_total),
      attemptsCompleted: Number(row.attempts_completed),
      attemptsInProgress: Number(row.attempts_in_progress),
      attemptsAbandoned: Number(row.attempts_abandoned),
      attemptsPending: Number(row.attempts_pending),
      completionRate:
        row.completion_rate != null ? Number(row.completion_rate) : null,
      shortlistedCount: Number(row.shortlisted_count),
      strongInviteCount: Number(row.strong_invite_count),
      needsManualReviewCount: Number(row.needs_manual_review_count),
      avgScore: row.avg_score != null ? Number(row.avg_score) : null,
      lastActivityAt: row.last_activity_at,
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
