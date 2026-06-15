import { Test, TestingModule } from '@nestjs/testing';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import { CheckpointResultRepository } from '../repositories/checkpoint-result.repository';
import { QuestionEvaluationRepository } from '../repositories/question-evaluation.repository';
import { AiEvaluationService } from './ai-evaluation.service';
import { CheckpointEvaluationService } from './checkpoint-evaluation.service';
import { EvaluationContextService } from './evaluation-context.service';
import { FinalEvaluationService } from './final-evaluation.service';
import { HallucinationGuardService } from './hallucination-guard.service';

describe('AiEvaluationService', () => {
  let service: AiEvaluationService;
  let checkpointEvaluationService: jest.Mocked<
    Pick<CheckpointEvaluationService, 'evaluateQuestionAnswer'>
  >;
  let evaluationContextService: jest.Mocked<
    Pick<EvaluationContextService, 'buildCheckpointEvaluationContext'>
  >;
  let questionEvaluationRepository: jest.Mocked<
    Pick<QuestionEvaluationRepository, 'upsertByInterviewMessage'>
  >;
  let checkpointResultRepository: jest.Mocked<
    Pick<CheckpointResultRepository, 'replaceByQuestionEvaluationId'>
  >;
  let aiUsageLogService: jest.Mocked<
    Pick<AiUsageLogService, 'createCorrelationId' | 'logCompletion'>
  >;

  beforeEach(async () => {
    checkpointEvaluationService = {
      evaluateQuestionAnswer: jest.fn(),
    };
    evaluationContextService = {
      buildCheckpointEvaluationContext: jest.fn(),
    };
    questionEvaluationRepository = {
      upsertByInterviewMessage: jest.fn(),
    };
    checkpointResultRepository = {
      replaceByQuestionEvaluationId: jest.fn(),
    };
    aiUsageLogService = {
      createCorrelationId: jest.fn().mockReturnValue('corr-1'),
      logCompletion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiEvaluationService,
        HallucinationGuardService,
        {
          provide: CheckpointEvaluationService,
          useValue: checkpointEvaluationService,
        },
        {
          provide: EvaluationContextService,
          useValue: evaluationContextService,
        },
        {
          provide: QuestionEvaluationRepository,
          useValue: questionEvaluationRepository,
        },
        {
          provide: CheckpointResultRepository,
          useValue: checkpointResultRepository,
        },
        {
          provide: FinalEvaluationService,
          useValue: {},
        },
        {
          provide: InterviewCoreRepository,
          useValue: {},
        },
        {
          provide: AiUsageLogService,
          useValue: aiUsageLogService,
        },
      ],
    }).compile();

    service = module.get(AiEvaluationService);
  });

  it('persists question and checkpoint results after valid OpenAI payload', async () => {
    evaluationContextService.buildCheckpointEvaluationContext.mockResolvedValue(
      {
        interviewQuestionId: 10,
        interviewId: 1,
        attemptId: 5,
        companyId: 7,
        questionText: 'What is React?',
        idealAnswer: 'UI library',
        maxScore: 10,
        sourceQuestionId: 42,
        checkpoints: [
          {
            checkpointKey: 'react_definition',
            title: 'Defines React',
            expected: 'UI library',
            score: 10,
            sortOrder: 0,
          },
        ],
        candidateAnswer: 'React is a UI library.',
        candidateMessageId: 99,
        transcriptFragments: [],
      },
    );

    checkpointEvaluationService.evaluateQuestionAnswer.mockResolvedValue({
      status: 'valid',
      rawContent: '{}',
      response: {
        checkpoints: [
          {
            checkpointKey: 'react_definition',
            status: 'met',
            confidence: 0.9,
            evidenceQuote: 'React is a UI library.',
            reasoningShort: 'Correct.',
          },
        ],
      },
      metadata: {
        promptKey: 'checkpoint_evaluation',
        promptVersion: '1.0.0',
      },
      model: 'gpt-4o-mini',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      latencyMs: 10,
      repairAttempted: false,
    });

    questionEvaluationRepository.upsertByInterviewMessage.mockResolvedValue({
      id: 11,
      companyId: 7,
      interviewAttemptId: 5,
      interviewMessageId: 99,
      interviewQuestionId: 10,
      score: 10,
      maxScore: 10,
      shortSummary: '1/1 checkpoints met. Score 10/10.',
      review: '- Defines React: met (Correct.)',
      rawResponse: {},
      needsManualReview: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    checkpointResultRepository.replaceByQuestionEvaluationId.mockResolvedValue([
      {
        id: 1,
        questionEvaluationId: 11,
        checkpointKey: 'react_definition',
        matched: true,
        scoreAwarded: 10,
        evidenceQuote: 'React is a UI library.',
        createdAt: new Date(),
      },
    ]);

    const result = await service.evaluateAndPersistQuestionAnswer(5, 10);

    expect(aiUsageLogService.logCompletion).toHaveBeenCalledTimes(1);
    expect(
      questionEvaluationRepository.upsertByInterviewMessage,
    ).toHaveBeenCalledTimes(1);
    expect(
      checkpointResultRepository.replaceByQuestionEvaluationId,
    ).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.questionEvaluationId).toBe(11);
      expect(result.checkpointResults).toHaveLength(1);
    }
  });

  it('does not persist invalid OpenAI payload', async () => {
    evaluationContextService.buildCheckpointEvaluationContext.mockResolvedValue(
      {
        interviewQuestionId: 10,
        interviewId: 1,
        attemptId: 5,
        companyId: 7,
        questionText: 'What is React?',
        idealAnswer: 'UI library',
        maxScore: 10,
        sourceQuestionId: 42,
        checkpoints: [],
        candidateAnswer: 'React is a UI library.',
        candidateMessageId: 99,
        transcriptFragments: [],
      },
    );

    checkpointEvaluationService.evaluateQuestionAnswer.mockResolvedValue({
      status: 'invalid_ai_response',
      rawContent: '{}',
      errors: ['invalid'],
      metadata: {
        promptKey: 'checkpoint_evaluation',
        promptVersion: '1.0.0',
      },
      model: 'gpt-4o-mini',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      latencyMs: 10,
      repairAttempted: true,
    });

    const result = await service.evaluateAndPersistQuestionAnswer(5, 10);

    expect(
      questionEvaluationRepository.upsertByInterviewMessage,
    ).not.toHaveBeenCalled();
    expect(
      checkpointResultRepository.replaceByQuestionEvaluationId,
    ).not.toHaveBeenCalled();
    expect(result.status).toBe('invalid_ai_response');
  });
});
