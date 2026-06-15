import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import { AI_EVALUATION_TABLES } from '../ai-evaluation/ai-evaluation.schema';
import type {
  AiUsageCostSummary,
  AiUsageLogEntity,
  CreateAiUsageLogInput,
} from './entities/ai-usage-log.entity';

interface AiUsageLogRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number | null;
  interview_message_id: number | null;
  provider: string;
  model: string;
  operation_type: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: string;
  latency_ms: number | null;
  created_at: Date;
}

interface SummaryRow extends RowDataPacket {
  total_requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost_usd: string;
}

@Injectable()
export class AiUsageLogRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(
    input: CreateAiUsageLogInput & { costUsd: number },
  ): Promise<AiUsageLogEntity> {
    const result = await this.database.query<ResultSetHeader>(
      `INSERT INTO ${AI_EVALUATION_TABLES.aiUsageLogs} (
         company_id, interview_attempt_id, interview_message_id, provider, model,
         operation_type, prompt_tokens, completion_tokens, cost_usd, latency_ms
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.interviewAttemptId ?? null,
        input.interviewMessageId ?? null,
        input.provider,
        input.model,
        input.operationType,
        input.promptTokens,
        input.completionTokens,
        input.costUsd,
        input.latencyMs ?? null,
      ],
    );

    const rows = await this.database.query<AiUsageLogRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_message_id, provider, model,
              operation_type, prompt_tokens, completion_tokens, cost_usd, latency_ms, created_at
       FROM ${AI_EVALUATION_TABLES.aiUsageLogs}
       WHERE id = ?
       LIMIT 1`,
      [Number(result.insertId)],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load AI usage log after insert');
    }

    return this.mapRow(row);
  }

  async summarizeByCompanySince(
    companyId: number,
    since: Date,
  ): Promise<AiUsageCostSummary> {
    const rows = await this.database.query<SummaryRow[]>(
      `SELECT COUNT(*) AS total_requests,
              COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
              COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
              COALESCE(SUM(cost_usd), 0) AS total_cost_usd
       FROM ${AI_EVALUATION_TABLES.aiUsageLogs}
       WHERE company_id = ? AND created_at >= ?`,
      [companyId, since],
    );

    const row = rows[0];
    return {
      totalRequests: Number(row?.total_requests ?? 0),
      totalPromptTokens: Number(row?.prompt_tokens ?? 0),
      totalCompletionTokens: Number(row?.completion_tokens ?? 0),
      totalCostUsd: Number(row?.total_cost_usd ?? 0),
    };
  }

  private mapRow(row: AiUsageLogRow): AiUsageLogEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewMessageId: row.interview_message_id,
      provider: row.provider,
      model: row.model,
      operationType: row.operation_type,
      promptTokens: row.prompt_tokens,
      completionTokens: row.completion_tokens,
      costUsd: Number(row.cost_usd),
      latencyMs: row.latency_ms,
      createdAt: row.created_at,
    };
  }
}
