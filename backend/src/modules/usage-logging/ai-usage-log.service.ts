import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import { estimateAiCostUsd } from './ai-usage-cost';
import { AiUsageLogRepository } from './ai-usage-log.repository';
import type {
  AiUsageCostSummary,
  AiUsageLogStatus,
  CreateAiUsageLogInput,
} from './entities/ai-usage-log.entity';

@Injectable()
export class AiUsageLogService {
  constructor(
    private readonly aiUsageLogRepository: AiUsageLogRepository,
    private readonly aiProviderService: AiProviderService,
  ) {}

  createCorrelationId(): string {
    return randomUUID();
  }

  async logUsage(input: CreateAiUsageLogInput): Promise<void> {
    const costUsd = estimateAiCostUsd({
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
    });

    await this.aiUsageLogRepository.create({
      ...input,
      costUsd,
    });
  }

  async summarizeSince(
    companyId: number,
    since: Date,
  ): Promise<AiUsageCostSummary> {
    return this.aiUsageLogRepository.summarizeByCompanySince(companyId, since);
  }

  async logCompletion(input: {
    companyId: number;
    interviewAttemptId?: number | null;
    interviewMessageId?: number | null;
    operationType: string;
    status: AiUsageLogStatus;
    correlationId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
  }): Promise<void> {
    const client = this.aiProviderService.getClientConfig();

    await this.logUsage({
      companyId: input.companyId,
      interviewAttemptId: input.interviewAttemptId,
      interviewMessageId: input.interviewMessageId,
      provider: client.provider,
      model: input.model,
      operationType: input.operationType,
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
      latencyMs: input.latencyMs,
      status: input.status,
      correlationId: input.correlationId,
    });
  }
}
