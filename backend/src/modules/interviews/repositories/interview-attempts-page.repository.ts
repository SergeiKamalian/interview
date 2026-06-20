import type { RowDataPacket } from 'mysql2/promise';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import type { InterviewAttemptsFilterInput } from '../graphql/interview-attempts-page.input';

export interface InterviewAttemptPageRow extends RowDataPacket {
  id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  status: string;
  started_at: Date | null;
  completed_at: Date | null;
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
  has_team_notes: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

@Injectable()
export class InterviewAttemptsPageRepository {
  constructor(private readonly database: DatabaseService) {}

  async assertInterviewInCompany(companyId: number, interviewId: number) {
    const rows = await this.database.query<RowDataPacket[]>(
      `SELECT id FROM interviews WHERE id = ? AND company_id = ? LIMIT 1`,
      [interviewId, companyId],
    );

    if (!rows[0]) {
      throw new NotFoundException('Interview not found');
    }
  }

  async listForInterview(
    companyId: number,
    interviewId: number,
    filters: InterviewAttemptsFilterInput,
  ): Promise<{ items: InterviewAttemptPageRow[]; total: number }> {
    await this.assertInterviewInCompany(companyId, interviewId);

    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const offset = (page - 1) * pageSize;

    const conditions = [
      'ia.company_id = ?',
      'ia.interview_id = ?',
      'ia.is_preview = 0',
    ];
    const params: DbQueryParam[] = [companyId, interviewId];

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push('(c.full_name LIKE ? OR c.email LIKE ?)');
      params.push(term, term);
    }

    if (filters.hireRecommendation?.trim()) {
      conditions.push('fe.hire_recommendation = ?');
      params.push(filters.hireRecommendation.trim());
    }

    if (filters.unreviewedOnly) {
      conditions.push(
        "(iar.review_status IS NULL OR iar.review_status IN ('pending', 'in_review'))",
      );
    }

    if (filters.disagreeOnly) {
      conditions.push("iar.ai_assessment_verdict = 'disagree'");
    }

    const whereClause = conditions.join(' AND ');
    const sortField =
      filters.sort === 'completed_at'
        ? 'ia.completed_at'
        : filters.sort === 'name'
          ? 'c.full_name'
          : 'fe.total_score';
    const sortDirection =
      filters.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const fromClause = `
      FROM interview_attempts ia
      INNER JOIN candidates c ON c.id = ia.candidate_id AND c.company_id = ia.company_id
      LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id AND fe.company_id = ia.company_id
      LEFT JOIN candidate_shortlist cs ON cs.candidate_id = c.id AND cs.company_id = ia.company_id
      LEFT JOIN interview_attempt_reviews iar
        ON iar.interview_attempt_id = ia.id AND iar.company_id = ia.company_id
    `;

    const countRows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total ${fromClause} WHERE ${whereClause}`,
      params,
    );

    const rows = await this.database.query<InterviewAttemptPageRow[]>(
      `SELECT ia.id,
              ia.candidate_id,
              c.full_name AS candidate_name,
              c.email AS candidate_email,
              ia.status,
              ia.started_at,
              ia.completed_at,
              fe.total_score,
              fe.hire_recommendation,
              fe.achieved_level,
              fe.achieved_level_method,
              fe.needs_manual_review,
              COALESCE(cs.status, 'none') AS shortlist_status,
              iar.review_status,
              iar.ai_assessment_verdict,
              iar.company_decision,
              iar.reviewed_at,
              EXISTS(
                SELECT 1
                FROM interview_attempt_review_notes n
                WHERE n.company_id = ia.company_id
                  AND n.interview_attempt_id = ia.id
              ) AS has_team_notes
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
