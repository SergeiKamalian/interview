import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import OpenAI, { APIError } from 'openai';
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import type {
  Response,
  ResponseCreateParamsNonStreaming,
  ResponseCreateParamsStreaming,
  ResponseInput,
} from 'openai/resources/responses/responses';
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
  cachedTokens?: number;
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  usage: ChatCompletionUsage;
  latencyMs: number;
};

export type ResponseCompletionResult = ChatCompletionResult & {
  responseId: string;
};

export type AiProviderDebugContext = AdaptiveAiDebugMeta;

export type StreamChatCompletionOptions = {
  model?: string;
  debug?: AiProviderDebugContext;
  onDelta: (delta: string, contentSoFar: string) => void;
};

export type StreamResponseTextOptions = {
  model?: string;
  input: string | ChatMessage[];
  instructions?: string;
  previousResponseId?: string;
  conversationId?: string;
  store?: boolean;
  metadata?: Record<string, string | number | boolean | null>;
  debug?: AiProviderDebugContext;
  onTextDelta: (delta: string, contentSoFar: string) => void;
  onDone?: (result: ResponseCompletionResult) => void;
};

export type CreateResponseTextOptions = {
  model?: string;
  messages: ChatMessage[];
  previousResponseId?: string;
  conversationId?: string;
  store?: boolean;
  debug?: AiProviderDebugContext;
  metadata?: Record<string, string | number | boolean | null>;
};

type OpenAiChatUsage =
  | ChatCompletion['usage']
  | NonNullable<ChatCompletionChunk['usage']>;

