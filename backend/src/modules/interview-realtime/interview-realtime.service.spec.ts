import { Test, TestingModule } from '@nestjs/testing';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import { InterviewRealtimeService } from './interview-realtime.service';

describe('InterviewRealtimeService', () => {
  let service: InterviewRealtimeService;
  let repository: jest.Mocked<Pick<InterviewCoreRepository, 'findAttemptById'>>;

  beforeEach(async () => {
    repository = {
      findAttemptById: jest.fn().mockResolvedValue({ id: 5 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewRealtimeService,
        {
          provide: InterviewCoreRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(InterviewRealtimeService);
  });

  it('validates join when attempt belongs to public token', async () => {
    const isValid = await service.validateJoin({
      publicToken: 'token-1',
      attemptId: '5',
    });

    expect(isValid).toBe(true);
    expect(repository.findAttemptById).toHaveBeenCalledWith(5, 'token-1');
  });

  it('builds public-safe event payload', () => {
    const event = service.emit({
      attemptId: 5,
      eventType: 'answer.received',
      interviewQuestionId: 10,
      messageId: 22,
      sequenceOrder: 3,
      messageKind: 'main_answer',
    });

    expect(event.eventType).toBe('answer.received');
    expect(event.attemptId).toBe('5');
    expect(event.messageId).toBe('22');
    expect(event).not.toHaveProperty('idealAnswer');
  });
});
