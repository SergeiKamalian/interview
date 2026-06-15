import { Injectable } from '@nestjs/common';
import type { AiCostFilterInput } from '../graphql/ai-cost.input';
import type { AiCostAnalyticsType } from '../graphql/ai-cost.type';
import { AiCostRepository } from '../repositories/ai-cost.repository';

@Injectable()
export class AiCostService {
  constructor(private readonly repository: AiCostRepository) {}

  async getAnalytics(
    companyId: number,
    filters: AiCostFilterInput,
  ): Promise<AiCostAnalyticsType> {
    const data = await this.repository.getAnalytics(companyId, filters ?? {});
    const totalCostUsd = Number(data.kpi?.total_cost_usd ?? 0);
    const distinctAttempts = Number(data.kpi?.distinct_attempts ?? 0);
    const distinctCandidates = Number(data.kpi?.distinct_candidates ?? 0);

    return {
      kpi: {
        totalCostUsd,
        costPerInterview:
          distinctAttempts > 0 ? totalCostUsd / distinctAttempts : 0,
        costPerCandidate:
          distinctCandidates > 0 ? totalCostUsd / distinctCandidates : 0,
        totalRequests: Number(data.kpi?.total_requests ?? 0),
      },
      byModel: data.byModel.map((row) => ({
        model: row.model,
        promptTokens: Number(row.prompt_tokens),
        completionTokens: Number(row.completion_tokens),
        totalCostUsd: Number(row.total_cost_usd),
      })),
      topExpensiveInterviews: data.expensive.map((row) => ({
        interviewAttemptId: String(row.interview_attempt_id),
        interviewTitle: row.interview_title,
        totalCostUsd: Number(row.total_cost_usd),
        latencyMs: row.max_latency_ms,
      })),
    };
  }
}
