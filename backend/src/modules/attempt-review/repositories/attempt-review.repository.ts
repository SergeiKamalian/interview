import { Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { SHORTLIST_TABLES } from '../../shortlist/shortlist.schema';
import {
  ATTEMPT_REVIEW_TABLES,
  type AiAssessmentVerdict,
  type AttemptReviewEventAction,
  type AttemptReviewStatus,
  type CompanyAttemptDecision,
  DEFAULT_ATTEMPT_REVIEW_STATE,
} from '../attempt-review.schema';

interface AttemptRow extends RowDataPacket {
  id: number;
}

export interface AttemptReviewRow extends RowDataPacket {
  review_status: AttemptReviewStatus | null;
  ai_assessment_verdict: AiAssessmentVerdict | null;
  company_decision: CompanyAttemptDecision | null;
  reviewed_at: Date | null;
}

export interface AttemptReviewRecord {
  reviewStatus: AttemptReviewStatus;
  aiAssessmentVerdict: AiAssessmentVerdict;
  companyDecision: CompanyAttemptDecision;
  reviewedAt: Date | null;
}

interface AttemptCandidateRow extends RowDataPacket {
  candidate_id: number;
}

interface DecisionAuditEventRow extends RowDataPacket {
  event_id: string;
  source: 'attempt_review' | 'shortlist';
  action: string;
  previous_value: string | null;
  new_value: string | null;
  reason: string | null;
  actor_email: string | null;
  actor_name: string | null;
  occurred_at: number;
}

interface DecisionAuditCountRow extends RowDataPacket {
  total: number;
}

export interface DecisionAuditEventRecord {
  eventId: string;
  source: 'attempt_review' | 'shortlist';
  action: string;
  previousValue: string | null;
  newValue: string | null;
  reason: string | null;
  actorEmail: string | null;
  actorName: string | null;
  occurredAt: number;
}

@Injectable()
export class AttemptReviewRepository {
  constructor(private readonly database: DatabaseService) {}

  mapReviewRow(row: AttemptReviewRow | null | undefined): AttemptReviewRecord {
    if (!row?.review_status) {
      return { ...DEFAULT_ATTEMPT_REVIEW_STATE };
    }

    return {
      reviewStatus: row.review_status,
      aiAssessmentVerdict: row.ai_assessment_verdict ?? 'pending',
      companyDecision: row.company_decision ?? 'pending',
      reviewedAt: row.reviewed_at,
    };
  }

  async assertReviewableAttempt(companyId: number, attemptId: number) {
    const rows = await this.database.query<AttemptRow[]>(
      `SELECT id
       FROM interview_attempts
       WHERE id = ? AND company_id = ? AND status = 'completed' AND is_preview = 0
       LIMIT 1`,
      [attemptId, companyId],
    );

    if (!rows[0]) {
      throw new NotFoundException('Interview attempt not found');
    }
  }

  async findByAttemptId(
    companyId: number,
    attemptId: number,
  ): Promise<AttemptReviewRecord> {
    const rows = await this.database.query<
      (AttemptReviewRow & RowDataPacket)[]
    >(
      `SELECT review_status,
              ai_assessment_verdict,
              company_decision,
              reviewed_at
       FROM ${ATTEMPT_REVIEW_TABLES.reviews}
       WHERE company_id = ? AND interview_attempt_id = ?
       LIMIT 1`,
      [companyId, attemptId],
    );

    return this.mapReviewRow(rows[0]);
  }

  async markReviewStarted(input: {
    companyId: number;
    attemptId: number;
    userId: number;
  }): Promise<AttemptReviewRecord> {
    await this.assertReviewableAttempt(input.companyId, input.attemptId);

    const existing = await this.findByAttemptId(
      input.companyId,
      input.attemptId,
    );

    if (existing.reviewStatus === 'reviewed') {
      return existing;
    }

    if (existing.reviewStatus === 'in_review') {
      return existing;
    }

    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${ATTEMPT_REVIEW_TABLES.reviews}
         (company_id, interview_attempt_id, review_status, reviewed_by)
       VALUES (?, ?, 'in_review', ?)
       ON DUPLICATE KEY UPDATE
         review_status = IF(review_status = 'reviewed', review_status, 'in_review'),
         reviewed_by = VALUES(reviewed_by),
         updated_at = CURRENT_TIMESTAMP`,
      [input.companyId, input.attemptId, input.userId],
    );

    await this.appendEvent({
      companyId: input.companyId,
      attemptId: input.attemptId,
      action: 'review_started',
      previousValue: existing.reviewStatus,
      newValue: 'in_review',
      reason: null,
      createdBy: input.userId,
    });

    return this.findByAttemptId(input.companyId, input.attemptId);
  }

  async setAiVerdict(input: {
    companyId: number;
    attemptId: number;
    userId: number;
    verdict: Exclude<AiAssessmentVerdict, 'pending'>;
    reason?: string | null;
  }): Promise<AttemptReviewRecord> {
    await this.assertReviewableAttempt(input.companyId, input.attemptId);

    const existing = await this.findByAttemptId(
      input.companyId,
      input.attemptId,
    );

    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${ATTEMPT_REVIEW_TABLES.reviews}
         (company_id, interview_attempt_id, review_status, ai_assessment_verdict,
          ai_verdict_reason, reviewed_at, reviewed_by)
       VALUES (?, ?, 'reviewed', ?, ?, CURRENT_TIMESTAMP, ?)
       ON DUPLICATE KEY UPDATE
         review_status = 'reviewed',
         ai_assessment_verdict = VALUES(ai_assessment_verdict),
         ai_verdict_reason = VALUES(ai_verdict_reason),
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = VALUES(reviewed_by),
         updated_at = CURRENT_TIMESTAMP`,
      [
        input.companyId,
        input.attemptId,
        input.verdict,
        input.reason ?? null,
        input.userId,
      ],
    );

    await this.appendEvent({
      companyId: input.companyId,
      attemptId: input.attemptId,
      action: 'ai_verdict_set',
      previousValue: existing.aiAssessmentVerdict,
      newValue: input.verdict,
      reason: input.reason ?? null,
      createdBy: input.userId,
    });

    return this.findByAttemptId(input.companyId, input.attemptId);
  }

  async setCompanyDecision(input: {
    companyId: number;
    attemptId: number;
    userId: number;
    decision: Exclude<CompanyAttemptDecision, 'pending'>;
    reason?: string | null;
  }): Promise<AttemptReviewRecord> {
    await this.assertReviewableAttempt(input.companyId, input.attemptId);

    const existing = await this.findByAttemptId(
      input.companyId,
      input.attemptId,
    );

    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${ATTEMPT_REVIEW_TABLES.reviews}
         (company_id, interview_attempt_id, review_status, company_decision,
          reviewed_at, reviewed_by)
       VALUES (?, ?, 'reviewed', ?, CURRENT_TIMESTAMP, ?)
       ON DUPLICATE KEY UPDATE
         review_status = 'reviewed',
         company_decision = VALUES(company_decision),
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = VALUES(reviewed_by),
         updated_at = CURRENT_TIMESTAMP`,
      [input.companyId, input.attemptId, input.decision, input.userId],
    );

    await this.appendEvent({
      companyId: input.companyId,
      attemptId: input.attemptId,
      action: 'company_decision_set',
      previousValue: existing.companyDecision,
      newValue: input.decision,
      reason: input.reason ?? null,
      createdBy: input.userId,
    });

    return this.findByAttemptId(input.companyId, input.attemptId);
  }

  async findAttemptCandidateId(
    companyId: number,
    attemptId: number,
  ): Promise<number> {
    const rows = await this.database.query<
      (AttemptCandidateRow & RowDataPacket)[]
    >(
      `SELECT ia.candidate_id
       FROM interview_attempts ia
       WHERE ia.id = ?
         AND ia.company_id = ?
         AND ia.status = 'completed'
         AND ia.is_preview = 0
       LIMIT 1`,
      [attemptId, companyId],
    );

    if (!rows[0]) {
      throw new NotFoundException('Interview attempt not found');
    }

    return rows[0].candidate_id;
  }

  private decisionAuditUnionSql() {
    return `
      SELECT CONCAT('review:', e.id) AS event_id,
             'attempt_review' AS source,
             e.action,
             e.previous_value,
             e.new_value,
             e.reason,
             u.email AS actor_email,
             u.full_name AS actor_name,
             UNIX_TIMESTAMP(e.created_at) AS occurred_at,
             e.created_at AS sort_ts
      FROM ${ATTEMPT_REVIEW_TABLES.events} e
      LEFT JOIN users u ON u.id = e.created_by
      WHERE e.company_id = ? AND e.interview_attempt_id = ?

      UNION ALL

      SELECT CONCAT('shortlist:', se.id) AS event_id,
             'shortlist' AS source,
             se.action,
             NULL AS previous_value,
             NULL AS new_value,
             se.reason,
             u.email AS actor_email,
             u.full_name AS actor_name,
             UNIX_TIMESTAMP(se.created_at) AS occurred_at,
             se.created_at AS sort_ts
      FROM ${SHORTLIST_TABLES.candidateShortlistEvents} se
      LEFT JOIN users u ON u.id = se.created_by
      WHERE se.company_id = ? AND se.candidate_id = ?`;
  }

  async listDecisionAuditEvents(input: {
    companyId: number;
    attemptId: number;
    page: number;
    pageSize: number;
  }): Promise<{ items: DecisionAuditEventRecord[]; total: number }> {
    const candidateId = await this.findAttemptCandidateId(
      input.companyId,
      input.attemptId,
    );
    const pageSize = Math.min(Math.max(input.pageSize, 1), 100);
    const page = Math.max(input.page, 1);
    const offset = (page - 1) * pageSize;
    const unionSql = this.decisionAuditUnionSql();
    const params = [
      input.companyId,
      input.attemptId,
      input.companyId,
      candidateId,
    ];

    const countRows = await this.database.query<
      (DecisionAuditCountRow & RowDataPacket)[]
    >(
      `SELECT COUNT(*) AS total
       FROM (${unionSql}) combined`,
      params,
    );

    const rows = await this.database.query<
      (DecisionAuditEventRow & RowDataPacket)[]
    >(
      `SELECT event_id,
              source,
              action,
              previous_value,
              new_value,
              reason,
              actor_email,
              actor_name,
              occurred_at
       FROM (${unionSql}) combined
       ORDER BY sort_ts DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params,
    );

    return {
      total: Number(countRows[0]?.total ?? 0),
      items: rows.map((row) => ({
        eventId: row.event_id,
        source: row.source,
        action: row.action,
        previousValue: row.previous_value,
        newValue: row.new_value,
        reason: row.reason,
        actorEmail: row.actor_email,
        actorName: row.actor_name,
        occurredAt: Number(row.occurred_at),
      })),
    };
  }

  private async appendEvent(input: {
    companyId: number;
    attemptId: number;
    action: AttemptReviewEventAction;
    previousValue: string | null;
    newValue: string | null;
    reason: string | null;
    createdBy: number;
  }) {
    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${ATTEMPT_REVIEW_TABLES.events}
         (company_id, interview_attempt_id, action, previous_value, new_value, reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.attemptId,
        input.action,
        input.previousValue,
        input.newValue,
        input.reason,
        input.createdBy,
      ],
    );
  }
}
