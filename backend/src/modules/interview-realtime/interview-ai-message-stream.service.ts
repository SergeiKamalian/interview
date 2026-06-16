import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import { InterviewAiAudioStreamService } from './interview-ai-audio-stream.service';
import { isAiMessageStreamingEnabled } from './config/interview-stream.config';
import type { StreamAiMessageInput } from './types/interview-message-stream.types';
import { InterviewRealtimeService } from './interview-realtime.service';
import { chunkTextForStream } from './utils/chunk-text.util';

const STATIC_STREAM_CHUNK_DELAY_MS = 12;

@Injectable()
export class InterviewAiMessageStreamService {
  constructor(
    private readonly interviewRealtimeService: InterviewRealtimeService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiAudioStreamService: InterviewAiAudioStreamService,
  ) {}

  isEnabled(): boolean {
    return isAiMessageStreamingEnabled();
  }

  async streamStaticText(
    input: StreamAiMessageInput & { text: string },
  ): Promise<string> {
    const text = input.text.trim();
    if (!this.isEnabled() || !text) {
      return text;
    }

    const streamId = randomUUID();
    this.emitStarted(input, streamId);
    this.startAudioStream(input, streamId, text);

    let contentSoFar = '';
    for (const chunk of chunkTextForStream(text)) {
      contentSoFar += chunk;
      this.emitDelta(input, streamId, chunk, contentSoFar);
      await this.delay(STATIC_STREAM_CHUNK_DELAY_MS);
    }

    this.emitCompleted(input, streamId, contentSoFar);
    return contentSoFar;
  }

  async streamLlmText(
    input: StreamAiMessageInput & {
      systemPrompt: string;
      userPrompt: string;
      operationType?: string;
      correlationId?: string;
    },
  ): Promise<string> {
    if (!this.isEnabled()) {
      const completion = await this.aiProviderService.createChatCompletion(
        [
          { role: 'system', content: input.systemPrompt },
          { role: 'user', content: input.userPrompt },
        ],
        {
          debug: {
            attemptId: input.attemptId,
            interviewQuestionId: input.interviewQuestionId,
            operationType: input.operationType ?? 'stream_message',
            correlationId: input.correlationId,
          },
        },
      );

      return completion.content.trim();
    }

    const streamId = randomUUID();
    this.emitStarted(input, streamId);

    // TODO(openai-responses-stream): switch adaptive follow-up LLM streaming to
    // AiProviderService.streamResponseText under a feature flag once planner
    // state can safely pass previous_response_id without rebuilding prompt history.
    const completion = await this.aiProviderService.streamChatCompletion(
      [
        { role: 'system', content: input.systemPrompt },
        { role: 'user', content: input.userPrompt },
      ],
      {
        debug: {
          attemptId: input.attemptId,
          interviewQuestionId: input.interviewQuestionId,
          operationType: input.operationType ?? 'stream_message',
          correlationId: input.correlationId,
        },
        onDelta: (delta, contentSoFar) => {
          this.emitDelta(input, streamId, delta, contentSoFar);
        },
      },
    );

    this.emitCompleted(input, streamId, completion.content);
    this.startAudioStream(input, streamId, completion.content);
    return completion.content;
  }

  private emitStarted(input: StreamAiMessageInput, streamId: string): void {
    this.interviewRealtimeService.emit({
      attemptId: input.attemptId,
      eventType: 'ai.message.stream_started',
      interviewQuestionId: input.interviewQuestionId,
      messageKind: input.messageKind,
      stream: { streamId },
    });
  }

  private emitDelta(
    input: StreamAiMessageInput,
    streamId: string,
    delta: string,
    contentSoFar: string,
  ): void {
    this.interviewRealtimeService.emit({
      attemptId: input.attemptId,
      eventType: 'ai.message.stream_delta',
      interviewQuestionId: input.interviewQuestionId,
      messageKind: input.messageKind,
      stream: {
        streamId,
        delta,
        contentSoFar,
      },
    });
  }

  private emitCompleted(
    input: StreamAiMessageInput,
    streamId: string,
    content: string,
  ): void {
    this.interviewRealtimeService.emit({
      attemptId: input.attemptId,
      eventType: 'ai.message.stream_completed',
      interviewQuestionId: input.interviewQuestionId,
      messageKind: input.messageKind,
      stream: {
        streamId,
        content,
        contentSoFar: content,
      },
    });
  }

  private startAudioStream(
    input: StreamAiMessageInput,
    streamId: string,
    text: string,
  ): void {
    this.aiAudioStreamService.streamAudioForText({
      attemptId: input.attemptId,
      interviewQuestionId: input.interviewQuestionId,
      messageKind: input.messageKind,
      streamId,
      text,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