type ResponseOutputWithContent = {
  content?: Array<{ text?: string | null }>;
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
    const model =
      options?.model ??
      this.aiProviderConfig.resolveModel(options?.debug?.operationType);

    const body: ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: this.toChatMessages(messages),
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
    const { result: payload, retryCount } = await this.runWithAiErrorHandling(
      () =>
        this.createSdkClient(config.apiKey, client).chat.completions.create(
          body,
          this.createRequestOptions(client),
        ),
      {
        ...options?.debug,
        provider: client.provider,
        model,
        operationType: options?.debug?.operationType ?? 'chat_completion',
      },
      `Chat completion failed provider=${client.provider} model=${model}`,
    );
    const latencyMs = Date.now() - startedAt;

    const content = payload.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new ServiceUnavailableException(
        'AI provider returned empty response',
      );
    }

    const result: ChatCompletionResult = {
      content,
      model: payload.model ?? model,
      usage: this.toChatCompletionUsage(payload.usage),
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
        cachedTokens: result.usage.cachedTokens,
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

  async createResponseJson(
    messages: ChatMessage[],
    options?: {
      previousResponseId?: string;
      conversationId?: string;
      model?: string;
      debug?: AiProviderDebugContext;
      store?: boolean;
      metadata?: Record<string, string | number | boolean | null>;
    },
  ): Promise<ResponseCompletionResult> {
    const config = this.aiProviderConfig.getConfig();
    const client = this.aiProviderConfig.getClientConfig();
    const model =
      options?.model ??
      this.aiProviderConfig.resolveModel(options?.debug?.operationType);

    const body: ResponseCreateParamsNonStreaming = {
      model,
      input: this.toResponseInput(messages),
      temperature: client.temperature,
      store: options?.store ?? true,
      text: {
        format: {
          type: 'json_object',
        },
      },
    };

    this.applyResponseStateOptions(body, options);

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.responses_request', {
        ...options?.debug,
        provider: client.provider,
        baseUrl: client.baseUrl,
        timeoutMs: client.timeoutMs,
        maxRetries: client.maxRetries,
        previousResponseId: options?.previousResponseId,
        conversationId: options?.conversationId,
        body: summarizeChatCompletionBody({
          model,
          messages,
          jsonMode: true,
          temperature: client.temperature,
        }),
      });
    }

    const startedAt = Date.now();
    const { result: payload, retryCount } = await this.runWithAiErrorHandling(
      () =>
        this.createSdkClient(config.apiKey, client).responses.create(
          body,
          this.createRequestOptions(client),
        ),
      {
        ...options?.debug,
        provider: client.provider,
        model,
        operationType: options?.debug?.operationType ?? 'responses',
      },
      `Responses completion failed provider=${client.provider} model=${model}`,
    );
    const latencyMs = Date.now() - startedAt;

    const responseId = payload.id.trim();
    if (!responseId) {
      throw new ServiceUnavailableException(
        'AI provider returned response without id',
      );
    }

    const content = this.extractResponseText(payload);
    if (!content) {
      throw new ServiceUnavailableException(
        'AI provider returned empty response',
      );
    }

    const result: ResponseCompletionResult = {
      responseId,
      content,
      model: payload.model ?? model,
      usage: this.toResponsesCompletionUsage(payload.usage),
      latencyMs,
    };

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.responses_response', {
        ...options?.debug,
        provider: client.provider,
        model: result.model,
        responseId: result.responseId,
        latencyMs: result.latencyMs,
        retryCount,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        cachedTokens: result.usage.cachedTokens,
        responseChars: result.content.length,
        responsePreview:
          result.content.length > 600
            ? `${result.content.slice(0, 600)}…`
            : result.content,
      });
    }

    return result;
  }

  async createResponseText(
    options: CreateResponseTextOptions,
  ): Promise<ResponseCompletionResult> {
    const config = this.aiProviderConfig.getConfig();
    const client = this.aiProviderConfig.getClientConfig();
    const model =
      options.model ??
      this.aiProviderConfig.resolveModel(options.debug?.operationType);
    const body: ResponseCreateParamsNonStreaming = {
      model,
      input: this.toResponseInput(options.messages),
      temperature: client.temperature,
      store: options.store ?? true,
    };

    this.applyResponseStateOptions(body, options);

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.responses_text_request', {
        ...options.debug,
        provider: client.provider,
        baseUrl: client.baseUrl,
        timeoutMs: client.timeoutMs,
        maxRetries: client.maxRetries,
        previousResponseId: options.previousResponseId,
        conversationId: options.conversationId,
        body: summarizeChatCompletionBody({
          model,
          messages: options.messages,
          temperature: client.temperature,
        }),
      });
    }

    const startedAt = Date.now();
    const { result: payload, retryCount } = await this.runWithAiErrorHandling(
      () =>
        this.createSdkClient(config.apiKey, client).responses.create(
          body,
          this.createRequestOptions(client),
        ),
      {
        ...options.debug,
        provider: client.provider,
        model,
        operationType: options.debug?.operationType ?? 'responses_text',
      },
      `Responses text completion failed provider=${client.provider} model=${model}`,
    );
    const latencyMs = Date.now() - startedAt;

    const responseId = payload.id.trim();
    if (!responseId) {
      throw new ServiceUnavailableException(
        'AI provider returned response without id',
      );
    }

    const content = this.extractResponseText(payload);
    if (!content) {
      throw new ServiceUnavailableException(
        'AI provider returned empty response',
      );
    }

    const result: ResponseCompletionResult = {
      responseId,
      content,
      model: payload.model ?? model,
      usage: this.toResponsesCompletionUsage(payload.usage),
      latencyMs,
    };

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.responses_text_response', {
        ...options.debug,
        provider: client.provider,
        model: result.model,
        responseId: result.responseId,
        latencyMs: result.latencyMs,
        retryCount,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        cachedTokens: result.usage.cachedTokens,
        responseChars: result.content.length,
      });
    }

    return result;
  }

  private extractResponseText(payload: Response): string {
    if (payload.output_text?.trim()) {
      return payload.output_text.trim();
    }

    const parts =
      payload.output
        ?.filter((item) => this.hasResponseOutputContent(item))
        .flatMap((item) => item.content ?? [])
        .map((content) => content.text?.trim() ?? '')
        .filter((text) => text.length > 0) ?? [];

    return parts.join('\n').trim();
  }

  async streamChatCompletion(
    messages: ChatMessage[],
    options: StreamChatCompletionOptions,
  ): Promise<ChatCompletionResult> {
    const config = this.aiProviderConfig.getConfig();
    const client = this.aiProviderConfig.getClientConfig();
    const model =
      options.model ??
      this.aiProviderConfig.resolveModel(options.debug?.operationType);

    const body: ChatCompletionCreateParamsStreaming = {
      model,
      messages: this.toChatMessages(messages),
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
    const { result: stream, retryCount } = await this.runWithAiErrorHandling(
      () =>
        this.createSdkClient(config.apiKey, client).chat.completions.create(
          body,
          this.createRequestOptions(client),
        ),
      {
        ...options.debug,
        provider: client.provider,
        model,
        operationType: options.debug?.operationType ?? 'stream_message',
      },
      `Chat completion stream failed provider=${client.provider} model=${model}`,
    );

    let content = '';
    let resolvedModel = model;
    let usage: ChatCompletionUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    for await (const chunk of stream) {
      if (chunk.model) {
        resolvedModel = chunk.model;
      }

      if (chunk.usage) {
        usage = this.toChatCompletionUsage(chunk.usage, usage);
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
        cachedTokens: result.usage.cachedTokens,
        responseChars: result.content.length,
      });
    }

    return result;
  }

  async streamResponseText(
    options: StreamResponseTextOptions,
  ): Promise<ResponseCompletionResult> {
    const config = this.aiProviderConfig.getConfig();
    const client = this.aiProviderConfig.getClientConfig();
    const model =
      options.model ??
      this.aiProviderConfig.resolveModel(options.debug?.operationType);

    const body: ResponseCreateParamsStreaming = {
      model,
      input:
        typeof options.input === 'string'
          ? options.input
          : this.toResponseInput(options.input),
      temperature: client.temperature,
      stream: true,
      store: options.store ?? true,
    };

    if (options.instructions) {
      body.instructions = options.instructions;
    }

    this.applyResponseStateOptions(body, options);

    if (isAdaptiveAiDebugEnabled()) {
      const messages =
        typeof options.input === 'string'
          ? [{ role: 'user' as const, content: options.input }]
          : options.input;

      logAdaptiveAiDebug(this.logger, 'ai.responses_stream_request', {
        ...options.debug,
        provider: client.provider,
        baseUrl: client.baseUrl,
        timeoutMs: client.timeoutMs,
        maxRetries: client.maxRetries,
        previousResponseId: options.previousResponseId,
        conversationId: options.conversationId,
        body: summarizeChatCompletionBody({
          model,
          messages,
          temperature: client.temperature,
        }),
      });
    }

    const startedAt = Date.now();
    const { result: stream, retryCount } = await this.runWithAiErrorHandling(
      () =>
        this.createSdkClient(config.apiKey, client).responses.create(
          body,
          this.createRequestOptions(client),
        ),
      {
        ...options.debug,
        provider: client.provider,
        model,
        operationType: options.debug?.operationType ?? 'responses_stream',
      },
      `Responses stream failed provider=${client.provider} model=${model}`,
    );

    let content = '';
    let finalResponse: Response | null = null;
    let responseId = '';
    let resolvedModel = model;

    for await (const event of stream) {
      if (event.type === 'response.completed') {
        finalResponse = event.response;
        responseId = event.response.id.trim();
        resolvedModel = event.response.model ?? resolvedModel;
      } else if (event.type === 'response.output_text.delta') {
        content += event.delta;
        options.onTextDelta(event.delta, content);
      } else if (event.type === 'error') {
        throw new ServiceUnavailableException(event.message);
      } else if (
        event.type === 'response.failed' ||
        event.type === 'response.incomplete'
      ) {
        throw new ServiceUnavailableException(
          `AI provider responses stream failed: ${event.type}`,
        );
      }
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw new ServiceUnavailableException(
        'AI provider returned empty responses stream',
      );
    }

    responseId = finalResponse?.id?.trim() ?? responseId;
    if (!responseId) {
      // Some compatible providers omit final response metadata in SSE.
      // Keep this explicit so callers do not accidentally continue without state.
      throw new ServiceUnavailableException(
        'AI provider responses stream returned no response id',
      );
    }

    const result: ResponseCompletionResult = {
      responseId,
      content: trimmed,
      model: finalResponse?.model ?? resolvedModel,
      usage: this.toResponsesCompletionUsage(finalResponse?.usage),
      latencyMs: Date.now() - startedAt,
    };

    options.onDone?.(result);

    if (isAdaptiveAiDebugEnabled()) {
      logAdaptiveAiDebug(this.logger, 'ai.responses_stream_response', {
        ...options.debug,
        provider: client.provider,
        model: result.model,
        responseId: result.responseId,
        latencyMs: result.latencyMs,
        retryCount,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        cachedTokens: result.usage.cachedTokens,
        responseChars: result.content.length,
      });
    }

    return result;
  }

  private toChatCompletionUsage(
    usage: OpenAiChatUsage | undefined,
    fallback?: ChatCompletionUsage,
  ): ChatCompletionUsage {
    return {
      promptTokens: usage?.prompt_tokens ?? fallback?.promptTokens ?? 0,
      completionTokens:
        usage?.completion_tokens ?? fallback?.completionTokens ?? 0,
      totalTokens: usage?.total_tokens ?? fallback?.totalTokens ?? 0,
      cachedTokens:
        usage?.prompt_tokens_details?.cached_tokens ?? fallback?.cachedTokens,
    };
  }

  private hasResponseOutputContent(
    item: Response['output'][number],
  ): item is Response['output'][number] & ResponseOutputWithContent {
    return 'content' in item && Array.isArray(item.content);
  }

  private toResponsesCompletionUsage(
    usage: Response['usage'] | undefined,
  ): ChatCompletionUsage {
    return {
      promptTokens: usage?.input_tokens ?? 0,
      completionTokens: usage?.output_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
      cachedTokens: usage?.input_tokens_details?.cached_tokens ?? undefined,
    };
  }

  private createSdkClient(
    apiKey: string,
    client: AiProviderClientConfig,
  ): OpenAI {
    return new OpenAI({
      apiKey,
      baseURL: client.baseUrl,
      timeout: client.timeoutMs,
      maxRetries: client.maxRetries,
    });
  }

  private createRequestOptions(
    client: AiProviderClientConfig,
  ): OpenAI.RequestOptions {
    return {
      timeout: client.timeoutMs,
      maxRetries: client.maxRetries,
      signal: AbortSignal.timeout(client.timeoutMs),
    };
  }

  private toChatMessages(
    messages: ChatMessage[],
  ): ChatCompletionMessageParam[] {
    return messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }

  private toResponseInput(messages: ChatMessage[]): ResponseInput {
    return messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }

  private toSdkMetadata(
    metadata: NonNullable<StreamResponseTextOptions['metadata']>,
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries(metadata)
        .filter(([, value]) => value !== null)
        .map(([key, value]) => [key, String(value)]),
    );
  }

  private applyResponseStateOptions(
    body: ResponseCreateParamsNonStreaming | ResponseCreateParamsStreaming,
    options:
      | {
          previousResponseId?: string;
          conversationId?: string;
          metadata?: Record<string, string | number | boolean | null>;
        }
      | undefined,
  ): void {
    if (options?.previousResponseId) {
      body.previous_response_id = options.previousResponseId;
    }

    if (options?.conversationId) {
      // Official Responses API supports `conversation`, but the currently
      // installed SDK typings may lag behind the API schema.
      (body as typeof body & { conversation?: string }).conversation =
        options.conversationId;
    }

    if (options?.metadata) {
      body.metadata = this.toSdkMetadata(options.metadata);
    }
  }

  private async runWithAiErrorHandling<T>(
    request: () => Promise<T>,
    debug: AiProviderDebugContext & {
      provider: string;
      model: string;
      operationType: string;
    },
    errorPrefix: string,
  ): Promise<{ result: T; retryCount: number }> {
    const startedAt = Date.now();

    try {
      const result = await request();

      if (isAdaptiveAiDebugEnabled()) {
        logAdaptiveAiDebug(this.logger, 'ai.sdk_request_completed', {
          ...debug,
          durationMs: Date.now() - startedAt,
        });
      }

      return { result, retryCount: 0 };
    } catch (error: unknown) {
      const status = this.getApiErrorStatus(error);
      const message =
        error instanceof Error ? error.message : 'Unknown OpenAI SDK error';

      this.logger.error(
        `${errorPrefix} status=${status ?? 'unknown'} message=${message}`,
      );

      if (isAdaptiveAiDebugEnabled()) {
        logAdaptiveAiDebug(this.logger, 'ai.sdk_request_failed', {
          ...debug,
          durationMs: Date.now() - startedAt,
          httpStatus: status,
          error: message,
        });
      }

      throw new ServiceUnavailableException('AI provider request failed');
    }
  }

  private getApiErrorStatus(error: unknown): number | undefined {
    if (!(error instanceof APIError)) {
      return undefined;
    }

    return typeof error.status === 'number' ? error.status : undefined;
  }
}
