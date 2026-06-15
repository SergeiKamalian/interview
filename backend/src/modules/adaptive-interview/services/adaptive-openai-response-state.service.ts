import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';
import { getAdaptiveAiOpenAiStateTtlSeconds } from '../config/adaptive-interview-context.config';
import type { AdaptiveOpenAiResponseState } from '../types/adaptive-openai-response-state.types';

@Injectable()
export class AdaptiveOpenAiResponseStateService {
  constructor(private readonly redisService: RedisService) {}

  buildStateKey(attemptId: number, interviewQuestionId: number): string {
    return `adaptive-ai:openai-response:evaluate:${attemptId}:${interviewQuestionId}`;
  }

  async loadEvaluateState(input: {
    attemptId: number;
    interviewQuestionId: number;
    promptVersion: string;
    model: string;
  }): Promise<AdaptiveOpenAiResponseState | null> {
    const state = await this.redisService.getJson<AdaptiveOpenAiResponseState>(
      this.buildStateKey(input.attemptId, input.interviewQuestionId),
    );

    if (!state) {
      return null;
    }

    if (
      state.promptVersion !== input.promptVersion ||
      state.model !== input.model ||
      state.provider !== 'openai' ||
      state.api !== 'responses'
    ) {
      return null;
    }

    return state;
  }

  async saveEvaluateState(input: {
    attemptId: number;
    interviewQuestionId: number;
    promptVersion: string;
    model: string;
    lastResponseId: string;
    previousState?: AdaptiveOpenAiResponseState | null;
  }): Promise<AdaptiveOpenAiResponseState> {
    const now = new Date().toISOString();
    const state: AdaptiveOpenAiResponseState = {
      provider: 'openai',
      api: 'responses',
      model: input.model,
      promptVersion: input.promptVersion,
      lastResponseId: input.lastResponseId,
      attemptId: input.attemptId,
      interviewQuestionId: input.interviewQuestionId,
      turnCount: (input.previousState?.turnCount ?? 0) + 1,
      createdAt: input.previousState?.createdAt ?? now,
      updatedAt: now,
    };

    await this.redisService.setJson(
      this.buildStateKey(input.attemptId, input.interviewQuestionId),
      state,
      getAdaptiveAiOpenAiStateTtlSeconds(),
    );

    return state;
  }

  async clearEvaluateState(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<void> {
    await this.redisService.del(
      this.buildStateKey(attemptId, interviewQuestionId),
    );
  }
}
