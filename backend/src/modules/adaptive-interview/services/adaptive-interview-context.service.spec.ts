import { Test, TestingModule } from '@nestjs/testing';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';

describe('AdaptiveInterviewContextService', () => {
  let service: AdaptiveInterviewContextService;
  let interviewRepository: jest.Mocked<
    Pick<
      InterviewCoreRepository,
      | 'findInterviewQuestionById'
      | 'listMessages'
      | 'findCheckpointsByInterviewQuestionId'
      | 'findAnswerExamplesByInterviewQuestionId'
      | 'findBadAnswerExamplesBySourceQuestionId'
    >
  >;
  let checkpointStateRepository: jest.Mocked<
    Pick<CheckpointStateRepository, 'findByAttemptAndQuestion'>
  >;

  beforeEach(async () => {
    interviewRepository = {
      findInterviewQuestionById: jest.fn(),
      listMessages: jest.fn(),
      findCheckpointsByInterviewQuestionId: jest.fn(),
      findAnswerExamplesByInterviewQuestionId: jest.fn().mockResolvedValue([]),
      findBadAnswerExamplesBySourceQuestionId: jest.fn().mockResolvedValue([]),
    };

    checkpointStateRepository = {
      findByAttemptAndQuestion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdaptiveInterviewContextService,
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

    service = module.get(AdaptiveInterviewContextService);
  });

  it('builds a compact packet scoped to the current question', async () => {
    interviewRepository.findInterviewQuestionById.mockResolvedValue({
      id: 10,
      interviewId: 1,
      sourceQuestionId: 42,
      sortOrder: 0,
      questionText: 'What is useEffect?',
      shortAnswer: 'Hook for side effects.',
      idealAnswer: 'Long ideal answer',
      maxScore: 5,
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
        content: 'What is useEffect?',
        sequenceOrder: 1,
        createdAt: new Date(),
      },
      {
        id: 2,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'candidate',
        content: 'It runs side effects.',
        sequenceOrder: 2,
        createdAt: new Date(),
      },
      {
        id: 3,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 20,
        role: 'candidate',
        content: 'Other question answer',
        sequenceOrder: 3,
        createdAt: new Date(),
      },
    ]);

    interviewRepository.findCheckpointsByInterviewQuestionId.mockResolvedValue([
      {
        id: 100,
        interviewQuestionId: 10,
        checkpointKey: 'side_effects',
        title: 'Side effects',
        expected: 'Mentions side effects',
        evaluationHints: null,
        score: 1,
        sortOrder: 0,
        createdAt: new Date(),
      },
    ]);

    checkpointStateRepository.findByAttemptAndQuestion.mockResolvedValue([
      {
        id: 200,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        checkpointKey: 'side_effects',
        status: 'partial',
        scoreAwarded: 0.5,
        maxScore: 1,
        confidence: 0.7,
        evidenceSummary: 'Brief mention',
        evidenceMessageIds: [2],
        rationale: null,
        followUpCount: 0,
        needsManualReview: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const packet = await service.buildContextPacket(5, 10);

    expect(packet.attemptId).toBe(5);
    expect(packet.interviewQuestionId).toBe(10);
    expect(packet.latestCandidateAnswer).toBe('It runs side effects.');
    expect(packet.localTurns).toHaveLength(2);
    expect(packet.localTurns.some((turn) => turn.content.includes('Other'))).toBe(
      false,
    );
    expect(packet.checkpointStates).toHaveLength(1);
    expect(packet.checkpoints).toHaveLength(1);
  });
});
