import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../common/database/database.service';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { InterviewMessageKindEnum } from '../../interview-core/types/interview.type';
import { FollowUpRepository } from '../repositories/follow-up.repository';
import {
  AdaptiveInterviewSubmitService,
  resolveSessionProgress,
} from './adaptive-interview-submit.service';
import { CheckpointStateService } from './checkpoint-state.service';
import { FollowUpPlannerService } from './follow-up-planner.service';
import { PerTurnCheckpointEvaluatorService } from './per-turn-checkpoint-evaluator.service';
import { QuestionSummaryService } from './question-summary.service';
import { AdaptiveInterviewContextService } from './adaptive-interview-context.service';
import { AdaptiveAiConversationService } from './adaptive-ai-conversation.service';
import { AdaptiveOpenAiResponseStateService } from './adaptive-openai-response-state.service';
import { InterviewRealtimeService } from '../../interview-realtime/interview-realtime.service';
import { InterviewAiMessageStreamService } from '../../interview-realtime/interview-ai-message-stream.service';
import { MediaAssetService } from '../../media/media-asset.service';
import { MainQuestionOpenerService } from './main-question-opener.service';
import { CandidateTurnClassifierService } from './candidate-turn-classifier.service';

describe('AdaptiveInterviewSubmitService', () => {
  let service: AdaptiveInterviewSubmitService;
  let repository: jest.Mocked<
    Pick<
      InterviewCoreRepository,
      | 'countMainAnswerMessages'
      | 'findAwaitingTopicOpener'
      | 'getNextSequenceOrder'
      | 'appendMessage'
      | 'completeAttempt'
    >
  >;
  let followUpRepository: jest.Mocked<
    Pick<
      FollowUpRepository,
      | 'findAwaitingAnswer'
      | 'markAnswered'
      | 'markAsked'
      | 'countUsedForQuestion'
    >
  >;
  let perTurnEvaluator: jest.Mocked<
    Pick<PerTurnCheckpointEvaluatorService, 'evaluateTurnAndPersist'>
  >;
  let followUpPlanner: jest.Mocked<
    Pick<FollowUpPlannerService, 'planFollowUp'>
  >;
  let adaptiveInterviewContextService: jest.Mocked<
    Pick<AdaptiveInterviewContextService, 'buildContextPacket'>
  >;
  let checkpointStateService: jest.Mocked<
    Pick<
      CheckpointStateService,
      'ensureCheckpointStatesForQuestion' | 'applyCandidateDeclinedKnowledge'
    >
  >;

  const attempt = {
    id: 5,
    companyId: 7,
    interviewId: 1,
    candidateId: 2,
    status: 'in_progress' as const,
    isShortlisted: false,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const questions = [
    {
      id: 10,
      interviewId: 1,
      sourceQuestionId: 1,
      sortOrder: 0,
      questionText: 'What is useEffect?',
      shortAnswer: 'Hook',
      idealAnswer: 'Side effect hook',
      maxScore: 2,
      level: 'middle' as const,
      difficulty: 2,
      topicName: 'React',
      createdAt: new Date(),
    },
    {
      id: 11,
      interviewId: 1,
      sourceQuestionId: 2,
      sortOrder: 1,
      questionText: 'What is useMemo?',
      shortAnswer: 'Memo hook',
      idealAnswer: 'Memoization hook',
      maxScore: 2,
      level: 'middle' as const,
      difficulty: 2,
      topicName: 'React',
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    repository = {
      countMainAnswerMessages: jest.fn().mockResolvedValue(0),
      findAwaitingTopicOpener: jest.fn().mockResolvedValue(null),
      getNextSequenceOrder: jest
        .fn()
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3),
      appendMessage: jest
        .fn()
        .mockResolvedValueOnce({
          id: 22,
          companyId: 7,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          role: 'candidate',
          messageKind: 'main_answer',
          parentMessageId: null,
          targetCheckpointKey: null,
          content: 'Runs after render',
          sequenceOrder: 2,
          createdAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 23,
          companyId: 7,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          role: 'ai',
          messageKind: 'follow_up_question',
          parentMessageId: null,
          targetCheckpointKey: 'dependency_array',
          content: 'Can you explain the dependency array?',
          sequenceOrder: 3,
          createdAt: new Date(),
        }),
      completeAttempt: jest.fn(),
    };

    followUpRepository = {
      findAwaitingAnswer: jest.fn().mockResolvedValue(null),
      markAnswered: jest.fn(),
      markAsked: jest.fn(),
      countUsedForQuestion: jest.fn().mockResolvedValue(1),
    };

    perTurnEvaluator = {
      evaluateTurnAndPersist: jest.fn().mockResolvedValue({
        status: 'valid',
        repairAttempted: false,
        candidateDisposition: 'engaged',
        suggestedFollowUp: null,
        states: [],
      }),
    };

    followUpPlanner = {
      planFollowUp: jest.fn().mockResolvedValue({
        status: 'planned',
        followUpId: 99,
        checkpointKey: 'dependency_array',
        followUpQuestion: 'Can you explain the dependency array?',
        reason: 'checkpoint_missed',
        usedTemplate: false,
        repairAttempted: false,
      }),
    };

    checkpointStateService = {
      ensureCheckpointStatesForQuestion: jest.fn(),
      applyCandidateDeclinedKnowledge: jest.fn().mockResolvedValue(5),
    };

    adaptiveInterviewContextService = {
      buildContextPacket: jest.fn().mockResolvedValue({
        interviewQuestionId: 10,
        interviewId: 1,
        attemptId: 5,
        companyId: 7,
        questionText: 'What is useEffect?',
        referenceAnswer: 'Hook',
        maxScore: 2,
        checkpoints: [],
        latestCandidateAnswer: 'Runs after render',
        latestCandidateMessageId: 22,
        checkpointStates: [],
        evidenceSnippets: [],
        localTurns: [],
        followUpLimits: {
          maxPerQuestion: 3,
          maxPerCheckpoint: 1,
          usedForQuestion: 0,
        },
      }),
    };

    const candidateTurnClassifier = {
      classifyTurn: jest.fn().mockImplementation((input: { candidateAnswer: string }) => {
        const answer = input.candidateAnswer.trim();
        if (/ничего не знаю|не знаю/i.test(answer) && !/на это/i.test(answer)) {
          return Promise.resolve({
            status: 'valid' as const,
            classification: {
              turnKind: 'decline_whole' as const,
              disposition: 'declined' as const,
              confidence: 'high' as const,
              reason: 'test decline',
              openerReadiness: null,
            },
            rawContent: '{}',
          });
        }

        return Promise.resolve({
          status: 'valid' as const,
          classification: {
            turnKind: 'substantive_answer' as const,
            disposition: 'engaged' as const,
            confidence: 'high' as const,
            reason: 'test answer',
            openerReadiness: null,
          },
          rawContent: '{}',
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdaptiveInterviewSubmitService,
        {
          provide: InterviewCoreRepository,
          useValue: repository,
        },
        {
          provide: DatabaseService,
          useValue: {
            withTransaction: jest.fn((callback) => callback(jest.fn())),
          },
        },
        {
          provide: CheckpointStateService,
          useValue: checkpointStateService,
        },
        {
          provide: PerTurnCheckpointEvaluatorService,
          useValue: perTurnEvaluator,
        },
        {
          provide: FollowUpPlannerService,
          useValue: followUpPlanner,
        },
        {
          provide: FollowUpRepository,
          useValue: followUpRepository,
        },
        {
          provide: QuestionSummaryService,
          useValue: {
            buildAndPersist: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
        {
          provide: InterviewRealtimeService,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: InterviewAiMessageStreamService,
          useValue: {
            isEnabled: jest.fn().mockReturnValue(false),
            streamStaticText: jest.fn(async ({ text }) => text),
            streamLlmText: jest.fn(),
          },
        },
        {
          provide: AdaptiveInterviewContextService,
          useValue: adaptiveInterviewContextService,
        },
        {
          provide: AdaptiveAiConversationService,
          useValue: {
            clearQuestionSessions: jest.fn(),
          },
        },
        {
          provide: AdaptiveOpenAiResponseStateService,
          useValue: {
            clearEvaluateState: jest.fn(),
          },
        },
        {
          provide: MediaAssetService,
          useValue: {
            linkPendingAssetToMessage: jest.fn(),
          },
        },
        {
          provide: MainQuestionOpenerService,
          useValue: {
            generateTopicOpener: jest
              .fn()
              .mockResolvedValue('Давайте поговорим про useMemo. Вам знакома тема?'),
            generateQuestionInvite: jest
              .fn()
              .mockResolvedValue(
                'Ок, давайте попробуем. С чего бы вы начали объяснение?',
              ),
          },
        },
        {
          provide: CandidateTurnClassifierService,
          useValue: candidateTurnClassifier,
        },
      ],
    }).compile();

    service = module.get(AdaptiveInterviewSubmitService);
  });

  it('returns follow-up after main answer when planner plans one', async () => {
    const result = await service.submitAnswer({
      attempt,
      questions,
      trimmedAnswer: 'Runs after render',
    });

    expect(result.status).toBe('in_progress');
    expect(result.isFollowUp).toBe(true);
    expect(result.messageKind).toBe(
      InterviewMessageKindEnum.follow_up_question,
    );
    expect(result.pendingMessageText).toContain('dependency array');
    expect(result.answeredMainQuestions).toBe(1);
    expect(followUpRepository.markAsked).toHaveBeenCalledWith(
      99,
      23,
      expect.any(Function),
    );
    expect(perTurnEvaluator.evaluateTurnAndPersist).toHaveBeenCalled();
  });

  it('skips AI evaluation and follow-ups when candidate declines knowledge', async () => {
    adaptiveInterviewContextService.buildContextPacket.mockResolvedValueOnce({
      interviewQuestionId: 10,
      interviewId: 1,
      attemptId: 5,
      companyId: 7,
      questionText: 'What is useEffect?',
      referenceAnswer: 'Hook',
      maxScore: 2,
      checkpoints: [],
      latestCandidateAnswer: 'Я ничего не знаю по useEffect',
      latestCandidateMessageId: 22,
      checkpointStates: [],
      evidenceSnippets: [],
      localTurns: [],
      followUpLimits: {
        maxPerQuestion: 3,
        maxPerCheckpoint: 1,
        usedForQuestion: 0,
      },
    });

    repository.getNextSequenceOrder = jest
      .fn()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);
    repository.appendMessage = jest
      .fn()
      .mockResolvedValueOnce({
        id: 22,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'candidate',
        messageKind: 'main_answer',
        parentMessageId: null,
        targetCheckpointKey: null,
        content: 'Я ничего не знаю по useEffect',
        sequenceOrder: 2,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 24,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 11,
        role: 'ai',
        messageKind: 'main_question',
        parentMessageId: null,
        targetCheckpointKey: null,
        content: 'What is useMemo?',
        sequenceOrder: 3,
        createdAt: new Date(),
      });

    followUpPlanner.planFollowUp.mockResolvedValue({
      status: 'no_follow_up',
      reason: 'candidate_declined_knowledge',
    });

    const result = await service.submitAnswer({
      attempt,
      questions,
      trimmedAnswer: 'Я ничего не знаю по useEffect',
    });

    expect(
      checkpointStateService.applyCandidateDeclinedKnowledge,
    ).toHaveBeenCalledWith({
      attemptId: 5,
      interviewQuestionId: 10,
    });
    expect(perTurnEvaluator.evaluateTurnAndPersist).not.toHaveBeenCalled();
    expect(followUpPlanner.planFollowUp).not.toHaveBeenCalled();
    expect(result.isFollowUp).toBe(false);
    expect(result.messageKind).toBe(InterviewMessageKindEnum.topic_opener);
    expect(result.pendingMessageText).toContain('useMemo');
  });

  it('moves to next main question when planner returns no follow-up', async () => {
    repository.getNextSequenceOrder = jest
      .fn()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);
    repository.appendMessage = jest
      .fn()
      .mockResolvedValueOnce({
        id: 22,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'candidate',
        messageKind: 'main_answer',
        parentMessageId: null,
        targetCheckpointKey: null,
        content: 'Runs after render',
        sequenceOrder: 2,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 24,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 11,
        role: 'ai',
        messageKind: 'main_question',
        parentMessageId: null,
        targetCheckpointKey: null,
        content: 'What is useMemo?',
        sequenceOrder: 3,
        createdAt: new Date(),
      });

    followUpPlanner.planFollowUp.mockResolvedValue({
      status: 'no_follow_up',
      reason: 'question_follow_up_limit_reached',
    });

    const result = await service.submitAnswer({
      attempt,
      questions,
      trimmedAnswer: 'Runs after render',
    });

    expect(result.isFollowUp).toBe(false);
    expect(result.messageKind).toBe(InterviewMessageKindEnum.topic_opener);
    expect(result.pendingMessageText).toContain('useMemo');
    expect(result.currentInterviewQuestionId).toBe(11);
  });

  it('does not call evaluator on topic_opener_answer (not scored)', async () => {
    repository.findAwaitingTopicOpener.mockResolvedValue({
      interviewQuestionId: 10,
      topicOpenerMessageId: 20,
      topicOpenerText: 'Давайте поговорим про useEffect. Вы сталкивались?',
    });
    repository.getNextSequenceOrder = jest
      .fn()
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4);
    repository.appendMessage = jest
      .fn()
      .mockResolvedValueOnce({
        id: 21,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'candidate',
        messageKind: 'topic_opener_answer',
        parentMessageId: 20,
        targetCheckpointKey: null,
        content: 'Да, немного знаком',
        sequenceOrder: 3,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 22,
        companyId: 7,
        interviewAttemptId: 5,
        interviewQuestionId: 10,
        role: 'ai',
        messageKind: 'main_question',
        parentMessageId: null,
        targetCheckpointKey: null,
        content: 'Ок, давайте попробуем. С чего бы вы начали объяснение?',
        sequenceOrder: 4,
        createdAt: new Date(),
      });

    const initializeSpy = jest
      .spyOn(service, 'initializeQuestionAiState')
      .mockResolvedValue();

    const result = await service.submitAnswer({
      attempt,
      questions,
      trimmedAnswer: 'Да, немного знаком',
    });

    expect(perTurnEvaluator.evaluateTurnAndPersist).not.toHaveBeenCalled();
    expect(initializeSpy).toHaveBeenCalledWith({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
    });
    expect(result.messageKind).toBe(InterviewMessageKindEnum.main_question);
    expect(result.pendingMessageText).toContain('С чего бы вы начали');
  });

  it('rejects submit when all main questions are already answered', async () => {
    repository.countMainAnswerMessages.mockResolvedValue(2);

    await expect(service.assertCanSubmit(5, 2)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('resolveSessionProgress', () => {
  const questions = [
    {
      id: 10,
      interviewId: 1,
      sourceQuestionId: 1,
      sortOrder: 0,
      questionText: 'Main question',
      shortAnswer: '',
      idealAnswer: '',
      maxScore: 2,
      level: 'middle' as const,
      difficulty: 2,
      topicName: 'React',
      createdAt: new Date(),
    },
  ];

  it('uses last AI message as current question in adaptive mode', () => {
    const progress = resolveSessionProgress({
      adaptiveEnabled: true,
      answeredMainQuestions: 1,
      questions,
      messages: [
        {
          id: 1,
          companyId: 1,
          interviewAttemptId: 1,
          interviewQuestionId: 10,
          role: 'ai',
          messageKind: 'follow_up_question',
          parentMessageId: null,
          targetCheckpointKey: 'dependency_array',
          content: 'Follow-up text',
          sequenceOrder: 2,
          createdAt: new Date(),
        },
      ],
    });

    expect(progress.currentQuestionText).toBe('Follow-up text');
    expect(progress.currentQuestionId).toBe(10);
  });
});
