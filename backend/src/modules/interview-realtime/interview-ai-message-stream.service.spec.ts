import { Test, TestingModule } from '@nestjs/testing';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import { InterviewAiAudioStreamService } from './interview-ai-audio-stream.service';
import { InterviewAiMessageStreamService } from './interview-ai-message-stream.service';
import { InterviewRealtimeService } from './interview-realtime.service';

describe('InterviewAiMessageStreamService', () => {
  let service: InterviewAiMessageStreamService;
  let interviewRealtimeService: jest.Mocked<Pick<InterviewRealtimeService, 'emit'>>;

  beforeEach(async () => {
    process.env.ADAPTIVE_INTERVIEW_ENABLED = 'true';
    process.env.ADAPTIVE_AI_MESSAGE_STREAMING = 'true';

    interviewRealtimeService = {
      emit: jest.fn((input) => ({
        eventId: 'evt-1',
        eventType: input.eventType,
        attemptId: String(input.attemptId),
        createdAt: new Date().toISOString(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewAiMessageStreamService,
        {
          provide: InterviewRealtimeService,
          useValue: interviewRealtimeService,
        },
        {
          provide: AiProviderService,
          useValue: {
            createChatCompletion: jest.fn(),
            streamChatCompletion: jest.fn(),
          },
        },
        {
          provide: InterviewAiAudioStreamService,
          useValue: {
            streamAudioForText: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(InterviewAiMessageStreamService);
  });

  afterEach(() => {
    delete process.env.ADAPTIVE_INTERVIEW_ENABLED;
    delete process.env.ADAPTIVE_AI_MESSAGE_STREAMING;
  });

  it('emits stream lifecycle events for static text', async () => {
    const result = await service.streamStaticText({
      attemptId: 5,
      interviewQuestionId: 10,
      messageKind: 'follow_up_question',
      text: 'Hello world',
    });

    expect(result).toBe('Hello world');
    expect(interviewRealtimeService.emit).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'ai.message.stream_started' }),
    );
    expect(interviewRealtimeService.emit).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'ai.message.stream_completed' }),
    );
  });
});
