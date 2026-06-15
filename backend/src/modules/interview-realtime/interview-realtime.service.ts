import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Server } from 'socket.io';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import type {
  InterviewRealtimeEvent,
  InterviewRealtimeEventType,
  JoinInterviewRoomPayload,
} from './types/interview-realtime-event.types';

import type { InterviewMessageStreamPayload } from './types/interview-message-stream.types';

export type EmitInterviewRealtimeEventInput = {
  attemptId: number;
  eventType: InterviewRealtimeEventType;
  interviewQuestionId?: number | null;
  messageId?: number | null;
  followUpId?: number | null;
  sequenceOrder?: number | null;
  messageKind?: string | null;
  stream?: InterviewMessageStreamPayload | null;
};

@Injectable()
export class InterviewRealtimeService {
  private readonly logger = new Logger(InterviewRealtimeService.name);
  private server: Server | null = null;
  private sequenceCounter = 0;

  constructor(private readonly interviewRepository: InterviewCoreRepository) {}

  setServer(server: Server): void {
    this.server = server;
  }

  attemptRoom(attemptId: number | string): string {
    return `attempt:${attemptId}`;
  }

  async validateJoin(payload: JoinInterviewRoomPayload): Promise<boolean> {
    const attemptId = Number(payload.attemptId);
    if (!Number.isInteger(attemptId) || attemptId < 1) {
      return false;
    }

    const attempt = await this.interviewRepository.findAttemptById(
      attemptId,
      payload.publicToken.trim(),
    );

    return attempt !== null;
  }

  emit(input: EmitInterviewRealtimeEventInput): InterviewRealtimeEvent {
    const event = this.buildEvent(input);

    if (!this.server) {
      this.logger.debug(
        `Realtime server not ready; skipped ${event.eventType} attempt=${event.attemptId}`,
      );
      return event;
    }

    this.server
      .to(this.attemptRoom(input.attemptId))
      .emit('interview.event', event);

    this.logger.log(
      `Emitted ${event.eventType} attempt=${event.attemptId} question=${event.interviewQuestionId ?? 'n/a'}`,
    );

    return event;
  }

  private buildEvent(
    input: EmitInterviewRealtimeEventInput,
  ): InterviewRealtimeEvent {
    this.sequenceCounter += 1;

    return {
      eventId: `${input.attemptId}-${this.sequenceCounter}-${randomUUID().slice(0, 8)}`,
      eventType: input.eventType,
      attemptId: String(input.attemptId),
      interviewQuestionId: input.interviewQuestionId
        ? String(input.interviewQuestionId)
        : null,
      messageId: input.messageId ? String(input.messageId) : null,
      followUpId: input.followUpId ? String(input.followUpId) : null,
      sequenceOrder: input.sequenceOrder ?? null,
      messageKind: input.messageKind ?? null,
      stream: input.stream ?? null,
      createdAt: new Date().toISOString(),
    };
  }
}
