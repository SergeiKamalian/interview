import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import type { CompanyReviewQueueFilterInput } from '../graphql/company-review-queue.input';

export interface CompanyReviewQueueRow extends RowDataPacket {
  attempt_id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  interview_id: number;
  interview_title: string;
  job_role: string;
  completed_at: Date | null;
  final_evaluation_id: number | null;
  total_score: string | null;
  hire_recommendation: string | null;
  achieved_level: string | null;
  achieved_level_method: string | null;
  needs_manual_review: number | null;
  shortlist_status: string;
  review_status: string | null;
  ai_assessment_verdict: string | null;
  company_decision: string | null;
  reviewed_at: Date | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

@Injectable()
export class CompanyReviewQueueRepository {
  constructor(private readonly database: DatabaseService) {}

  async listForCompany(
    companyId: number,
    filters: CompanyReviewQueueFilterInput,
  ): Promise<{ items: CompanyReviewQueueRow[]; total: number }> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const offset = (page - 1) * pageSize;

    const conditions = [
      'ia.company_id = ?',
      "ia.status = 'completed'",
      'ia.is_preview = 0',
    ];
    const params: DbQueryParam[] = [companyId];

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        '(c.full_name LIKE ? OR c.email LIKE ? OR i.title LIKE ? OR i.job_role LIKE ?)',
      );
      params.push(term, term, term, term);
    }

    if (filters.evaluationStatus === 'ready') {
      conditions.push('fe.id IS NOT NULL');
    }

    if (filters.evaluationStatus === 'evaluation_pending') {
      conditions.push('fe.id IS NULL');
    }

    if (filters.shortlistedOnly) {
      conditions.push("COALESCE(cs.status, 'none') = 'shortlisted'");
    }

    if (filters.manualReviewOnly) {
      conditions.push('COALESCE(fe.needs_manual_review, 0) = 1');
    }

    if (filters.unreviewedOnly) {
      conditions.push(
        "(iar.review_status IS NULL OR iar.review_status IN ('pending', 'in_review'))",
      );
    }

    const whereClause = conditions.join(' AND ');
    const sortField =
      filters.sort === 'score' ? 'fe.total_score' : 'ia.completed_at';
    const sortDirection =
      filters.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const fromClause = `
      FROM interview_attempts ia
      INNER JOIN candidates c ON c.id = ia.candidate_id AND c.company_id = ia.company_id
      INNER JOIN interviews i ON i.id = ia.interview_id AND i.company_id = ia.company_id
      LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id AND fe.company_id = ia.company_id
      LEFT JOIN candidate_shortlist cs ON cs.candidate_id = c.id AND cs.company_id = ia.company_id
      LEFT JOIN interview_attempt_reviews iar
        ON iar.interview_attempt_id = ia.id AND iar.company_id = ia.company_id
    `;

    const countRows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total ${fromClause} WHERE ${whereClause}`,
      params,
    );

    const rows = await this.database.query<CompanyReviewQueueRow[]>(
      `SELECT ia.id AS attempt_id,
              c.id AS candidate_id,
              c.full_name AS candidate_name,
              c.email AS candidate_email,
              i.id AS interview_id,
              i.title AS interview_title,
              i.job_role,
              ia.completed_at,
              fe.id AS final_evaluation_id,
              fe.total_score,
              fe.hire_recommendation,
              fe.achieved_level,
              fe.achieved_level_method,
              fe.needs_manual_review,
              COALESCE(cs.status, 'none') AS shortlist_status,
              iar.review_status,
              iar.ai_assessment_verdict,
              iar.company_decision,
              iar.reviewed_at
       ${fromClause}
       WHERE ${whereClause}
       ORDER BY ${sortField} ${sortDirection}, ia.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params,
    );

    return {
      items: rows,
      total: Number(countRows[0]?.total ?? 0),
    };
  }
}
