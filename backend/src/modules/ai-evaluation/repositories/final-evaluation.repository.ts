import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { AI_EVALUATION_TABLES } from '../ai-evaluation.schema';
import type {
  FinalEvaluationEntity,
  UpsertFinalEvaluationData,
} from '../entities/final-evaluation.entity';

interface FinalEvaluationRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  total_score: string;
  category: FinalEvaluationEntity['category'];
  hire_recommendation: FinalEvaluationEntity['hireRecommendation'];
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
         summary, detailed_summary, strengths, weaknesses, risks, raw_response, needs_manual_review
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_score = VALUES(total_score),
         category = VALUES(category),
         hire_recommendation = VALUES(hire_recommendation),
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
              hire_recommendation, summary, detailed_summary, strengths, weaknesses, risks,
              raw_response, needs_manual_review, created_at, updated_at
       FROM ${AI_EVALUATION_TABLES.finalEvaluations}
       WHERE company_id = ? AND interview_attempt_id = ?
       LIMIT 1`,
      [companyId, attemptId],
    );

    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  private mapRow(row: FinalEvaluationRow): FinalEvaluationEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      totalScore: Number(row.total_score),
      category: row.category,
      hireRecommendation: row.hire_recommendation,
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
