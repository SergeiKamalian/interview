import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';
import { CheckpointStateService } from './checkpoint-state.service';
import { PerTurnCheckpointEvaluatorService } from './per-turn-checkpoint-evaluator.service';
import { PerTurnEvaluationValidatorService } from './per-turn-evaluation-validator.service';
import { AdaptiveAiConversationService } from './adaptive-ai-conversation.service';

describe('PerTurnCheckpointEvaluatorService', () => {
  let service: PerTurnCheckpointEvaluatorService;
  let adaptiveInterviewContextService: jest.Mocked<
    Pick<AdaptiveInterviewContextService, 'buildContextPacket'>
  >;
  let checkpointStateService: jest.Mocked<
    Pick<CheckpointStateService, 'ensureCheckpointStatesForQuestion'>
  >;
  let checkpointStateRepository: jest.Mocked<
    Pick<
      CheckpointStateRepository,
      'applyTurnEvaluationResults' | 'markNeedsManualReviewForQuestion'
    >
  >;
  let aiProviderService: jest.Mocked<Pick<AiProviderService, 'evaluateJson'>>;
  let aiUsageLogService: jest.Mocked<
    Pick<AiUsageLogService, 'createCorrelationId' | 'logCompletion'>
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
        score: 1,
        sortOrder: 0,
      },
      {
        checkpointKey: 'cleanup',
        title: 'Cleanup',
        expected: 'Explains cleanup',
        score: 1,
        sortOrder: 1,
      },
    ],
    latestCandidateAnswer: 'useEffect runs after render.',
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
    process.env.ADAPTIVE_AI_CONVERSATION_SESSION = 'false';
    process.env.ADAPTIVE_AI_COMBINED_TURN = 'false';

    adaptiveInterviewContextService = {
      buildContextPacket: jest.fn(),
    };
    checkpointStateService = {
      ensureCheckpointStatesForQuestion: jest.fn(),
    };
    checkpointStateRepository = {
      applyTurnEvaluationResults: jest.fn(),
      markNeedsManualReviewForQuestion: jest.fn(),
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
    aiUsageLogService = {
      createCorrelationId: jest.fn().mockReturnValue('corr-1'),
      logCompletion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerTurnCheckpointEvaluatorService,
        PerTurnEvaluationValidatorService,
        {
          provide: AdaptiveInterviewContextService,
          useValue: adaptiveInterviewContextService,
        },
        {
          provide: CheckpointStateService,
          useValue: checkpointStateService,
        },
        {
          provide: CheckpointStateRepository,
          useValue: checkpointStateRepository,
        },
        {
          provide: AiProviderService,
          useValue: aiProviderService,
        },
        {
          provide: AiUsageLogService,
          useValue: aiUsageLogService,
        },
        {
          provide: AdaptiveAiConversationService,
          useValue: {
            buildSessionKey: jest.fn(),
            loadSession: jest.fn(),
            saveSession: jest.fn(),
            createBootstrapSession: jest.fn(),
            buildCompletionMessages: jest.fn(),
            appendTurn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PerTurnCheckpointEvaluatorService);
    adaptiveInterviewContextService.buildContextPacket.mockResolvedValue(
      contextPacket,
    );
  });

  it('persists covered/partial/missed checkpoint states from a valid AI response', async () => {
    aiProviderService.evaluateJson.mockResolvedValue({
      content: JSON.stringify({
        candidate_disposition: 'engaged',
        checkpoint_results: [
          {
            checkpoint_key: 'dependency_array',
            status: 'missed',
            score_awarded: 0,
            confidence: 0.9,
            evidence_summary: null,
            rationale: 'No dependency array mention.',
          },
          {
            checkpoint_key: 'cleanup',
            status: 'partial',
            score_awarded: 0.5,
            confidence: 0.7,
            evidence_summary: 'Brief cleanup mention',
            rationale: 'Partial cleanup coverage.',
          },
        ],
      }),
      model: 'gpt-4o-mini',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      latencyMs: 10,
    });

    checkpointStateRepository.applyTurnEvaluationResults.mockResolvedValue([
      {
        id: 1,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        checkpointKey: 'dependency_array',
        status: 'missed',
        scoreAwarded: 0,
        maxScore: 1,
        confidence: 0.9,
        evidenceSummary: null,
        evidenceMessageIds: [22],
        rationale: 'No dependency array mention.',
        followUpCount: 0,
        needsManualReview: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.evaluateTurnAndPersist({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
    });

    expect(result.status).toBe('valid');
    expect(
      checkpointStateRepository.applyTurnEvaluationResults,
    ).toHaveBeenCalledWith({
      attemptId: 5,
      interviewQuestionId: 10,
      candidateMessageId: 22,
      results: [
        expect.objectContaining({
          checkpointKey: 'dependency_array',
          status: 'missed',
          scoreAwarded: 0,
        }),
        expect.objectContaining({
          checkpointKey: 'cleanup',
          status: 'partial',
          scoreAwarded: 0.5,
        }),
      ],
    });
  });

  it('marks manual review when AI response stays invalid after repair', async () => {
    aiProviderService.evaluateJson
      .mockResolvedValueOnce({
        content: '{"checkpoint_results":[]}',
        model: 'gpt-4o-mini',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        latencyMs: 10,
      })
      .mockResolvedValueOnce({
        content: '{"checkpoint_results":[]}',
        model: 'gpt-4o-mini',
        usage: { promptTokens: 2, completionTokens: 2, totalTokens: 4 },
        latencyMs: 12,
      });

    const result = await service.evaluateTurnAndPersist({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
    });

    expect(result.status).toBe('invalid_ai_response');
    expect(
      checkpointStateRepository.markNeedsManualReviewForQuestion,
    ).toHaveBeenCalledWith(5, 10);
    expect(
      checkpointStateRepository.applyTurnEvaluationResults,
    ).not.toHaveBeenCalled();
  });

  it('returns provider_error without throwing when AI provider fails', async () => {
    aiProviderService.evaluateJson.mockRejectedValue(
      new ServiceUnavailableException('AI provider is unavailable'),
    );

    const result = await service.evaluateTurnAndPersist({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
    });

    expect(result.status).toBe('provider_error');
    expect(
      checkpointStateRepository.markNeedsManualReviewForQuestion,
    ).toHaveBeenCalledWith(5, 10);
  });
});
