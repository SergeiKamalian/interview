import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io as ioClient, type Socket } from 'socket.io-client';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import { InterviewCurrentQuestionSpeechService } from '../interview-realtime/interview-current-question-speech.service';
import { InterviewRealtimeGateway } from '../interview-realtime/interview-realtime.gateway';
import { InterviewRealtimeService } from '../interview-realtime/interview-realtime.service';

jest.setTimeout(15000);

describe('Interview realtime gateway', () => {
  let app: INestApplication;
  let port: number;
  let socket: Socket | null = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewRealtimeService,
        InterviewRealtimeGateway,
        {
          provide: InterviewCoreRepository,
          useValue: {
            findAttemptById: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: InterviewCurrentQuestionSpeechService,
          useValue: {
            speakOnJoin: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.init();
    await app.listen(0);
    port = app.getHttpServer().address().port;
  });

  afterAll(async () => {
    socket?.disconnect();
    await app.close();
  });

  it('rejects invalid join and accepts socket connection', async () => {
    socket = ioClient(`http://127.0.0.1:${port}/interview`, {
      transports: ['websocket'],
      forceNew: true,
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('socket timeout')), 5000);
      socket!.on('connect', () => {
        clearTimeout(timeout);
        resolve();
      });
      socket!.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    const joinResult = await new Promise<{ code?: string }>((resolve) => {
      socket!.emit('join', {
        publicToken: 'invalid-token',
        attemptId: '1',
      });
      socket!.once('interview.error', (payload) => resolve(payload));
      setTimeout(() => resolve({}), 1000);
    });

    expect(joinResult.code).toBe('JOIN_DENIED');
  });
});
