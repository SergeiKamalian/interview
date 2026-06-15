import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../../common/redis/redis.service';
import { AdaptiveAiConversationService } from './adaptive-ai-conversation.service';

describe('AdaptiveAiConversationService', () => {
  let service: AdaptiveAiConversationService;
  let redisService: jest.Mocked<Pick<RedisService, 'getJson' | 'setJson' | 'del'>>;

  beforeEach(async () => {
    redisService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdaptiveAiConversationService,
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get(AdaptiveAiConversationService);
  });

  it('creates bootstrap session with system, user, assistant messages', () => {
    const session = service.createBootstrapSession({
      promptVersion: 'v1',
      systemPrompt: 'system',
      bootstrapUserPrompt: 'bootstrap',
      bootstrapAssistantAck: 'ack',
    });

    expect(session.messages).toHaveLength(3);
    expect(session.turnCount).toBe(0);
  });

  it('saves and loads session by prompt version', async () => {
    const key = service.buildSessionKey('evaluate', 5, 10);
    const session = service.createBootstrapSession({
      promptVersion: 'v1',
      systemPrompt: 'system',
      bootstrapUserPrompt: 'bootstrap',
      bootstrapAssistantAck: 'ack',
    });

    redisService.getJson.mockResolvedValueOnce(session);

    await service.saveSession(key, session);
    const loaded = await service.loadSession(key, 'v1');

    expect(redisService.setJson).toHaveBeenCalled();
    expect(loaded?.promptVersion).toBe('v1');
  });
});
