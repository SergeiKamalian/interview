import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import { ADAPTIVE_INTERVIEW_TABLES } from '../adaptive-interview.schema';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import type { EvaluationEvidenceSource } from '../types/evaluation-evidence-source.type';
import { mergeCheckpointEvaluation } from '../utils/merge-checkpoint-evaluation.util';

interface CheckpointStateRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  interview_question_id: number;
  checkpoint_key: string;
  status: CheckpointStateStatus;
  score_awarded: string;
  max_score: string;
  confidence: string | null;
  evidence_summary: string | null;
  evidence_message_ids: string | number[] | null;
  rationale: string | null;
  follow_up_count: number;
  needs_manual_review: number;
  created_at: Date;
  updated_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

export type EnsureCheckpointStateItem = {
  checkpointKey: string;
  maxScore: number;
};

export type ApplyTurnEvaluationResultItem = {
  checkpointKey: string;
  status: CheckpointStateStatus;
  scoreAwarded: number;
  confidence: number | null;
  evidenceSummary: string | null;
  rationale: string | null;
  needsManualReview?: boolean;
};

@Injectable()
export class CheckpointStateRepository {
  constructor(private readonly database: DatabaseService) {}

  async countByAttemptAndQuestion(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<number> {
    const rows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewCheckpointStates}
       WHERE interview_attempt_id = ? AND interview_question_id = ?`,
      [attemptId, interviewQuestionId],
    );

    return Number(rows[0]?.total ?? 0);
  }

  async findByAttemptAndQuestion(
    attemptId: number,
    interviewQuestionId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewCheckpointStateEntity[]> {
    const rows = await query<CheckpointStateRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id, checkpoint_key,
              status, score_awarded, max_score, confidence, evidence_summary,
              evidence_message_ids, rationale, follow_up_count, needs_manual_review,
              created_at, updated_at
       FROM ${ADAPTIVE_INTERVIEW_TABLES.interviewCheckpointStates}
       WHERE interview_attempt_id = ? AND interview_question_id = ?
       ORDER BY checkpoint_key ASC`,
      [attemptId, interviewQuestionId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  async ensureForQuestion(
    input: {
      companyId: number;
      attemptId: number;
      interviewQuestionId: number;
      checkpoints: EnsureCheckpointStateItem[];
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewCheckpointStateEntity[]> {
    for (const checkpoint of input.checkpoints) {
      await query<ResultSetHeader>(
        `INSERT INTO ${ADAPTIVE_INTERVIEW_TABLES.interviewCheckpointStates} (
           company_id, interview_attempt_id, interview_question_id, checkpoint_key,
           status, score_awarded, max_score, follow_up_count
         ) VALUES (?, ?, ?, ?, 'unseen', 0, ?, 0)
         ON DUPLICATE KEY UPDATE id = id`,
        [
          input.companyId,
          input.attemptId,
          input.interviewQuestionId,
          checkpoint.checkpointKey,
          checkpoint.maxScore,
        ],
      );
    }

    return this.findByAttemptAndQuestion(
      input.attemptId,
      input.interviewQuestionId,
      query,
    );
  }

  async applyTurnEvaluationResults(
    input: {
      attemptId: number;
      interviewQuestionId: number;
      candidateMessageId: number;
      evidenceSource?: EvaluationEvidenceSource;
      results: ApplyTurnEvaluationResultItem[];
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewCheckpointStateEntity[]> {
    const existing = await this.findByAttemptAndQuestion(
      input.attemptId,
      input.interviewQuestionId,
      query,
    );
    const existingByKey = new Map(
      existing.map((state) => [state.checkpointKey, state]),
    );

    for (const result of input.results) {
      const current = existingByKey.get(result.checkpointKey);
      const maxScore = current?.maxScore ?? result.scoreAwarded;
      const merged = mergeCheckpointEvaluation({
        currentScoreAwarded: current?.scoreAwarded ?? 0,
        currentStatus: current?.status ?? 'unseen',
        currentEvidenceSummary: current?.evidenceSummary ?? null,
        currentRationale: current?.rationale ?? null,
        incomingScoreAwarded: result.scoreAwarded,
        incomingStatus: result.status,
        incomingEvidenceSummary: result.evidenceSummary,
        incomingRationale: result.rationale,
        maxScore,
        evidenceSource: input.evidenceSource,
      });
      const evidenceMessageIds = this.mergeEvidenceMessageIds(
        current?.evidenceMessageIds ?? null,
        input.candidateMessageId,
      );

      await query<ResultSetHeader>(
        `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewCheckpointStates}
         SET status = ?,
             score_awarded = ?,
             confidence = ?,
             evidence_summary = ?,
             evidence_message_ids = ?,
             rationale = ?,
             needs_manual_review = GREATEST(needs_manual_review, ?)
         WHERE interview_attempt_id = ?
           AND interview_question_id = ?
           AND checkpoint_key = ?`,
        [
          merged.status,
          merged.scoreAwarded,
          result.confidence,
          merged.evidenceSummary,
          JSON.stringify(evidenceMessageIds),
          merged.rationale,
          result.needsManualReview ? 1 : 0,
          input.attemptId,
          input.interviewQuestionId,
          result.checkpointKey,
        ],
      );
    }

    return this.findByAttemptAndQuestion(
      input.attemptId,
      input.interviewQuestionId,
      query,
    );
  }

  async markNeedsManualReviewForQuestion(
    attemptId: number,
    interviewQuestionId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewCheckpointStates}
       SET needs_manual_review = 1
       WHERE interview_attempt_id = ? AND interview_question_id = ?`,
      [attemptId, interviewQuestionId],
    );
  }

  async skipCheckpointsOnCandidateDecline(
    attemptId: number,
    interviewQuestionId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<number> {
    const result = await query<ResultSetHeader>(
      `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewCheckpointStates}
       SET status = 'skipped',
           rationale = COALESCE(
             NULLIF(rationale, ''),
             'Candidate declined knowledge for this question'
           )
       WHERE interview_attempt_id = ?
         AND interview_question_id = ?
         AND status IN ('unseen', 'missed', 'unclear', 'partial')
         AND score_awarded = 0`,
      [attemptId, interviewQuestionId],
    );

    return result.affectedRows;
  }

  async incrementFollowUpCount(
    attemptId: number,
    interviewQuestionId: number,
    checkpointKey: string,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE ${ADAPTIVE_INTERVIEW_TABLES.interviewCheckpointStates}
       SET follow_up_count = follow_up_count + 1
       WHERE interview_attempt_id = ?
         AND interview_question_id = ?
         AND checkpoint_key = ?`,
      [attemptId, interviewQuestionId, checkpointKey],
    );
  }

  private mergeEvidenceMessageIds(
    existing: number[] | null,
    candidateMessageId: number,
  ): number[] {
    const merged = new Set(existing ?? []);
    merged.add(candidateMessageId);
    return [...merged].sort((left, right) => left - right);
  }

  private mapRow(row: CheckpointStateRow): InterviewCheckpointStateEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewQuestionId: row.interview_question_id,
      checkpointKey: row.checkpoint_key,
      status: row.status,
      scoreAwarded: Number(row.score_awarded),
      maxScore: Number(row.max_score),
      confidence: row.confidence === null ? null : Number(row.confidence),
      evidenceSummary: row.evidence_summary,
      evidenceMessageIds: this.parseEvidenceMessageIds(row.evidence_message_ids),
      rationale: row.rationale,
      followUpCount: row.follow_up_count,
      needsManualReview: row.needs_manual_review === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private parseEvidenceMessageIds(
    value: string | number[] | null,
  ): number[] | null {
    if (value === null) {
      return null;
    }

    if (Array.isArray(value)) {
      return value.map((id) => Number(id));
    }

    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.map((id) => Number(id));
  }
}
