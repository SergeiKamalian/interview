import {
  buildNaturalTemplateFollowUp,
  evaluateFollowUpPolicy,
} from './follow-up-policy.util';
import type { FollowUpPolicyInput } from '../types/follow-up-planner.types';

const baseCheckpoints = [
  {
    checkpointKey: 'dependency_array',
    title: 'Dependency array',
    expected: 'Explains dependency array',
    score: 2,
    sortOrder: 0,
  },
  {
    checkpointKey: 'cleanup',
    title: 'Cleanup',
    expected: 'Explains cleanup',
    score: 1,
    sortOrder: 1,
  },
];

const baseInput: FollowUpPolicyInput = {
  questionMaxScore: 3,
  checkpoints: baseCheckpoints,
  checkpointStates: [
    {
      checkpointKey: 'dependency_array',
      status: 'missed',
      scoreAwarded: 0,
      maxScore: 2,
      followUpCount: 0,
      needsManualReview: false,
    },
    {
      checkpointKey: 'cleanup',
      status: 'covered',
      scoreAwarded: 1,
      maxScore: 1,
      followUpCount: 0,
      needsManualReview: false,
    },
  ],
  followUpsUsedForQuestion: 0,
  maxFollowUpsPerQuestion: 3,
  maxFollowUpsPerCheckpoint: 1,
  questionScoreSufficientRatio: 0.6,
  lowWeightCheckpointRatio: 0.2,
};

describe('buildNaturalTemplateFollowUp', () => {
  it('rephrases rubric checkpoint title into second-person follow-up', () => {
    const question = buildNaturalTemplateFollowUp({
      questionText: 'Fiber?',
      checkpointTitle: 'Объясняет render phase и WIP tree',
      latestCandidateAnswer: 'answer',
      seed: 3,
    });

    expect(question.toLowerCase()).toContain('как вы объясняете');
    expect(question).not.toContain('объясняет render');
  });

  it('does not quote the candidate answer and avoids default Понял, спасибо', () => {
    const question = buildNaturalTemplateFollowUp({
      questionText: 'Что такое useEffect?',
      checkpointTitle: 'Массив зависимостей',
      latestCandidateAnswer:
        'Юзефект это хук в реакте для выполнения таких функционалов как запрос к апи, изм…',
      seed: 3,
    });

    expect(question).toContain('массив зависимостей');
    expect(question).not.toContain('Понял, спасибо');
    expect(question).not.toContain('Юзефект');
    expect(question).not.toContain('expected=');
    expect(question).not.toContain('Кандидат объясняет');
  });

  it('picks a different opener when previous follow-ups used one', () => {
    const first = buildNaturalTemplateFollowUp({
      questionText: 'Fiber?',
      checkpointTitle: 'Stack vs Fiber',
      latestCandidateAnswer: 'answer',
      seed: 1,
      previousFollowUpQuestions: [],
    });
    const second = buildNaturalTemplateFollowUp({
      questionText: 'Fiber?',
      checkpointTitle: 'Fiber pointers',
      latestCandidateAnswer: 'answer',
      seed: 2,
      previousFollowUpQuestions: [first],
    });

    expect(first.split(/[.!?]/)[0]).not.toBe(second.split(/[.!?]/)[0]);
  });
});

describe('evaluateFollowUpPolicy', () => {
  it('does not select already covered checkpoints', () => {
    const decision = evaluateFollowUpPolicy(baseInput);

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(decision.targetCheckpointKey).toBe('dependency_array');
      expect(decision.targetCheckpointKey).not.toBe('cleanup');
    }
  });

  it('does not ask follow-up when per-question limit is reached', () => {
    const decision = evaluateFollowUpPolicy({
      ...baseInput,
      followUpsUsedForQuestion: 3,
    });

    expect(decision).toEqual({
      shouldAskFollowUp: false,
      reason: 'question_follow_up_limit_reached',
    });
  });

  it('prioritizes higher-weight unclear checkpoint over lower-weight missed', () => {
    const decision = evaluateFollowUpPolicy({
      ...baseInput,
      checkpointStates: [
        {
          checkpointKey: 'dependency_array',
          status: 'unclear',
          scoreAwarded: 0,
          maxScore: 2,
          followUpCount: 0,
          needsManualReview: false,
        },
        {
          checkpointKey: 'cleanup',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
        },
      ],
    });

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(decision.targetCheckpointKey).toBe('dependency_array');
    }
  });

  it('skips follow-up when manual review is required', () => {
    const decision = evaluateFollowUpPolicy({
      ...baseInput,
      checkpointStates: baseInput.checkpointStates.map((state) => ({
        ...state,
        needsManualReview: true,
      })),
    });

    expect(decision).toEqual({
      shouldAskFollowUp: false,
      reason: 'manual_review_required',
    });
  });

  it('skips follow-up when candidate explicitly declines knowledge', () => {
    const decision = evaluateFollowUpPolicy({
      ...baseInput,
      latestCandidateAnswer: 'Я не очень понимаю что это и для чего',
    });

    expect(decision).toEqual({
      shouldAskFollowUp: false,
      reason: 'candidate_declined_knowledge',
    });
  });

  it('skips follow-up when AI disposition is confused after one follow-up', () => {
    const decision = evaluateFollowUpPolicy({
      ...baseInput,
      latestCandidateAnswer: 'Ну как-то связано с типами, но я путаюсь',
      candidateDispositionFromAi: 'confused',
      followUpsUsedForQuestion: 1,
    });

    expect(decision).toEqual({
      shouldAskFollowUp: false,
      reason: 'candidate_confused_ai',
    });
  });

  it('still asks follow-up when AI disposition is confused on first turn', () => {
    const decision = evaluateFollowUpPolicy({
      ...baseInput,
      latestCandidateAnswer: 'А вот я здесь в моей тарелке',
      candidateDispositionFromAi: 'confused',
      followUpsUsedForQuestion: 0,
    });

    expect(decision.shouldAskFollowUp).toBe(true);
  });
});
