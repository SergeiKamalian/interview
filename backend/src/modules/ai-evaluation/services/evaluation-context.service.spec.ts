import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { EvaluationContextService } from './evaluation-context.service';

describe('EvaluationContextService', () => {
  let service: EvaluationContextService;
  let interviewRepository: jest.Mocked<
    Pick<
      InterviewCoreRepository,
      | 'findInterviewQuestionById'
      | 'listMessages'
      | 'findCheckpointsByInterviewQuestionId'
    >
  >;

  const interviewQuestion = {
    id: 10,
    interviewId: 1,
    sourceQuestionId: 42,
    sortOrder: 0,
    questionText: 'What is React?',
    shortAnswer: 'UI library',
    idealAnswer: 'A JavaScript library for building user interfaces.',
    maxScore: 10,
    level: 'middle' as const,
    difficulty: 'intermediate' as const,
    topicName: 'React',
    createdAt: new Date(),
  };

  const messages = [
    {
      id: 1,
      companyId: 7,
      interviewAttemptId: 5,
      interviewQuestionId: 10,
      role: 'ai' as const,
      content: 'What is React?',
      sequenceOrder: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      companyId: 7,
      interviewAttemptId: 5,
      interviewQuestionId: 10,
      role: 'candidate' as const,
      content: 'React is a UI library for components.',
      sequenceOrder: 2,
      createdAt: new Date(),
    },
  ];

  const snapshotCheckpoints = [
    {
      id: 200,
      interviewQuestionId: 10,
      checkpointKey: 'react_definition',
      title: 'Defines React correctly',
      expected: 'Mentions component-based UI library',
      score: 5,
      sortOrder: 0,
      createdAt: new Date(),
    },
    {
      id: 201,
      interviewQuestionId: 10,
      checkpointKey: 'snapshot_only_key',
      title: 'Snapshot-only criterion',
      expected: 'Only exists in interview snapshot',
      score: 5,
      sortOrder: 1,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    interviewRepository = {
      findInterviewQuestionById: jest.fn(),
      listMessages: jest.fn(),
      findCheckpointsByInterviewQuestionId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationContextService,
        {
          provide: InterviewCoreRepository,
          useValue: interviewRepository,
        },
      ],
    }).compile();

    service = module.get(EvaluationContextService);
  });

  it('loads checkpoints from interview question snapshot, not question bank', async () => {
    interviewRepository.findInterviewQuestionById.mockResolvedValue(
      interviewQuestion,
    );
    interviewRepository.listMessages.mockResolvedValue(messages);
    interviewRepository.findCheckpointsByInterviewQuestionId.mockResolvedValue(
      snapshotCheckpoints,
    );

    const context = await service.buildCheckpointEvaluationContext(5, 10);

    expect(
      interviewRepository.findCheckpointsByInterviewQuestionId,
    ).toHaveBeenCalledWith(10);
    expect(context.checkpoints).toEqual([
      {
        checkpointKey: 'react_definition',
        title: 'Defines React correctly',
        expected: 'Mentions component-based UI library',
        score: 5,
        sortOrder: 0,
      },
      {
        checkpointKey: 'snapshot_only_key',
        title: 'Snapshot-only criterion',
        expected: 'Only exists in interview snapshot',
        score: 5,
        sortOrder: 1,
      },
    ]);
    expect(context.candidateAnswer).toBe('React is a UI library for components.');
  });

  it('keeps snapshot checkpoints even when source question id is present', async () => {
    interviewRepository.findInterviewQuestionById.mockResolvedValue({
      ...interviewQuestion,
      sourceQuestionId: 999,
    });
    interviewRepository.listMessages.mockResolvedValue(messages);
    interviewRepository.findCheckpointsByInterviewQuestionId.mockResolvedValue(
      snapshotCheckpoints,
    );

    const context = await service.buildCheckpointEvaluationContext(5, 10);

    expect(context.checkpoints.some((c) => c.checkpointKey === 'snapshot_only_key')).toBe(
      true,
    );
    expect(
      interviewRepository.findCheckpointsByInterviewQuestionId,
    ).toHaveBeenCalledWith(10);
  });

  it('throws CHECKPOINTS_NOT_FOUND when snapshot has no checkpoints', async () => {
    interviewRepository.findInterviewQuestionById.mockResolvedValue(
      interviewQuestion,
    );
    interviewRepository.listMessages.mockResolvedValue(messages);
    interviewRepository.findCheckpointsByInterviewQuestionId.mockResolvedValue(
      [],
    );

    await expect(
      service.buildCheckpointEvaluationContext(5, 10),
    ).rejects.toMatchObject({
      response: {
        code: 'CHECKPOINTS_NOT_FOUND',
      },
    });
    await expect(
      service.buildCheckpointEvaluationContext(5, 10),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
