import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsTtsService } from '../elevenlabs/elevenlabs-tts.service';
import { InterviewRealtimeService } from './interview-realtime.service';
import type { StreamAiAudioInput } from './types/interview-audio-stream.types';

@Injectable()
export class InterviewAiAudioStreamService {
  private readonly logger = new Logger(InterviewAiAudioStreamService.name);

  constructor(
    private readonly elevenLabsTtsService: ElevenLabsTtsService,
    private readonly interviewRealtimeService: InterviewRealtimeService,
  ) {}

  isEnabled(): boolean {
    return this.elevenLabsTtsService.isEnabled();
  }

  streamAudioForText(input: StreamAiAudioInput): void {
    if (!this.isEnabled()) {
      return;
    }

    void this.runStream(input).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `AI audio stream failed attempt=${input.attemptId} stream=${input.streamId}: ${message}`,
      );
    });
  }

  private async runStream(input: StreamAiAudioInput): Promise<void> {
    const text = this.elevenLabsTtsService.normalizeText(input.text);
    if (!text) {
      return;
    }

    this.interviewRealtimeService.emit({
      attemptId: input.attemptId,
      eventType: 'ai.audio.stream_started',
      interviewQuestionId: input.interviewQuestionId,
      messageKind: input.messageKind,
      audio: {
        streamId: input.streamId,
        mimeType: 'audio/mpeg',
      },
    });

    const generator = this.elevenLabsTtsService.streamText(text);
    let chunkIndex = 0;
    let result = await generator.next();

    while (!result.done) {
      const chunk = result.value;
      this.interviewRealtimeService.emit({
        attemptId: input.attemptId,
        eventType: 'ai.audio.stream_chunk',
        interviewQuestionId: input.interviewQuestionId,
        messageKind: input.messageKind,
        audio: {
          streamId: input.streamId,
          mimeType: 'audio/mpeg',
          chunkIndex,
          audioBase64: chunk.toString('base64'),
        },
      });
      chunkIndex += 1;
      result = await generator.next();
    }

    const streamResult = result.value;
    const finalBuffer =
      streamResult.chunks.length > 0
        ? Buffer.concat(streamResult.chunks)
        : Buffer.alloc(0);

    this.interviewRealtimeService.emit({
      attemptId: input.attemptId,
      eventType: 'ai.audio.stream_completed',
      interviewQuestionId: input.interviewQuestionId,
      messageKind: input.messageKind,
      audio: {
        streamId: input.streamId,
        mimeType: streamResult.mimeType,
        audioBase64Final:
          finalBuffer.byteLength > 0 ? finalBuffer.toString('base64') : undefined,
      },
    });
  }
}
