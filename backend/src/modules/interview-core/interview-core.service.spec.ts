import { InterviewCoreRepository } from './interview-core.repository';
import { InterviewCoreService } from './interview-core.service';
import { PublicTokenService } from './public-token.service';
import { CompanyQuestionOverrideRepository } from '../question-bank/company-question-override.repository';
import { QuestionBankRepository } from '../question-bank/question-bank.repository';

describe('InterviewCoreService — override snapshot merge', () => {
  const now = new Date();

  const globalQuestion = {
    id: 656,
    companyId: null,
    sourceQuestionId: null,
    status: 'published' as const,
    companyPriority: 0,
    isRequired: false,
    professionId: 1,
    topicId: 10,
    level: 'middle' as const,
    difficulty: 'intermediate' as const,
    questionText: 'Explain state management',
    shortAnswer: 'Redux, Context',
    idealAnswer: 'State management patterns...',
    maxScore: 10,
    isActive: true,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    skillIds: [3],
    checkpoints: [
      {
        id: 1,
        questionId: 656,
        checkpointKey: 'state_basics',
        title: 'State basics',
        expected: 'Explains local vs global state',
        evaluationHints: {
          mustConcepts: ['redux'],
          falseClaims: ['mobx is default in react'],
        },
        score: 10,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    answerExamples: [],
  };

  let service: InterviewCoreService;
  let repository: jest.Mocked<
    Pick<InterviewCoreRepository, 'createInterview'>
  >;
  let questionBankRepository: jest.Mocked<
    Pick<QuestionBankRepository, 'findVisibleById' | 'findTopicById'>
  >;
  let overrideRepository: jest.Mocked<
    Pick<CompanyQuestionOverrideRepository, 'findBySourceQuestionIds'>
  >;
  let database: { withTransaction: jest.Mock };
  let publicTokenService: { generate: jest.Mock };

  beforeEach(() => {
    repository = {
      createInterview: jest.fn(),
    };
    questionBankRepository = {
      findVisibleById: jest.fn(),
      findTopicById: jest.fn(),
    };
    overrideRepository = {
      findBySourceQuestionIds: jest.fn(),
    };
    database = {
      withTransaction: jest.fn(async (fn) =>
        fn(jest.fn().mockResolvedValue(undefined)),
      ),
    };
    publicTokenService = {
      generate: jest.fn().mockReturnValue('public-token'),
    };

    repository.createInterview.mockResolvedValue({
      id: 99,
      companyId: 7,
      createdByUserId: 1,
      title: 'Test',
      jobRole: 'Frontend',
      professionId: 1,
      level: 'middle',
      interviewLanguage: 'ru',
      questionCount: 1,
      jobDescription: null,
      publicToken: 'public-token',
      status: 'draft',
      isVideoEnabled: false,
      interviewerName: null,
      welcomeMessageTemplate: null,
      aiTone: 'neutral',
      probingDepth: 'balanced',
      scoringStrictness: 'balanced',
      expiresAt: null,
      maxCompletions: null,
      allowRetake: false,
      timeLimitMinutes: null,
      passingScore: null,
      requirePhone: false,
      requireLinkedin: false,
      requireGithub: false,
      createdAt: now,
      updatedAt: now,
    });

    questionBankRepository.findVisibleById.mockResolvedValue(globalQuestion);
    questionBankRepository.findTopicById.mockResolvedValue({
      id: 10,
      companyId: null,
      skillId: 3,
      code: 'react_state',
      name: 'React State',
      interviewWeight: 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      skill: null,
    });
    overrideRepository.findBySourceQuestionIds.mockResolvedValue(
      new Map([
        [
          656,
          {
            id: 1,
            companyId: 7,
            sourceQuestionId: 656,
            extraMustConcepts: ['redux toolkit'],
            extraFalseClaims: ['we use mobx by default'],
            extraAnswerExamples: null,
            topicWeightOverride: 9,
            createdAt: now,
            updatedAt: now,
          },
        ],
      ]),
    );

    service = new InterviewCoreService(
      repository as unknown as InterviewCoreRepository,
      questionBankRepository as unknown as QuestionBankRepository,
      overrideRepository as unknown as CompanyQuestionOverrideRepository,
      database as never,
      publicTokenService as unknown as PublicTokenService,
    );
  });

  it('merges override hints and topic weight before snapshot insert', async () => {
    await service.createInterview(7, 1, {
      title: 'Override merge test',
      jobRole: 'Frontend',
      level: 'middle',
      questionIds: ['656'],
    });

    expect(overrideRepository.findBySourceQuestionIds).toHaveBeenCalledWith(
      7,
      [656],
    );

    const createPayload = repository.createInterview.mock.calls[0]?.[0];
    expect(createPayload?.questions).toHaveLength(1);
    expect(
      createPayload?.questions[0]?.checkpoints[0]?.evaluationHints?.mustConcepts,
    ).toEqual(['redux', 'redux toolkit']);
    expect(
      createPayload?.questions[0]?.checkpoints[0]?.evaluationHints?.falseClaims,
    ).toEqual(['mobx is default in react', 'we use mobx by default']);
    expect(createPayload?.questionTopicWeights?.get(656)).toBe(9);
  });

  it('does not load overrides for company-owned questions', async () => {
    const companyQuestion = {
      ...globalQuestion,
      id: 700,
      companyId: 7,
    };
    questionBankRepository.findVisibleById.mockResolvedValue(companyQuestion);
    overrideRepository.findBySourceQuestionIds.mockResolvedValue(new Map());

    await service.createInterview(7, 1, {
      title: 'Company question test',
      jobRole: 'Frontend',
      level: 'middle',
      questionIds: ['700'],
    });

    expect(overrideRepository.findBySourceQuestionIds).toHaveBeenCalledWith(
      7,
      [],
    );
    const createPayload = repository.createInterview.mock.calls[0]?.[0];
    expect(
      createPayload?.questions[0]?.checkpoints[0]?.evaluationHints?.mustConcepts,
    ).toEqual(['redux']);
  });
});
