import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { QuestionLevel } from '../../question-bank/types/question-level.enum';
import { AI_EVALUATION_TABLES } from '../ai-evaluation.schema';
import type {
  AchievedLevelMethod,
  FinalEvaluationEntity,
  UpsertFinalEvaluationData,
} from '../entities/final-evaluation.entity';

export type AchievedLevelBackfillCandidate = {
  finalEvaluationId: number;
  companyId: number;
  interviewAttemptId: number;
  interviewId: number;
};

interface AchievedLevelBackfillRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  interview_id: number;
}

interface FinalEvaluationRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  total_score: string;
  category: FinalEvaluationEntity['category'];
  hire_recommendation: FinalEvaluationEntity['hireRecommendation'];
  achieved_level: FinalEvaluationEntity['achievedLevel'];
  achieved_level_method: FinalEvaluationEntity['achievedLevelMethod'];
  summary: string;
  detailed_summary: string | null;
  strengths: string | string[] | null;
  weaknesses: string | string[] | null;
  risks: string | string[] | null;
  raw_response: string | Record<string, unknown> | null;
  needs_manual_review: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class FinalEvaluationRepository {
  constructor(private readonly database: DatabaseService) {}

  async upsertByAttemptId(
    data: UpsertFinalEvaluationData,
  ): Promise<FinalEvaluationEntity> {
    await this.database.query<ResultSetHeader>(
      `INSERT INTO ${AI_EVALUATION_TABLES.finalEvaluations} (
         company_id, interview_attempt_id, total_score, category, hire_recommendation,
         achieved_level, achieved_level_method,
         summary, detailed_summary, strengths, weaknesses, risks, raw_response, needs_manual_review
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_score = VALUES(total_score),
         category = VALUES(category),
         hire_recommendation = VALUES(hire_recommendation),
         achieved_level = VALUES(achieved_level),
         achieved_level_method = VALUES(achieved_level_method),
         summary = VALUES(summary),
         detailed_summary = VALUES(detailed_summary),
         strengths = VALUES(strengths),
         weaknesses = VALUES(weaknesses),
         risks = VALUES(risks),
         raw_response = VALUES(raw_response),
         needs_manual_review = VALUES(needs_manual_review),
         updated_at = CURRENT_TIMESTAMP`,
      [
        data.companyId,
        data.interviewAttemptId,
        data.totalScore,
        data.category,
        data.hireRecommendation,
        data.achievedLevel,
        data.achievedLevelMethod,
        data.summary,
        data.detailedSummary,
        JSON.stringify(data.strengths),
        JSON.stringify(data.weaknesses),
        JSON.stringify(data.risks),
        JSON.stringify(data.rawResponse),
        data.needsManualReview ? 1 : 0,
      ],
    );

    const entity = await this.findByAttemptId(
      data.companyId,
      data.interviewAttemptId,
    );
    if (!entity) {
      throw new Error('Failed to load final evaluation after upsert');
    }

    return entity;
  }

  async findByAttemptId(
    companyId: number,
    attemptId: number,
  ): Promise<FinalEvaluationEntity | null> {
    const rows = await this.database.query<FinalEvaluationRow[]>(
      `SELECT id, company_id, interview_attempt_id, total_score, category,
              hire_recommendation, achieved_level, achieved_level_method, summary,
              detailed_summary, strengths, weaknesses, risks,
              raw_response, needs_manual_review, created_at, updated_at
       FROM ${AI_EVALUATION_TABLES.finalEvaluations}
       WHERE company_id = ? AND interview_attempt_id = ?
       LIMIT 1`,
      [companyId, attemptId],
    );

    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  /**
   * Rows that never had achieved_level computed (legacy attempts evaluated before
   * migration 023 / TASK-18.4). Both columns NULL means "never backfilled": once a
   * row is processed it gets a non-null method (even when the level resolves to
   * null), so re-running excludes it → idempotent selection. (TASK-18.9)
   */
  async findAchievedLevelBackfillCandidates(): Promise<
    AchievedLevelBackfillCandidate[]
  > {
    const rows = await this.database.query<AchievedLevelBackfillRow[]>(
      `SELECT fe.id, fe.company_id, fe.interview_attempt_id, ia.interview_id
       FROM ${AI_EVALUATION_TABLES.finalEvaluations} fe
       INNER JOIN interview_attempts ia ON ia.id = fe.interview_attempt_id
       WHERE fe.achieved_level IS NULL AND fe.achieved_level_method IS NULL
       ORDER BY fe.id ASC`,
    );

    return rows.map((row) => ({
      finalEvaluationId: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewId: row.interview_id,
    }));
  }

  /**
   * Idempotent backfill write: only touches rows that were never computed
   * (achieved_level IS NULL AND achieved_level_method IS NULL), so it never
   * overwrites a live-evaluated row and a second run is a no-op. Returns the
   * number of rows actually changed. (TASK-18.9)
   */
  async backfillAchievedLevel(input: {
    finalEvaluationId: number;
    achievedLevel: QuestionLevel | null;
    achievedLevelMethod: AchievedLevelMethod | null;
  }): Promise<number> {
    const result = await this.database.query<ResultSetHeader>(
      `UPDATE ${AI_EVALUATION_TABLES.finalEvaluations}
       SET achieved_level = ?, achieved_level_method = ?
       WHERE id = ? AND achieved_level IS NULL AND achieved_level_method IS NULL`,
      [input.achievedLevel, input.achievedLevelMethod, input.finalEvaluationId],
    );

    return result.affectedRows;
  }

  private mapRow(row: FinalEvaluationRow): FinalEvaluationEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      totalScore: Number(row.total_score),
      category: row.category,
      hireRecommendation: row.hire_recommendation,
      achievedLevel: row.achieved_level ?? null,
      achievedLevelMethod: row.achieved_level_method ?? null,
      summary: row.summary,
      detailedSummary: row.detailed_summary,
      strengths: parseJsonArray(row.strengths),
      weaknesses: parseJsonArray(row.weaknesses),
      risks: parseJsonArray(row.risks),
      rawResponse: parseJsonObject(row.raw_response),
      needsManualReview: row.needs_manual_review === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

function parseJsonArray(value: string | string[] | null): string[] {
  if (value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parseJsonObject(
  value: string | Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (value === null) {
    return null;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}
