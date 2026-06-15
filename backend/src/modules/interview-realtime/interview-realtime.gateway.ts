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

  constructor(private readonly interviewRealtimeService: InterviewRealtimeService) {}

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
  }
}
