import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { InterviewCurrentQuestionSpeechService } from './interview-current-question-speech.service';
import { InterviewRealtimeService } from './interview-realtime.service';
import type { JoinInterviewRoomPayload } from './types/interview-realtime-event.types';

function resolveCorsOrigins(): string[] | boolean {
  const raw = process.env.FRONTEND_ORIGIN ?? process.env.CORS_ORIGIN;
  if (!raw || raw.trim() === '*') {
    return true;
  }

  return raw.split(',').map((origin) => origin.trim());
}

@WebSocketGateway({
  namespace: '/interview',
  cors: {
    origin: resolveCorsOrigins(),
    credentials: true,
  },
})
export class InterviewRealtimeGateway implements OnGatewayInit {
  private readonly logger = new Logger(InterviewRealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly interviewRealtimeService: InterviewRealtimeService,
    private readonly currentQuestionSpeechService: InterviewCurrentQuestionSpeechService,
  ) {}

  afterInit(): void {
    this.interviewRealtimeService.setServer(this.server);
    this.logger.log('Interview realtime gateway initialized on /interview');
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinInterviewRoomPayload,
  ): Promise<void> {
    const isValid = await this.interviewRealtimeService.validateJoin(payload);

    if (!isValid) {
      client.emit('interview.error', {
        code: 'JOIN_DENIED',
        message: 'Invalid interview session',
      });
      return;
    }

    const room = this.interviewRealtimeService.attemptRoom(payload.attemptId);
    await client.join(room);

    client.emit('interview.joined', {
      attemptId: payload.attemptId,
      room,
      lastEventId: payload.lastEventId ?? null,
    });

    const attemptId = Number(payload.attemptId);
    if (Number.isInteger(attemptId) && attemptId > 0) {
      void this.currentQuestionSpeechService
        .speakOnJoin({
          attemptId,
          publicToken: payload.publicToken,
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Failed to speak on join attempt=${payload.attemptId}: ${message}`,
          );
        });
    }
  }

  @SubscribeMessage('speak_current_question')
  async handleSpeakCurrentQuestion(
    @MessageBody() payload: JoinInterviewRoomPayload,
  ): Promise<void> {
    const attemptId = Number(payload.attemptId);
    if (!Number.isInteger(attemptId) || attemptId < 1) {
      return;
    }

    const isValid = await this.interviewRealtimeService.validateJoin(payload);
    if (!isValid) {
      return;
    }

    await this.currentQuestionSpeechService.speakCurrentQuestion({
      attemptId,
      publicToken: payload.publicToken,
      force: true,
    });
  }

  @SubscribeMessage('speak_welcome')
  async handleSpeakWelcome(
    @MessageBody() payload: JoinInterviewRoomPayload,
  ): Promise<void> {
    const attemptId = Number(payload.attemptId);
    if (!Number.isInteger(attemptId) || attemptId < 1) {
      return;
    }

    const isValid = await this.interviewRealtimeService.validateJoin(payload);
    if (!isValid) {
      return;
    }

    await this.currentQuestionSpeechService.speakWelcomeIfPending({
      attemptId,
      publicToken: payload.publicToken,
      force: true,
    });
  }
}
