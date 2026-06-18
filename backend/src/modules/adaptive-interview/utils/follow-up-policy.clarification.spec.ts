import {
  buildNaturalTemplateFollowUp,
  evaluateFollowUpPolicy,
} from './follow-up-policy.util';
import type { FollowUpPolicyInput } from '../types/follow-up-planner.types';
import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';

function schedulingPolicyInput(
  overrides: Partial<FollowUpPolicyInput> = {},
): FollowUpPolicyInput {
  const scheduling = fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 });
  return {
    questionMaxScore: 8,
    checkpoints: [scheduling],
    checkpointStates: [
      {
        checkpointKey: 'scheduling',
        status: 'partial',
        scoreAwarded: 1.25,
        maxScore: 2.5,
        followUpCount: 1,
        needsManualReview: false,
        rationale: 'depth=partial_knowledge probe=pending',
      },
    ],
    followUpsUsedForQuestion: 1,
    maxFollowUpsPerQuestion: 8,
    maxFollowUpsPerCheckpoint: 3,
    questionScoreSufficientRatio: 0.6,
    lowWeightCheckpointRatio: 0.2,
    latestCandidateAnswer: 'Что именно вам интересно?',
    candidateDispositionFromAi: 'asked_for_scope',
    candidateTurnKind: 'scope_clarification',
    stickyTargetCheckpointKey: 'scheduling',
    localTurns: [
      { role: 'ai', content: 'Можете уточнить технические детали?' },
      { role: 'candidate', content: 'Что именно вам интересно?' },
    ],
    checkpointEvidenceTextByKey: {
      scheduling:
        'Scheduler, MessageChannel, work loop — планирование не блокирует main thread.',
    },
    ...overrides,
  };
}

