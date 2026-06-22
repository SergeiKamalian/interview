import type { QuestionWithDetailsEntity } from '../entities/question.entity';
import {
  dedupeStrings,
  mergeEvaluationHints,
  mergeQuestionWithOverride,
} from './merge-question-with-override';

describe('mergeQuestionWithOverride', () => {
  const now = new Date();

  const baseQuestion: QuestionWithDetailsEntity = {
    id: 100,
    companyId: null,
    sourceQuestionId: null,
    status: 'published',
    companyPriority: 0,
    isRequired: false,
    professionId: 1,
    topicId: 10,
    level: 'middle',
    difficulty: 'intermediate',
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
        questionId: 100,
        checkpointKey: 'state_basics',
        title: 'State basics',
        expected: 'Explains local vs global state',
        evaluationHints: {
          mustConcepts: ['redux', 'context'],
          falseClaims: ['mobx is default in react'],
        },
        score: 5,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        questionId: 100,
        checkpointKey: 'tooling',
        title: 'Tooling',
        expected: 'Mentions Redux Toolkit',
        evaluationHints: {
          mustConcepts: ['redux toolkit'],
          falseClaims: [],
        },
        score: 5,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
    ],
    answerExamples: [
      {
        id: 11,
        questionId: 100,
        checkpointKey: null,
        exampleType: 'good',
        exampleText: 'We use Redux Toolkit for global state',
        sortOrder: 0,
        createdAt: now,
      },
    ],
  };

  it('dedupeStrings keeps first occurrence and trims', () => {
    expect(dedupeStrings([' redux ', 'redux', 'context', ''])).toEqual([
      'redux',
      'context',
    ]);
  });

  it('merges mustConcepts and falseClaims into every checkpoint with dedupe', () => {
    const { question } = mergeQuestionWithOverride(baseQuestion, {
      extraMustConcepts: ['redux toolkit', 'redux'],
      extraFalseClaims: ['we use mobx by default'],
      extraAnswerExamples: null,
      topicWeightOverride: null,
    });

    expect(question.checkpoints[0]?.evaluationHints?.mustConcepts).toEqual([
      'redux',
      'context',
      'redux toolkit',
    ]);
    expect(question.checkpoints[0]?.evaluationHints?.falseClaims).toEqual([
      'mobx is default in react',
      'we use mobx by default',
    ]);
    expect(question.checkpoints[1]?.evaluationHints?.mustConcepts).toEqual([
      'redux toolkit',
      'redux',
    ]);
    expect(question.checkpoints[1]?.evaluationHints?.falseClaims).toEqual([
      'we use mobx by default',
    ]);
  });

  it('mergeEvaluationHints preserves other hint fields', () => {
    const merged = mergeEvaluationHints(
      {
        mustConcepts: ['a'],
        minMatchedConcepts: 2,
        positiveFloorScore: 0.8,
      },
      {
        extraMustConcepts: ['b'],
        extraFalseClaims: ['bad claim'],
        extraAnswerExamples: null,
        topicWeightOverride: null,
      },
    );

    expect(merged).toEqual({
      mustConcepts: ['a', 'b'],
      falseClaims: ['bad claim'],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.8,
    });
  });

  it('appends extra answer examples and renumbers sortOrder', () => {
    const { question } = mergeQuestionWithOverride(baseQuestion, {
      extraMustConcepts: null,
      extraFalseClaims: null,
      extraAnswerExamples: [
        {
          exampleType: 'bad',
          exampleText: 'We always use MobX',
          sortOrder: 5,
          checkpointKey: 'state_basics',
        },
      ],
      topicWeightOverride: null,
    });

    expect(question.answerExamples).toHaveLength(2);
    expect(question.answerExamples[0]?.exampleText).toBe(
      'We use Redux Toolkit for global state',
    );
    expect(question.answerExamples[0]?.sortOrder).toBe(0);
    expect(question.answerExamples[1]?.exampleText).toBe('We always use MobX');
    expect(question.answerExamples[1]?.sortOrder).toBe(1);
  });

  it('returns topicWeightOverride when set', () => {
    const result = mergeQuestionWithOverride(baseQuestion, {
      extraMustConcepts: null,
      extraFalseClaims: null,
      extraAnswerExamples: null,
      topicWeightOverride: 8.5,
    });

    expect(result.topicWeightOverride).toBe(8.5);
  });
});
