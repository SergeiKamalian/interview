import { FinalEvaluationService } from './final-evaluation.service';
import type { UpsertFinalEvaluationData } from '../entities/final-evaluation.entity';
import type { InterviewScoreResult } from '../../scoring/scoring.types';

function buildScoreResult(): InterviewScoreResult {
  return {
    finalScore: 7,
    totalScoreNormalized: 70,
    totalScoreOutOfTen: 7,
    totalWeight: 2,
    averageScore: 0.7,
    strengthCategory: 'strong',
    category: 'good',
    hireRecommendation: 'invite',
    topics: [],
    breakdown: [],
    needsManualReview: false,
  } as unknown as InterviewScoreResult;
}

describe('FinalEvaluationService achieved level persistence', () => {
  function setup() {
    const interviewRepository = {
      findAttemptByIdForCompany: jest.fn(),
      listQuestionsForInterview: jest.fn(),
    };
    const questionEvaluationRepository = {
      findByAttemptId: jest.fn(),
    };
    const upsertByAttemptId = jest.fn<
      Promise<unknown>,
      [UpsertFinalEvaluationData]
    >();
    const finalEvaluationRepository = { upsertByAttemptId };
    const questionSummaryRepository = {
      findByAttemptId: jest.fn().mockResolvedValue([]),
    };
    const scoringService = {
      calculateInterviewScore: jest.fn().mockReturnValue(buildScoreResult()),
    };
    const aiProviderService = {
      evaluateJson: jest.fn().mockResolvedValue({
        content: '{}',
        model: 'test-model',
        usage: { promptTokens: 1, completionTokens: 1 },
        latencyMs: 5,
      }),
    };
    const aiResponseValidatorService = {
      validateFinalEvaluationResponse: jest.fn().mockReturnValue({
        status: 'valid',
        data: {
          summary: 'summary',
          detailedSummary: null,
          strengths: [],
          weaknesses: [],
          risks: [],
        },
      }),
      logInvalidResponse: jest.fn(),
    };
    const aiUsageLogService = {
      createCorrelationId: jest.fn().mockReturnValue('corr-1'),
      logCompletion: jest.fn().mockResolvedValue(undefined),
    };

    const service = new FinalEvaluationService(
      interviewRepository as never,
      questionEvaluationRepository as never,
      finalEvaluationRepository as never,
      questionSummaryRepository as never,
      scoringService,
      aiProviderService as never,
      aiResponseValidatorService as never,
      aiUsageLogService as never,
    );

    return {
      service,
      interviewRepository,
      questionEvaluationRepository,
      upsertByAttemptId,
      scoringService,
    };
  }

  it('computes achievedLevel from scoreInputs and persists it in the upsert payload', async () => {
    const {
      service,
      interviewRepository,
      questionEvaluationRepository,
      upsertByAttemptId,
    } = setup();

    interviewRepository.findAttemptByIdForCompany.mockResolvedValue({
      status: 'completed',
      interviewId: 7,
    });
    interviewRepository.listQuestionsForInterview.mockResolvedValue([
      {
        id: 1,
        level: 'junior',
        topicName: 't1',
        difficulty: 'easy',
        topicWeight: 1,
      },
      {
        id: 2,
        level: 'middle',
        topicName: 't2',
        difficulty: 'medium',
        topicWeight: 1,
      },
    ]);
    questionEvaluationRepository.findByAttemptId.mockResolvedValue([
      {
        interviewQuestionId: 1,
        score: 9,
        maxScore: 10,
        needsManualReview: false,
        shortSummary: 's1',
      },
      {
        interviewQuestionId: 2,
        score: 8,
        maxScore: 10,
        needsManualReview: false,
        shortSummary: 's2',
      },
    ]);

    upsertByAttemptId.mockResolvedValue({ id: 1 });

    await service.evaluateAndPersistFinalEvaluation(1, 102);

    expect(upsertByAttemptId).toHaveBeenCalledTimes(1);
    const payload = upsertByAttemptId.mock.calls[0][0];

    // junior (0.9) and middle (0.8) both pass the default 0.65 ratio → highest
    // contiguous passed level is middle, directly tested → evidence.
    expect(payload.achievedLevel).toBe('middle');
    expect(payload.achievedLevelMethod).toBe('evidence');

    // The full computeAchievedLevel result (perLevel breakdown) is persisted in
    // raw_response so the report layer can expose levelBreakdown without recompute.
    const achievedLevelResult = (
      payload.rawResponse as {
        achievedLevelResult?: {
          perLevel?: Array<{ level: string; passed: boolean }>;
        };
      }
    ).achievedLevelResult;
    expect(achievedLevelResult?.perLevel).toEqual([
      expect.objectContaining({ level: 'junior', passed: true }),
      expect.objectContaining({ level: 'middle', passed: true }),
    ]);
  });

  it('persists null achievedLevel with estimate method when no level passes', async () => {
    const {
      service,
      interviewRepository,
      questionEvaluationRepository,
      upsertByAttemptId,
    } = setup();

    interviewRepository.findAttemptByIdForCompany.mockResolvedValue({
      status: 'completed',
      interviewId: 7,
    });
    interviewRepository.listQuestionsForInterview.mockResolvedValue([
      {
        id: 1,
        level: 'senior',
        topicName: 't1',
        difficulty: 'hard',
        topicWeight: 1,
      },
    ]);
    questionEvaluationRepository.findByAttemptId.mockResolvedValue([
      {
        interviewQuestionId: 1,
        score: 2,
        maxScore: 10,
        needsManualReview: false,
        shortSummary: 's1',
      },
    ]);

    upsertByAttemptId.mockResolvedValue({ id: 2 });

    await service.evaluateAndPersistFinalEvaluation(1, 103);

    const payload = upsertByAttemptId.mock.calls[0][0];

    expect(payload.achievedLevel).toBeNull();
    expect(payload.achievedLevelMethod).toBe('estimate');
  });

  it('scores unanswered interview questions as zero instead of blocking final evaluation', async () => {
    const {
      service,
      interviewRepository,
      questionEvaluationRepository,
      upsertByAttemptId,
      scoringService,
    } = setup();

    interviewRepository.findAttemptByIdForCompany.mockResolvedValue({
      status: 'completed',
      interviewId: 7,
    });
    interviewRepository.listQuestionsForInterview.mockResolvedValue([
      {
        id: 1,
        level: 'junior',
        topicName: 't1',
        difficulty: 'easy',
        maxScore: 10,
        topicWeight: 1,
      },
      {
        id: 2,
        level: 'middle',
        topicName: 't2',
        difficulty: 'medium',
        maxScore: 10,
        topicWeight: 1,
      },
    ]);
    questionEvaluationRepository.findByAttemptId.mockResolvedValue([
      {
        interviewQuestionId: 1,
        score: 6,
        maxScore: 10,
        needsManualReview: false,
        shortSummary: 'Answered first question',
      },
    ]);

    upsertByAttemptId.mockResolvedValue({ id: 3 });

    await service.evaluateAndPersistFinalEvaluation(1, 104);

    expect(scoringService.calculateInterviewScore).toHaveBeenCalledWith([
      expect.objectContaining({
        interviewQuestionId: 1,
        score: 6,
        maxScore: 10,
      }),
      expect.objectContaining({
        interviewQuestionId: 2,
        score: 0,
        maxScore: 10,
      }),
    ]);
    expect(upsertByAttemptId).toHaveBeenCalledTimes(1);
  });
});
