import { Logger } from '@nestjs/common';

const PREVIEW_MAX_CHARS = 600;

export function isAdaptiveAiDebugEnabled(): boolean {
  return readBooleanFlag(process.env.ADAPTIVE_AI_DEBUG, false);
}

export type AdaptiveAiDebugMeta = {
  attemptId?: number;
  interviewQuestionId?: number;
  operationType?: string;
  correlationId?: string;
  phase?: string;
  attemptLabel?: string;
};

export class AdaptiveAiPhaseTimer {
  private readonly startedAt = Date.now();

  constructor(
    private readonly logger: Logger,
    private readonly phase: string,
    private readonly meta: AdaptiveAiDebugMeta,
  ) {}

  finish(extra?: Record<string, unknown>): void {
    if (!isAdaptiveAiDebugEnabled()) {
      return;
    }

    logAdaptiveAiDebug(this.logger, 'phase.completed', {
      ...this.meta,
      phase: this.phase,
      durationMs: Date.now() - this.startedAt,
      ...extra,
    });
  }
}

export function startAdaptiveAiPhaseTimer(
  logger: Logger,
  phase: string,
  meta: AdaptiveAiDebugMeta,
): AdaptiveAiPhaseTimer {
  if (isAdaptiveAiDebugEnabled()) {
    logAdaptiveAiDebug(logger, 'phase.started', { ...meta, phase });
  }

  return new AdaptiveAiPhaseTimer(logger, phase, meta);
}

export function logAdaptiveAiDebug(
  logger: Logger,
  event: string,
  payload: Record<string, unknown>,
): void {
  if (!isAdaptiveAiDebugEnabled()) {
    return;
  }

  logger.log(`[adaptive-ai-debug] ${event} ${JSON.stringify(payload)}`);
}

export function summarizeAiPrompts(input: {
  systemPrompt: string;
  userPrompt: string;
}): Record<string, unknown> {
  return {
    systemPromptChars: input.systemPrompt.length,
    userPromptChars: input.userPrompt.length,
    totalPromptChars: input.systemPrompt.length + input.userPrompt.length,
    systemPromptPreview: previewText(input.systemPrompt),
    userPromptPreview: previewText(input.userPrompt),
  };
}

export function summarizeChatCompletionBody(input: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  jsonMode?: boolean;
  temperature?: number;
}): Record<string, unknown> {
  const messageSummaries = input.messages.map((message) => ({
    role: message.role,
    chars: message.content.length,
    preview: previewText(message.content),
  }));

  return {
    model: input.model,
    jsonMode: input.jsonMode ?? false,
    temperature: input.temperature,
    messageCount: input.messages.length,
    totalContentChars: input.messages.reduce(
      (total, message) => total + message.content.length,
      0,
    ),
    messages: messageSummaries,
  };
}

function previewText(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= PREVIEW_MAX_CHARS) {
    return trimmed;
  }

  return `${trimmed.slice(0, PREVIEW_MAX_CHARS)}…`;
}

function readBooleanFlag(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}
