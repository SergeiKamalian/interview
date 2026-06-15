import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import { FollowUpRepository } from '../repositories/follow-up.repository';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';
import { FollowUpPlannerService } from './follow-up-planner.service';
import { FollowUpPlannerValidatorService } from './follow-up-planner-validator.service';
import { FollowUpPolicyService } from './follow-up-policy.service';
import { InterviewAiMessageStreamService } from '../../interview-realtime/interview-ai-message-stream.service';

describe('FollowUpPlannerService', () => {
  let service: FollowUpPlannerService;
  let adaptiveInterviewContextService: jest.Mocked<
    Pick<AdaptiveInterviewContextService, 'buildContextPacket'>
  >;
  let followUpPolicyService: jest.Mocked<
    Pick<FollowUpPolicyService, 'evaluate'>
  >;
  let checkpointStateRepository: jest.Mocked<
    Pick<
      CheckpointStateRepository,
      'findByAttemptAndQuestion' | 'incrementFollowUpCount'
    >
  >;
  let followUpRepository: jest.Mocked<
    Pick<
      FollowUpRepository,
      'listByAttemptAndQuestion' | 'countUsedForQuestion' | 'create'
    >
  >;
  let aiProviderService: jest.Mocked<
    Pick<AiProviderService, 'evaluateJson' | 'getClientConfig'>
  >;
  let aiMessageStreamService: jest.Mocked<
    Pick<
      InterviewAiMessageStreamService,
      'isEnabled' | 'streamStaticText' | 'streamLlmText'
    >
  >;

  const contextPacket = {
    interviewQuestionId: 10,
    interviewId: 1,
    attemptId: 5,
    companyId: 7,
    questionText: 'What is useEffect?',
    referenceAnswer: 'Hook for side effects.',
    maxScore: 2,
    checkpoints: [
      {
        checkpointKey: 'dependency_array',
        title: 'Dependency array',
        expected: 'Explains dependency array',
        score: 2,
        sortOrder: 0,
      },
    ],
    latestCandidateAnswer: 'It runs after render.',
    latestCandidateMessageId: 22,
    checkpointStates: [],
    evidenceSnippets: [],
    localTurns: [],
    followUpLimits: {
      maxPerQuestion: 3,
      maxPerCheckpoint: 1,
      usedForQuestion: 0,
    },
  };

  beforeEach(async () => {
    adaptiveInterviewContextService = {
      buildContextPacket: jest.fn().mockResolvedValue(contextPacket),
    };
    followUpPolicyService = {
      evaluate: jest.fn(),
    };
    checkpointStateRepository = {
      findByAttemptAndQuestion: jest.fn().mockResolvedValue([
        {
          id: 1,
          companyId: 7,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          checkpointKey: 'dependency_array',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 2,
          confidence: null,
          evidenceSummary: null,
          evidenceMessageIds: null,
          rationale: null,
          followUpCount: 0,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      incrementFollowUpCount: jest.fn(),
    };
    followUpRepository = {
      listByAttemptAndQuestion: jest.fn().mockResolvedValue([]),
      countUsedForQuestion: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({
        id: 99,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        checkpointKey: 'dependency_array',
        followUpQuestionMessageId: null,
        candidateAnswerMessageId: null,
        questionText: 'Can you explain the dependency array?',
        reason: 'checkpoint_missed',
        status: 'planned',
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    aiProviderService = {
      evaluateJson: jest.fn(),
      getClientConfig: jest.fn().mockReturnValue({
        model: 'gpt-4o-mini',
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        timeoutMs: 30000,
        maxRetries: 2,
        temperature: 0,
      }),
    };
    aiMessageStreamService = {
      isEnabled: jest.fn().mockReturnValue(false),
      streamStaticText: jest.fn(({ text }) => Promise.resolve(text)),
      streamLlmText: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUpPlannerService,
        FollowUpPlannerValidatorService,
        {
          provide: AdaptiveInterviewContextService,
          useValue: adaptiveInterviewContextService,
        },
        {
          provide: FollowUpPolicyService,
          useValue: followUpPolicyService,
        },
        {
          provide: CheckpointStateRepository,
          useValue: checkpointStateRepository,
        },
        {
          provide: FollowUpRepository,
          useValue: followUpRepository,
        },
        {
          provide: AiProviderService,
          useValue: aiProviderService,
        },
        {
          provide: AiUsageLogService,
          useValue: {
            createCorrelationId: jest.fn().mockReturnValue('corr-2'),
            logCompletion: jest.fn(),
          },
        },
        {
          provide: InterviewAiMessageStreamService,
          useValue: aiMessageStreamService,
        },
      ],
    }).compile();

    service = module.get(FollowUpPlannerService);
  });

  it('persists a planned follow-up when policy selects a checkpoint (template fallback)', async () => {
    process.env.ADAPTIVE_FOLLOW_UP_USE_LLM = 'false';

    followUpPolicyService.evaluate.mockReturnValue({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'dependency_array',
      checkpointTitle: 'Dependency array',
      checkpointExpected: 'Explains dependency array',
      reason: 'checkpoint_missed',
    });

    const result = await service.planFollowUp(5, 10);

    expect(result.status).toBe('planned');
    if (result.status === 'planned') {
      expect(result.checkpointKey).toBe('dependency_array');
      expect(result.usedTemplate).toBe(true);
      expect(result.followUpQuestion).not.toContain('Понимает');
    }
    expect(aiProviderService.evaluateJson).not.toHaveBeenCalled();
    expect(followUpRepository.create).toHaveBeenCalled();
    expect(
      checkpointStateRepository.incrementFollowUpCount,
    ).toHaveBeenCalledWith(5, 10, 'dependency_array');

    delete process.env.ADAPTIVE_FOLLOW_UP_USE_LLM;
  });

  it('uses LLM planner by default when LLM flag is enabled', async () => {
    process.env.ADAPTIVE_FOLLOW_UP_USE_LLM = 'true';
    process.env.ADAPTIVE_INTERVIEW_ENABLED = 'false';

    followUpPolicyService.evaluate.mockReturnValue({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'dependency_array',
      checkpointTitle: 'Dependency array',
      checkpointExpected: 'Explains dependency array',
      reason: 'checkpoint_missed',
    });

    aiProviderService.evaluateJson.mockResolvedValue({
      content: JSON.stringify({
        follow_up_question: 'Can you explain the dependency array?',
        reason: 'Checkpoint still missed.',
      }),
      model: 'gpt-4o-mini',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      latencyMs: 8,
    });

    const result = await service.planFollowUp(5, 10);

    expect(result.status).toBe('planned');
    if (result.status === 'planned') {
      expect(result.usedTemplate).toBe(false);
    }
    expect(aiProviderService.evaluateJson).toHaveBeenCalled();

    delete process.env.ADAPTIVE_FOLLOW_UP_USE_LLM;
    delete process.env.ADAPTIVE_INTERVIEW_ENABLED;
  });

  it('streams template follow-up when streaming is enabled and LLM is off', async () => {
    process.env.ADAPTIVE_FOLLOW_UP_USE_LLM = 'false';
    aiMessageStreamService.isEnabled.mockReturnValue(true);
    aiMessageStreamService.streamStaticText.mockResolvedValue(
      'Можете подробнее рассказать про «Dependency array»?',
    );

    followUpPolicyService.evaluate.mockReturnValue({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'dependency_array',
      checkpointTitle: 'Dependency array',
      checkpointExpected: 'Explains dependency array',
      reason: 'checkpoint_missed',
    });

    const result = await service.planFollowUp(5, 10);

    expect(result.status).toBe('planned');
    expect(aiMessageStreamService.streamStaticText).toHaveBeenCalled();
    expect(aiProviderService.evaluateJson).not.toHaveBeenCalled();

    delete process.env.ADAPTIVE_FOLLOW_UP_USE_LLM;
  });

  it('uses LLM streaming when both LLM and streaming flags are enabled', async () => {
    process.env.ADAPTIVE_FOLLOW_UP_USE_LLM = 'true';
    process.env.ADAPTIVE_INTERVIEW_ENABLED = 'true';
    process.env.ADAPTIVE_AI_MESSAGE_STREAMING = 'true';
    aiMessageStreamService.isEnabled.mockReturnValue(true);
    aiMessageStreamService.streamLlmText.mockResolvedValue(
      'Can you explain the dependency array?',
    );

    followUpPolicyService.evaluate.mockReturnValue({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'dependency_array',
      checkpointTitle: 'Dependency array',
      checkpointExpected: 'Explains dependency array',
      reason: 'checkpoint_missed',
    });

    const result = await service.planFollowUp(5, 10);

    expect(result.status).toBe('planned');
    expect(aiMessageStreamService.streamLlmText).toHaveBeenCalled();
    expect(aiProviderService.evaluateJson).not.toHaveBeenCalled();

    delete process.env.ADAPTIVE_FOLLOW_UP_USE_LLM;
    delete process.env.ADAPTIVE_INTERVIEW_ENABLED;
    delete process.env.ADAPTIVE_AI_MESSAGE_STREAMING;
  });

  it('uses template fallback without a second LLM call when evaluator already handled the turn', async () => {
    process.env.ADAPTIVE_FOLLOW_UP_USE_LLM = 'true';
    process.env.ADAPTIVE_INTERVIEW_ENABLED = 'true';
    process.env.ADAPTIVE_AI_MESSAGE_STREAMING = 'true';
    aiMessageStreamService.isEnabled.mockReturnValue(true);
    aiMessageStreamService.streamStaticText.mockResolvedValue(
      'Понял, спасибо — можете подробнее раскрыть роль массива зависимостей?',
    );

    followUpPolicyService.evaluate.mockReturnValue({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'dependency_array',
      checkpointTitle: 'Dependency array',
      checkpointExpected: 'Explains dependency array',
      reason: 'checkpoint_missed',
    });

    const result = await service.planFollowUp(5, 10, {
      context: contextPacket,
      suggestedFollowUp: null,
      candidateDispositionFromAi: 'engaged',
      followUpsUsedForQuestion: 0,
      avoidLlmFallback: true,
    });

    expect(result.status).toBe('planned');
    if (result.status === 'planned') {
      expect(result.usedTemplate).toBe(true);
      expect(result.reason).toBe('combined_turn_template_fallback');
    }
    expect(aiProviderService.evaluateJson).not.toHaveBeenCalled();
    expect(aiMessageStreamService.streamLlmText).not.toHaveBeenCalled();
    expect(aiMessageStreamService.streamStaticText).toHaveBeenCalled();

    delete process.env.ADAPTIVE_FOLLOW_UP_USE_LLM;
    delete process.env.ADAPTIVE_INTERVIEW_ENABLED;
    delete process.env.ADAPTIVE_AI_MESSAGE_STREAMING;
  });

  it('returns no_follow_up when policy limit is reached', async () => {
    followUpPolicyService.evaluate.mockReturnValue({
      shouldAskFollowUp: false,
      reason: 'question_follow_up_limit_reached',
    });

    const result = await service.planFollowUp(5, 10);

    expect(result).toEqual({
      status: 'no_follow_up',
      reason: 'question_follow_up_limit_reached',
    });
    expect(followUpRepository.create).not.toHaveBeenCalled();
  });

  it('uses template fallback when AI provider fails', async () => {
    process.env.ADAPTIVE_FOLLOW_UP_USE_LLM = 'true';
    process.env.ADAPTIVE_INTERVIEW_ENABLED = 'false';

    followUpPolicyService.evaluate.mockReturnValue({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'dependency_array',
      checkpointTitle: 'Dependency array',
      checkpointExpected: 'Explains dependency array',
      reason: 'checkpoint_missed',
    });

    aiProviderService.evaluateJson.mockRejectedValue(
      new ServiceUnavailableException('AI provider is unavailable'),
    );

    const result = await service.planFollowUp(5, 10);

    expect(result.status).toBe('planned');
    if (result.status === 'planned') {
      expect(result.usedTemplate).toBe(true);
      expect(result.followUpQuestion).not.toContain('Понимает');
    }

    delete process.env.ADAPTIVE_FOLLOW_UP_USE_LLM;
    delete process.env.ADAPTIVE_INTERVIEW_ENABLED;
  });
});
