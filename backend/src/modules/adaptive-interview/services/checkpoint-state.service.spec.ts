import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import { CheckpointStateService } from './checkpoint-state.service';

describe('CheckpointStateService', () => {
  let service: CheckpointStateService;
  let interviewRepository: jest.Mocked<
    Pick<InterviewCoreRepository, 'findCheckpointsByInterviewQuestionId'>
  >;
  let checkpointStateRepository: jest.Mocked<
    Pick<CheckpointStateRepository, 'ensureForQuestion'>
  >;

  const snapshotCheckpoints = [
    {
      id: 1,
      interviewQuestionId: 10,
      checkpointKey: 'side_effects',
      title: 'Side effects',
      expected: 'Mentions side effects',
      score: 1,
      sortOrder: 0,
      createdAt: new Date(),
    },
    {
      id: 2,
      interviewQuestionId: 10,
      checkpointKey: 'cleanup',
      title: 'Cleanup',
      expected: 'Mentions cleanup',
      score: 1,
      sortOrder: 1,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    interviewRepository = {
      findCheckpointsByInterviewQuestionId: jest.fn(),
    };

    checkpointStateRepository = {
      ensureForQuestion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckpointStateService,
        {
          provide: InterviewCoreRepository,
          useValue: interviewRepository,
        },
        {
          provide: CheckpointStateRepository,
          useValue: checkpointStateRepository,
        },
      ],
    }).compile();

    service = module.get(CheckpointStateService);
  });

  it('creates unseen states for all snapshot checkpoints on first init', async () => {
    interviewRepository.findCheckpointsByInterviewQuestionId.mockResolvedValue(
      snapshotCheckpoints,
    );
    checkpointStateRepository.ensureForQuestion.mockResolvedValue([
      {
        id: 100,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        checkpointKey: 'side_effects',
        status: 'unseen',
        scoreAwarded: 0,
        maxScore: 1,
        confidence: null,
        evidenceSummary: null,
        evidenceMessageIds: null,
        rationale: null,
        followUpCount: 0,
        needsManualReview: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await service.ensureCheckpointStatesForQuestion({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
    });

    expect(checkpointStateRepository.ensureForQuestion).toHaveBeenCalledWith(
      {
        companyId: 7,
        attemptId: 5,
        interviewQuestionId: 10,
        checkpoints: [
          { checkpointKey: 'side_effects', maxScore: 1 },
          { checkpointKey: 'cleanup', maxScore: 1 },
        ],
      },
      undefined,
    );
  });

  it('is idempotent when called repeatedly for the same question', async () => {
    interviewRepository.findCheckpointsByInterviewQuestionId.mockResolvedValue(
      snapshotCheckpoints,
    );
    checkpointStateRepository.ensureForQuestion.mockResolvedValue([]);

    await service.ensureCheckpointStatesForQuestion({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
    });
    await service.ensureCheckpointStatesForQuestion({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
    });

    expect(checkpointStateRepository.ensureForQuestion).toHaveBeenCalledTimes(2);
    expect(
      checkpointStateRepository.ensureForQuestion.mock.calls[0]?.[0],
    ).toEqual(checkpointStateRepository.ensureForQuestion.mock.calls[1]?.[0]);
  });

  it('throws CHECKPOINTS_NOT_FOUND when snapshot has no checkpoints', async () => {
    interviewRepository.findCheckpointsByInterviewQuestionId.mockResolvedValue(
      [],
    );

    await expect(
      service.ensureCheckpointStatesForQuestion({
        companyId: 7,
        attemptId: 5,
        interviewQuestionId: 10,
      }),
    ).rejects.toMatchObject({
      response: { code: 'CHECKPOINTS_NOT_FOUND' },
    });
    await expect(
      service.ensureCheckpointStatesForQuestion({
        companyId: 7,
        attemptId: 5,
        interviewQuestionId: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
