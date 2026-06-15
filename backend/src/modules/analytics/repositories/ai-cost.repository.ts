import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import { AI_EVALUATION_TABLES } from '../../ai-evaluation/ai-evaluation.schema';
import type { AiCostFilterInput } from '../graphql/ai-cost.input';

interface KpiRow extends RowDataPacket {
  total_cost_usd: string;
  total_requests: number;
  distinct_attempts: number;
  distinct_candidates: number;
}

interface ModelRow extends RowDataPacket {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost_usd: string;
}

interface ExpensiveRow extends RowDataPacket {
  interview_attempt_id: number;
  interview_title: string | null;
  total_cost_usd: string;
  max_latency_ms: number | null;
}

@Injectable()
export class AiCostRepository {
  constructor(private readonly database: DatabaseService) {}

  private buildConditions(companyId: number, filters: AiCostFilterInput) {
    const conditions = ['l.company_id = ?'];
    const params: DbQueryParam[] = [companyId];

    if (filters.dateFrom) {
      conditions.push('l.created_at >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('l.created_at <= ?');
      params.push(`${filters.dateTo} 23:59:59`);
    }

    if (filters.model?.trim()) {
      conditions.push('l.model = ?');
      params.push(filters.model.trim());
    }

    if (filters.provider?.trim()) {
      conditions.push('l.provider = ?');
      params.push(filters.provider.trim());
    }

    return { whereClause: conditions.join(' AND '), params };
  }

  async getAnalytics(companyId: number, filters: AiCostFilterInput) {
    const { whereClause, params } = this.buildConditions(companyId, filters);

    const kpiRows = await this.database.query<KpiRow[]>(
      `SELECT COALESCE(SUM(l.cost_usd), 0) AS total_cost_usd,
              COUNT(*) AS total_requests,
              COUNT(DISTINCT l.interview_attempt_id) AS distinct_attempts,
              COUNT(DISTINCT ia.candidate_id) AS distinct_candidates
       FROM ${AI_EVALUATION_TABLES.aiUsageLogs} l
       LEFT JOIN interview_attempts ia ON ia.id = l.interview_attempt_id
       WHERE ${whereClause}`,
      params,
    );

    const modelRows = await this.database.query<ModelRow[]>(
      `SELECT l.model,
              COALESCE(SUM(l.prompt_tokens), 0) AS prompt_tokens,
              COALESCE(SUM(l.completion_tokens), 0) AS completion_tokens,
              COALESCE(SUM(l.cost_usd), 0) AS total_cost_usd
       FROM ${AI_EVALUATION_TABLES.aiUsageLogs} l
       WHERE ${whereClause}
       GROUP BY l.model
       ORDER BY total_cost_usd DESC`,
      params,
    );

    const expensiveRows = await this.database.query<ExpensiveRow[]>(
      `SELECT l.interview_attempt_id,
              i.title AS interview_title,
              SUM(l.cost_usd) AS total_cost_usd,
              MAX(l.latency_ms) AS max_latency_ms
       FROM ${AI_EVALUATION_TABLES.aiUsageLogs} l
       LEFT JOIN interview_attempts ia ON ia.id = l.interview_attempt_id
       LEFT JOIN interviews i ON i.id = ia.interview_id
       WHERE ${whereClause} AND l.interview_attempt_id IS NOT NULL
       GROUP BY l.interview_attempt_id, i.title
       ORDER BY total_cost_usd DESC
       LIMIT 10`,
      params,
    );

    return { kpi: kpiRows[0], byModel: modelRows, expensive: expensiveRows };
  }
}
