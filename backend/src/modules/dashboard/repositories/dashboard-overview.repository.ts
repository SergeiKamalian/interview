import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DashboardAttentionKindEnum } from '../graphql/dashboard-attention-kind.enum';

interface MetricsRow extends RowDataPacket {
  candidates_total: number;
  completed_total: number;
  in_progress_total: number;
  abandoned_total: number;
  needs_review_total: number;
  strong_invite_total: number;
  shortlisted_total: number;
  completion_rate: string | null;
  interviews_total: number;
  active_interviews_total: number;
}

interface AttentionRow extends RowDataPacket {
  attempt_id: number;
  interview_id: number;
  interview_title: string;
  job_role: string;
  candidate_id: number;
  candidate_name: string;
  total_score: string | null;
  hire_recommendation: string | null;
  attention_kind: string;
  occurred_at: Date;
}

export type DashboardMetricsRow = {
  candidatesTotal: number;
  completedTotal: number;
  inProgressTotal: number;
  abandonedTotal: number;
  needsReviewTotal: number;
  strongInviteTotal: number;
  shortlistedTotal: number;
  completionRate: number | null;
  interviewsTotal: number;
  activeInterviewsTotal: number;
};

export type DashboardAttentionRow = {
  kind: DashboardAttentionKindEnum;
  attemptId: number;
  interviewId: number;
  interviewTitle: string;
  jobRole: string;
  candidateId: number;
  candidateName: string;
  overallScore: number | null;
  hireRecommendation: string | null;
  occurredAt: Date;
};

@Injectable()
export class DashboardOverviewRepository {
  constructor(private readonly database: DatabaseService) {}

  async getMetrics(companyId: number): Promise<DashboardMetricsRow> {
    const rows = await this.database.query<MetricsRow[]>(
      `SELECT
         candidate_stats.candidates_total,
         attempt_stats.completed_total,
         attempt_stats.in_progress_total,
         attempt_stats.abandoned_total,
         attempt_stats.needs_review_total,
         attempt_stats.strong_invite_total,
         shortlist_stats.shortlisted_total,
         attempt_stats.completion_rate,
         interview_stats.interviews_total,
         interview_stats.active_interviews_total
       FROM (
         SELECT COUNT(DISTINCT ia.candidate_id) AS candidates_total
         FROM interview_attempts ia
         WHERE ia.company_id = ?
       ) candidate_stats
       CROSS JOIN (
         SELECT
           SUM(ia.status = 'completed') AS completed_total,
           SUM(ia.status = 'in_progress') AS in_progress_total,
           SUM(ia.status = 'abandoned') AS abandoned_total,
           SUM(ia.status = 'completed' AND fe.needs_manual_review = 1) AS needs_review_total,
           SUM(ia.status = 'completed' AND fe.hire_recommendation = 'strong_invite') AS strong_invite_total,
           CASE
             WHEN SUM(ia.status IN ('completed', 'abandoned', 'in_progress')) > 0
             THEN ROUND(
               100.0 * SUM(ia.status = 'completed') /
               SUM(ia.status IN ('completed', 'abandoned', 'in_progress')),
               1
             )
             ELSE NULL
           END AS completion_rate
         FROM interview_attempts ia
         LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
         WHERE ia.company_id = ?
       ) attempt_stats
       CROSS JOIN (
         SELECT COUNT(*) AS shortlisted_total
         FROM candidate_shortlist cs
         WHERE cs.company_id = ? AND cs.status = 'shortlisted'
       ) shortlist_stats
       CROSS JOIN (
         SELECT
           COUNT(*) AS interviews_total,
           SUM(i.status = 'active') AS active_interviews_total
         FROM interviews i
         WHERE i.company_id = ?
       ) interview_stats`,
      [companyId, companyId, companyId, companyId],
    );

    const row = rows[0];

    return {
      candidatesTotal: Number(row?.candidates_total ?? 0),
      completedTotal: Number(row?.completed_total ?? 0),
      inProgressTotal: Number(row?.in_progress_total ?? 0),
      abandonedTotal: Number(row?.abandoned_total ?? 0),
      needsReviewTotal: Number(row?.needs_review_total ?? 0),
      strongInviteTotal: Number(row?.strong_invite_total ?? 0),
      shortlistedTotal: Number(row?.shortlisted_total ?? 0),
      completionRate:
        row?.completion_rate != null ? Number(row.completion_rate) : null,
      interviewsTotal: Number(row?.interviews_total ?? 0),
      activeInterviewsTotal: Number(row?.active_interviews_total ?? 0),
    };
  }

  async getAttentionItems(
    companyId: number,
    limit = 8,
  ): Promise<DashboardAttentionRow[]> {
    const rows = await this.database.query<AttentionRow[]>(
      `SELECT
         ia.id AS attempt_id,
         ia.interview_id,
         i.title AS interview_title,
         i.job_role,
         ia.candidate_id,
         c.full_name AS candidate_name,
         fe.total_score,
         fe.hire_recommendation,
         CASE
           WHEN ia.status = 'completed' AND fe.needs_manual_review = 1 THEN 'needs_review'
           WHEN ia.status = 'completed'
             AND fe.hire_recommendation IN ('strong_invite', 'invite') THEN 'strong_candidate'
           WHEN ia.status = 'abandoned' THEN 'abandoned'
           WHEN ia.status = 'in_progress' THEN 'in_progress'
           ELSE 'in_progress'
         END AS attention_kind,
         COALESCE(ia.completed_at, ia.started_at, ia.created_at) AS occurred_at
       FROM interview_attempts ia
       INNER JOIN interviews i ON i.id = ia.interview_id
       INNER JOIN candidates c ON c.id = ia.candidate_id
       LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
       WHERE ia.company_id = ?
         AND (
           (ia.status = 'completed' AND (
             fe.needs_manual_review = 1
             OR fe.hire_recommendation IN ('strong_invite', 'invite')
           ))
           OR ia.status = 'abandoned'
           OR ia.status = 'in_progress'
         )
       ORDER BY occurred_at DESC
       LIMIT ${limit}`,
      [companyId],
    );

    return rows.map((row) => ({
      kind: row.attention_kind as DashboardAttentionKindEnum,
      attemptId: row.attempt_id,
      interviewId: row.interview_id,
      interviewTitle: row.interview_title,
      jobRole: row.job_role,
      candidateId: row.candidate_id,
      candidateName: row.candidate_name,
      overallScore: row.total_score != null ? Number(row.total_score) : null,
      hireRecommendation: row.hire_recommendation,
      occurredAt: row.occurred_at,
    }));
  }
}
