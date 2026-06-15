import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { QuestionBankRepository } from '../../question-bank/question-bank.repository';
import {
  CHECKPOINT_EVALUATION_PROMPT_KEY,
  CHECKPOINT_EVALUATION_PROMPT_VERSION,
} from '../prompts/checkpoint-evaluation.prompt';
import { AiResponseValidatorService } from './ai-response-validator.service';
import { CheckpointEvaluationService } from './checkpoint-evaluation.service';
import { EvaluationContextService } from './evaluation-context.service';

describe('CheckpointEvaluationService', () => {
  let service: CheckpointEvaluationService;
  let interviewRepository: jest.Mocked<
    Pick<InterviewCoreRepository, 'findInterviewQuestionById' | 'listMessages'>
  >;
  let questionBankRepository: jest.Mocked<
    Pick<QuestionBankRepository, 'findCheckpointsByQuestionId'>
  >;
  let aiProviderService: jest.Mocked<Pick<AiProviderService, 'evaluateJson'>>;

  beforeEach(async () => {
    interviewRepository = {
      findInterviewQuestionById: jest.fn(),
      listMessages: jest.fn(),
    };

    questionBankRepository = {
      findCheckpointsByQuestionId: jest.fn(),
    };

    aiProviderService = {
      evaluateJson: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationContextService,
        AiResponseValidatorService,
        CheckpointEvaluationService,
        {
          provide: InterviewCoreRepository,
          useValue: interviewRepository,
        },
        {
          provide: QuestionBankRepository,
          useValue: questionBankRepository,
        },
        {
          provide: AiProviderService,
          useValue: aiProviderService,
        },
      ],
    }).compile();

    service = module.get(CheckpointEvaluationService);
  });

  it('builds a versioned prompt request from question bank checkpoints', async () => {
    interviewRepository.findInterviewQuestionById.mockResolvedValue({
      id: 10,
      interviewId: 1,
      sourceQuestionId: 42,
      sortOrder: 0,
      questionText: 'What is React?',
      shortAnswer: 'UI library',
      idealAnswer: 'A JavaScript library for building user interfaces.',
      maxScore: 10,
      level: 'middle',
      difficulty: 'intermediate',
      topicName: 'React',
      createdAt: new Date(),
    });

    interviewRepository.listMessages.mockResolvedValue([
      {
        id: 1,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'ai',
        content: 'What is React?',
        sequenceOrder: 1,
        createdAt: new Date(),
      },
      {
        id: 2,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'candidate',
        content: 'React is a UI library for components.',
        sequenceOrder: 2,
        createdAt: new Date(),
      },
    ]);

    questionBankRepository.findCheckpointsByQuestionId.mockResolvedValue([
      {
        id: 100,
        questionId: 42,
        checkpointKey: 'react_definition',
        title: 'Defines React correctly',
        expected: 'Mentions component-based UI library',
        score: 5,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const request = await service.buildEvaluationRequest(5, 10);

    expect(request.metadata).toEqual({
      promptKey: CHECKPOINT_EVALUATION_PROMPT_KEY,
      promptVersion: CHECKPOINT_EVALUATION_PROMPT_VERSION,
    });
    expect(request.userPrompt).toContain('key=react_definition');
    expect(request.userPrompt).toContain(
      'React is a UI library for components.',
    );
    expect(request.systemPrompt).toContain('Do NOT invent new criteria');
  });

  it('stops evaluation when checkpoints are missing in question bank', async () => {
    interviewRepository.findInterviewQuestionById.mockResolvedValue({
      id: 10,
      interviewId: 1,
      sourceQuestionId: 42,
      sortOrder: 0,
      questionText: 'What is React?',
      shortAnswer: 'UI library',
      idealAnswer: 'A JavaScript library for building user interfaces.',
      maxScore: 10,
      level: 'middle',
      difficulty: 'intermediate',
      topicName: 'React',
      createdAt: new Date(),
    });

    interviewRepository.listMessages.mockResolvedValue([
      {
        id: 2,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'candidate',
        content: 'React is a UI library.',
        sequenceOrder: 2,
        createdAt: new Date(),
      },
    ]);

    questionBankRepository.findCheckpointsByQuestionId.mockResolvedValue([]);

    await expect(service.buildEvaluationRequest(5, 10)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('retries once with repair prompt when OpenAI returns invalid JSON', async () => {
    interviewRepository.findInterviewQuestionById.mockResolvedValue({
      id: 10,
      interviewId: 1,
      sourceQuestionId: 42,
      sortOrder: 0,
      questionText: 'What is React?',
      shortAnswer: 'UI library',
      idealAnswer: 'A JavaScript library for building user interfaces.',
      maxScore: 10,
      level: 'middle',
      difficulty: 'intermediate',
      topicName: 'React',
      createdAt: new Date(),
    });

    interviewRepository.listMessages.mockResolvedValue([
      {
        id: 2,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'candidate',
        content: 'React is a UI library.',
        sequenceOrder: 2,
        createdAt: new Date(),
      },
    ]);

    questionBankRepository.findCheckpointsByQuestionId.mockResolvedValue([
      {
        id: 100,
        questionId: 42,
        checkpointKey: 'react_definition',
        title: 'Defines React correctly',
        expected: 'Mentions component-based UI library',
        score: 5,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    aiProviderService.evaluateJson
      .mockResolvedValueOnce({
        content: '{"checkpoints":[]}',
        model: 'gpt-4o-mini',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        latencyMs: 10,
      })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          checkpoints: [
            {
              checkpoint_key: 'react_definition',
              status: 'met',
              confidence: 0.8,
              evidence_quote: 'React is a UI library.',
              reasoning_short: 'Correct definition.',
            },
          ],
        }),
        model: 'gpt-4o-mini',
        usage: { promptTokens: 2, completionTokens: 2, totalTokens: 4 },
        latencyMs: 12,
      });

    const result = await service.evaluateQuestionAnswer(5, 10);

    expect(aiProviderService.evaluateJson).toHaveBeenCalledTimes(2);
    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.repairAttempted).toBe(true);
      expect(result.response.checkpoints[0]?.checkpointKey).toBe(
        'react_definition',
      );
    }
  });
});
