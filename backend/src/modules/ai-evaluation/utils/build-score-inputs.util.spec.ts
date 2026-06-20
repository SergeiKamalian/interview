import type { InterviewQuestionSummaryEntity } from '../../adaptive-interview/entities/interview-question-summary.entity';
import type { InterviewQuestionEntity } from '../../interview-core/entities/interview-question.entity';
import type { QuestionEvaluationEntity } from '../entities/question-evaluation.entity';
import { buildScoreInputs } from './build-score-inputs.util';

function makeQuestion(
  partial: Partial<InterviewQuestionEntity> & { id: number },
): InterviewQuestionEntity {
  return {
    interviewId: 1,
    sourceQuestionId: null,
    sortOrder: 0,
    questionText: 'q',
    shortAnswer: '',
    idealAnswer: '',
    maxScore: 10,
    level: 'middle',
    difficulty: 'intermediate',
    topicName: 'JS',
    topicWeight: 1,
    createdAt: new Date(),
    ...partial,
  };
}

function makeSummary(
  partial: Partial<InterviewQuestionSummaryEntity> & {
    interviewQuestionId: number;
  },
): InterviewQuestionSummaryEntity {
  return {
    id: 1,
    companyId: 1,
    interviewAttemptId: 1,
    score: 8,
    maxScore: 10,
    summary: '',
    strengths: null,
    weaknesses: null,
    unclearCheckpoints: null,
    followUpCount: 0,
    needsManualReview: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}

function makeEvaluation(
  partial: Partial<QuestionEvaluationEntity> & { interviewQuestionId: number },
): QuestionEvaluationEntity {
  return {
    id: 1,
    companyId: 1,
    interviewAttemptId: 1,
    interviewMessageId: 1,
    score: 5,
    maxScore: 10,
    shortSummary: null,
    review: null,
    rawResponse: null,
    needsManualReview: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}

describe('buildScoreInputs', () => {
  it('maps adaptive summaries with question level/meta when useAdaptiveSummaries', () => {
    const questionMetaById = new Map([
      [38, makeQuestion({ id: 38, level: 'senior', topicWeight: 2 })],
    ]);

    const inputs = buildScoreInputs({
      useAdaptiveSummaries: true,
      adaptiveSummaries: [
        makeSummary({ interviewQuestionId: 38, score: 9.7, maxScore: 10 }),
      ],
      questionEvaluations: [
        makeEvaluation({ interviewQuestionId: 38, score: 1, maxScore: 10 }),
      ],
      questionMetaById,
    });

    expect(inputs).toEqual([
      {
        interviewQuestionId: 38,
        topicName: 'JS',
        difficulty: 'intermediate',
        level: 'senior',
        score: 9.7,
        maxScore: 10,
        topicWeight: 2,
        needsManualReview: false,
      },
    ]);
  });

  it('falls back to question evaluations when not using adaptive summaries', () => {
    const questionMetaById = new Map([
      [38, makeQuestion({ id: 38, level: 'middle' })],
    ]);

    const inputs = buildScoreInputs({
      useAdaptiveSummaries: false,
      adaptiveSummaries: [],
      questionEvaluations: [
        makeEvaluation({ interviewQuestionId: 38, score: 6.27, maxScore: 9 }),
      ],
      questionMetaById,
    });

    expect(inputs).toEqual([
      {
        interviewQuestionId: 38,
        topicName: 'JS',
        difficulty: 'intermediate',
        level: 'middle',
        score: 6.27,
        maxScore: 9,
        topicWeight: 1,
        needsManualReview: false,
      },
    ]);
  });

  it('defaults level/difficulty when question meta is missing', () => {
    const inputs = buildScoreInputs({
      useAdaptiveSummaries: true,
      adaptiveSummaries: [makeSummary({ interviewQuestionId: 999 })],
      questionEvaluations: [],
      questionMetaById: new Map(),
    });

    expect(inputs[0]).toMatchObject({
      level: 'middle',
      difficulty: 'intermediate',
      topicName: null,
      topicWeight: undefined,
    });
  });
});