describe('evaluateFollowUpPolicy — scope clarification', () => {
  it('returns clarification_redirect on same checkpoint when candidate asks for scope', () => {
    const decision = evaluateFollowUpPolicy(schedulingPolicyInput());

    expect(decision).toMatchObject({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'scheduling',
      followUpKind: 'clarification_redirect',
      reason: 'candidate_asked_for_scope',
    });
  });

  it('blocks sufficient_question_score while scope clarification is pending', () => {
    const decision = evaluateFollowUpPolicy(
      schedulingPolicyInput({
        checkpointStates: [
          {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 2.5,
            maxScore: 2.5,
            followUpCount: 1,
            needsManualReview: false,
          },
        ],
        questionMaxScore: 2.5,
      }),
    );

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(decision.followUpKind).toBe('clarification_redirect');
    }
  });

  it('exhausts clarification budget after max scope turns', () => {
    const decision = evaluateFollowUpPolicy(
      schedulingPolicyInput({
        localTurns: [
          { role: 'candidate', content: 'Что именно?' },
          { role: 'candidate', content: 'Что вы имеете в виду?' },
          { role: 'candidate', content: 'Можете конкретнее?' },
        ],
        latestCandidateAnswer: 'Можете конкретнее?',
        candidateTurnKind: 'scope_clarification',
      }),
    );

    expect(decision).toEqual({
      shouldAskFollowUp: false,
      reason: 'scope_clarification_exhausted',
    });
  });

  it('uses AI disposition for non-regex scope phrasing', () => {
    const decision = evaluateFollowUpPolicy(
      schedulingPolicyInput({
        latestCandidateAnswer: 'То есть речь про планировщик внутри Fiber?',
        candidateDispositionFromAi: 'asked_for_scope',
        candidateTurnKind: 'scope_clarification',
        localTurns: [
          {
            role: 'ai',
            content:
              'Как работает scheduler, MessageChannel и postMessage?',
          },
          {
            role: 'candidate',
            content: 'То есть речь про планировщик внутри Fiber?',
          },
        ],
      }),
    );

    expect(decision).toMatchObject({
      shouldAskFollowUp: true,
      followUpKind: 'clarification_redirect',
    });
  });

  it('handles fiber scheduling confirmation meta-turn', () => {
    const decision = evaluateFollowUpPolicy(
      schedulingPolicyInput({
        latestCandidateAnswer:
          'Вы говорите о этапах и методах react fiber да?',
        localTurns: [
          {
            role: 'ai',
            content:
              'Да, это верно в общих чертах. Как именно работает — scheduler, MessageChannel и postMessage?',
          },
          {
            role: 'candidate',
            content: 'Вы говорите о этапах и методах react fiber да?',
          },
        ],
      }),
    );

    expect(decision).toMatchObject({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'scheduling',
      followUpKind: 'clarification_redirect',
    });

    const question = buildNaturalTemplateFollowUp({
      questionText: 'Fiber?',
      checkpointTitle: 'Scheduling',
      latestCandidateAnswer:
        'Вы говорите о этапах и методах react fiber да?',
      followUpKind: 'clarification_redirect',
      missingMustConcepts: ['MessageChannel', 'shouldYield'],
      evaluationHints: fiberCheckpoint('scheduling').evaluationHints,
      previousFollowUpQuestions: [
        'Да, это верно в общих чертах. Как именно работает — scheduler, MessageChannel и postMessage?',
      ],
    });

    expect(question).toMatch(/^Да, именно про/i);
    expect(question).not.toMatch(/планирует работу Fiber/i);
  });

  it('handles answer-format meta question on render/commit follow-up', () => {
    const fiberDefinition = fiberCheckpoint('fiber_definition', {
      title: 'Понимает, что такое Fiber',
      score: 2,
      sortOrder: 0,
    });
    const previousFollowUp =
      'Расскажите, как вы понимаете работу React Fiber: что именно происходит при обновлении (render/reconciliation) и чем это отличается от commit?';

    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 8,
      checkpoints: [fiberDefinition],
      checkpointStates: [
        {
          checkpointKey: 'fiber_definition',
          status: 'partial',
          scoreAwarded: 1,
          maxScore: 2,
          followUpCount: 1,
          needsManualReview: false,
        },
      ],
      followUpsUsedForQuestion: 1,
      maxFollowUpsPerQuestion: 8,
      maxFollowUpsPerCheckpoint: 3,
      questionScoreSufficientRatio: 0.6,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer:
        'А вам нужно чтобы я ответил коротко и по делу или по деталям?',
      candidateDispositionFromAi: 'asked_for_scope',
      candidateTurnKind: 'format_clarification',
      stickyTargetCheckpointKey: 'fiber_definition',
      isFollowUpAnswer: true,
      localTurns: [
        { role: 'ai', content: previousFollowUp },
        {
          role: 'candidate',
          content:
            'А вам нужно чтобы я ответил коротко и по делу или по деталям?',
        },
      ],
    });

    expect(decision).toMatchObject({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'fiber_definition',
      followUpKind: 'clarification_redirect',
    });

    const question = buildNaturalTemplateFollowUp({
      questionText: 'Fiber?',
      checkpointTitle: fiberDefinition.title,
      latestCandidateAnswer:
        'А вам нужно чтобы я ответил коротко и по делу или по деталям?',
      followUpKind: 'clarification_redirect',
      missingMustConcepts: ['render phase', 'commit phase'],
      evaluationHints: fiberDefinition.evaluationHints,
      previousFollowUpQuestions: [previousFollowUp],
    });

    expect(question).toMatch(/^Кратко и по существу/i);
    expect(question).not.toMatch(/scheduler|MessageChannel/i);
    expect(question).not.toMatch(/в целом всё так/i);
  });

  it('blocks topic redirect when candidate confirms scope on fiber render/commit probe', () => {
    const fiberDefinition = fiberCheckpoint('fiber_definition', {
      title: 'Понимает, что такое Fiber',
      score: 2,
      sortOrder: 0,
    });

    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 8,
      checkpoints: [fiberDefinition],
      checkpointStates: [
        {
          checkpointKey: 'fiber_definition',
          status: 'partial',
          scoreAwarded: 1,
          maxScore: 2,
          followUpCount: 1,
          needsManualReview: false,
          rationale: 'depth=partial_knowledge probe=pending',
        },
      ],
      followUpsUsedForQuestion: 1,
      maxFollowUpsPerQuestion: 8,
      maxFollowUpsPerCheckpoint: 3,
      questionScoreSufficientRatio: 0.6,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer: 'Вы говорите про render и commit phase, да?',
      candidateDispositionFromAi: 'asked_for_scope',
      candidateTurnKind: 'scope_clarification',
      stickyTargetCheckpointKey: 'fiber_definition',
      isFollowUpAnswer: true,
      localTurns: [
        {
          role: 'ai',
          content:
            'Расскажите про reconciliation: render- и commit-этапы и почему можно прерывать?',
        },
        {
          role: 'candidate',
          content: 'Вы говорите про render и commit phase, да?',
        },
      ],
      latestCheckpointResults: [
        {
          checkpointKey: 'fiber_definition',
          status: 'partial',
          scoreAwarded: 1,
          rationale: 'coverage=none accuracy=none depth=partial_knowledge',
        },
      ],
    });

    expect(decision).toMatchObject({
      shouldAskFollowUp: true,
      targetCheckpointKey: 'fiber_definition',
      followUpKind: 'clarification_redirect',
      reason: 'candidate_asked_for_scope',
    });
  });
});
