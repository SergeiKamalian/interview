import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AiProviderClientConfig } from '../../common/config/ai.schema';
import { AiProviderConfig } from './ai-provider.config';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatCompletionUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  usage: ChatCompletionUsage;
  latencyMs: number;
};

type OpenAiChatResponse = {
  model?: string;
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
};

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(private readonly aiProviderConfig: AiProviderConfig) {}

  getClientConfig(): AiProviderClientConfig {
    return this.aiProviderConfig.getClientConfig();
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options?: { jsonMode?: boolean; model?: string },
  ): Promise<ChatCompletionResult> {
    const config = this.aiProviderConfig.getConfig();
    const client = this.aiProviderConfig.getClientConfig();
    const model = options?.model ?? config.modelEvaluation;
    const url = `${client.baseUrl.replace(/\/$/, '')}/chat/completions`;

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: client.temperature,
    };

    if (options?.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const startedAt = Date.now();
    const response = await this.requestWithRetry(
      url,
      body,
      config.apiKey,
      client,
    );
    const latencyMs = Date.now() - startedAt;

    const payload = (await response.json()) as OpenAiChatResponse;

    if (!response.ok) {
      this.logger.error(
        `Chat completion failed provider=${client.provider} model=${model} status=${response.status}`,
      );
      throw new ServiceUnavailableException('AI provider request failed');
    }

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new ServiceUnavailableException(
        'AI provider returned empty response',
      );
    }

    return {
      content,
      model: payload.model ?? model,
      usage: {
        promptTokens: payload.usage?.prompt_tokens ?? 0,
        completionTokens: payload.usage?.completion_tokens ?? 0,
        totalTokens: payload.usage?.total_tokens ?? 0,
      },
      latencyMs,
    };
  }

  async evaluateJson(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<ChatCompletionResult> {
    return this.createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { jsonMode: true },
    );
  }

  private async requestWithRetry(
    url: string,
    body: Record<string, unknown>,
    apiKey: string,
    client: AiProviderClientConfig,
  ): Promise<Response> {
    for (let attempt = 0; attempt <= client.maxRetries; attempt += 1) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(client.timeoutMs),
        });

        if (response.ok || (response.status < 500 && response.status !== 429)) {
          return response;
        }
      } catch {
        // retry below
      }

      if (attempt < client.maxRetries) {
        const delayMs = 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    this.logger.error(
      `AI request failed after retries provider=${client.provider} baseUrl=${client.baseUrl}`,
    );
    throw new ServiceUnavailableException('AI provider is unavailable');
  }
}
