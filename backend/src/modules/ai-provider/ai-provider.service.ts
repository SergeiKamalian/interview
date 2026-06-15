import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AdaptiveAiDebugMeta } from '../../common/debug/adaptive-ai-debug.util';
import {
  isAdaptiveAiDebugEnabled,
  logAdaptiveAiDebug,
  summarizeChatCompletionBody,
} from '../../common/debug/adaptive-ai-debug.util';
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

export type AiProviderDebugContext = AdaptiveAiDebugMeta;

type OpenAiStreamChunk = {
  model?: string;
  choices?: Array<{ delta?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
};

export type StreamChatCompletionOptions = {
  model?: string;
  debug?: AiProviderDebugContext;
  onDelta: (delta: string, contentSoFar: string) => void;
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
    options?: {
      jsonMode?: boolean;
      model?: string;
      debug?: AiProviderDebugContext;
    },
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

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.request', {
        ...options?.debug,
        provider: client.provider,
        baseUrl: client.baseUrl,
        timeoutMs: client.timeoutMs,
        maxRetries: client.maxRetries,
        body: summarizeChatCompletionBody({
          model,
          messages,
          jsonMode: options?.jsonMode,
          temperature: client.temperature,
        }),
      });
    }

    const startedAt = Date.now();
    const { response, retryCount } = await this.requestWithRetry(
      url,
      body,
      config.apiKey,
      client,
      options?.debug,
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

    const result: ChatCompletionResult = {
      content,
      model: payload.model ?? model,
      usage: {
        promptTokens: payload.usage?.prompt_tokens ?? 0,
        completionTokens: payload.usage?.completion_tokens ?? 0,
        totalTokens: payload.usage?.total_tokens ?? 0,
      },
      latencyMs,
    };

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.response', {
        ...options?.debug,
        provider: client.provider,
        model: result.model,
        latencyMs: result.latencyMs,
        retryCount,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        responseChars: result.content.length,
        responsePreview:
          result.content.length > 600
            ? `${result.content.slice(0, 600)}…`
            : result.content,
      });
    }

    return result;
  }

  async evaluateJson(
    systemPrompt: string,
    userPrompt: string,
    debug?: AiProviderDebugContext,
  ): Promise<ChatCompletionResult> {
    return this.createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { jsonMode: true, debug },
    );
  }

  async streamChatCompletion(
    messages: ChatMessage[],
    options: StreamChatCompletionOptions,
  ): Promise<ChatCompletionResult> {
    const config = this.aiProviderConfig.getConfig();
    const client = this.aiProviderConfig.getClientConfig();
    const model = options.model ?? config.modelEvaluation;
    const url = `${client.baseUrl.replace(/\/$/, '')}/chat/completions`;

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: client.temperature,
      stream: true,
      stream_options: { include_usage: true },
    };

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.stream_request', {
        ...options.debug,
        provider: client.provider,
        baseUrl: client.baseUrl,
        body: summarizeChatCompletionBody({
          model,
          messages,
          temperature: client.temperature,
        }),
      });
    }

    const startedAt = Date.now();
    const { response, retryCount } = await this.requestWithRetry(
      url,
      body,
      config.apiKey,
      client,
      options.debug,
    );

    if (!response.ok || !response.body) {
      throw new ServiceUnavailableException('AI provider stream request failed');
    }

    let content = '';
    let resolvedModel = model;
    let usage: ChatCompletionUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    for await (const chunk of this.readOpenAiSseStream(response.body)) {
      if (chunk.model) {
        resolvedModel = chunk.model;
      }

      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens ?? usage.promptTokens,
          completionTokens:
            chunk.usage.completion_tokens ?? usage.completionTokens,
          totalTokens: chunk.usage.total_tokens ?? usage.totalTokens,
        };
      }

      const delta = chunk.choices?.[0]?.delta?.content;
      if (!delta) {
        continue;
      }

      content += delta;
      options.onDelta(delta, content);
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw new ServiceUnavailableException(
        'AI provider returned empty stream response',
      );
    }

    const result: ChatCompletionResult = {
      content: trimmed,
      model: resolvedModel,
      usage,
      latencyMs: Date.now() - startedAt,
    };

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.stream_response', {
        ...options.debug,
        provider: client.provider,
        model: result.model,
        latencyMs: result.latencyMs,
        retryCount,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        responseChars: result.content.length,
      });
    }

    return result;
  }

  private async *readOpenAiSseStream(
    body: ReadableStream<Uint8Array>,
  ): AsyncGenerator<OpenAiStreamChunk> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) {
          continue;
        }

        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') {
          continue;
        }

        yield JSON.parse(payload) as OpenAiStreamChunk;
      }
    }
  }

  private async requestWithRetry(
    url: string,
    body: Record<string, unknown>,
    apiKey: string,
    client: AiProviderClientConfig,
    debug?: AiProviderDebugContext,
  ): Promise<{ response: Response; retryCount: number }> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= client.maxRetries; attempt += 1) {
      const attemptStartedAt = Date.now();

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

        if (isAdaptiveAiDebugEnabled()) {
          logAdaptiveAiDebug(this.logger, 'ai.http_attempt', {
            ...debug,
            attempt: attempt + 1,
            maxAttempts: client.maxRetries + 1,
            durationMs: Date.now() - attemptStartedAt,
            httpStatus: response.status,
            ok: response.ok,
          });
        }

        if (response.ok || (response.status < 500 && response.status !== 429)) {
          return { response, retryCount: attempt };
        }

        lastError = new Error(`HTTP ${response.status}`);
      } catch (error: unknown) {
        lastError = error;
        const message =
          error instanceof Error ? error.message : 'Unknown fetch error';

        if (isAdaptiveAiDebugEnabled()) {
          logAdaptiveAiDebug(this.logger, 'ai.http_attempt_failed', {
            ...debug,
            attempt: attempt + 1,
            maxAttempts: client.maxRetries + 1,
            durationMs: Date.now() - attemptStartedAt,
            error: message,
          });
        }
      }

      if (attempt < client.maxRetries) {
        const delayMs = 250 * 2 ** attempt;
        if (isAdaptiveAiDebugEnabled()) {
          logAdaptiveAiDebug(this.logger, 'ai.retry_scheduled', {
            ...debug,
            attempt: attempt + 1,
            delayMs,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    this.logger.error(
      `AI request failed after retries provider=${client.provider} baseUrl=${client.baseUrl} lastError=${lastError instanceof Error ? lastError.message : String(lastError)}`,
    );
    throw new ServiceUnavailableException('AI provider is unavailable');
  }
}
