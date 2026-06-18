import { evaluateFollowUpPolicy } from './follow-up-policy.util';
import { hooksCheckpoint } from './hooks-evaluation-hints.fixture';
import {
  buildTopicRedirectFollowUpQuestion,
  detectTopicMismatch,
} from './topic-mismatch.util';

describe('topic-mismatch.util', () => {
  it('detects useState answer when useEffect was expected', () => {
    const detection = detectTopicMismatch({
      expectedCheckpointKey: 'use_effect',
      latestCandidateAnswer:
        'useState хранит state в компоненте, при setState React перерисовывает компонент.',
      checkpoints: [
        hooksCheckpoint('use_effect', {
          title: 'useEffect',
          sortOrder: 0,
        }),
        hooksCheckpoint('use_state', {
          title: 'useState',
          sortOrder: 1,
        }),
      ],
      checkpointResults: [
        {
          checkpointKey: 'use_effect',
          status: 'missed',
          scoreAwarded: 0,
          rationale: 'coverage=none accuracy=none depth=none',
        },
        {
          checkpointKey: 'use_state',
          status: 'partial',
          scoreAwarded: 0.75,
          rationale: 'coverage=high accuracy=partial depth=partial_knowledge',
        },
      ],
    });

    expect(detection.isMismatch).toBe(true);
    expect(detection.expectedCheckpointKey).toBe('use_effect');
    expect(detection.answeredCheckpointKey).toBe('use_state');
  });

  it('builds human-readable redirect question', () => {
    expect(
      buildTopicRedirectFollowUpQuestion({
        expectedCheckpointTitle: 'useEffect',
        answeredCheckpointTitle: 'useState',
      }),
    ).toContain('useEffect');
    expect(
      buildTopicRedirectFollowUpQuestion({
        expectedCheckpointTitle: 'useEffect',
        answeredCheckpointTitle: 'useState',
      }),
    ).toContain('useState');
  });
});

describe('follow-up-policy topic redirect', () => {
  it('prioritizes topic redirect over generic probe', () => {
    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 2,
      questionText: 'Как работает useEffect?',
      checkpoints: [
        hooksCheckpoint('use_effect', {
          title: 'useEffect',
          sortOrder: 0,
        }),
        hooksCheckpoint('use_state', {
          title: 'useState',
          sortOrder: 1,
        }),
      ],
      checkpointStates: [
        {
          checkpointKey: 'use_effect',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
        },
        {
          checkpointKey: 'use_state',
          status: 'partial',
          scoreAwarded: 0.75,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
        },
      ],
      followUpsUsedForQuestion: 0,
      maxFollowUpsPerQuestion: 4,
      maxFollowUpsPerCheckpoint: 1,
      questionScoreSufficientRatio: 0.85,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer:
        'useState хранит state, setState вызывает перерисовку компонента.',
      candidateDispositionFromAi: 'misunderstood_question',
      latestCheckpointResults: [
        {
          checkpointKey: 'use_effect',
          status: 'missed',
          scoreAwarded: 0,
          rationale: 'coverage=none accuracy=none',
        },
        {
          checkpointKey: 'use_state',
          status: 'partial',
          scoreAwarded: 0.75,
          rationale: 'coverage=high accuracy=partial',
        },
      ],
    });

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(decision.targetCheckpointKey).toBe('use_effect');
      expect(decision.followUpKind).toBe('topic_redirect');
      expect(decision.reason).toBe('topic_mismatch_redirect');
    }
  });

  it('does not redirect again after redirect=asked', () => {
    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 2,
      questionText: 'Как работает useEffect?',
      checkpoints: [
        hooksCheckpoint('use_effect', { title: 'useEffect', sortOrder: 0 }),
        hooksCheckpoint('use_state', { title: 'useState', sortOrder: 1 }),
      ],
      checkpointStates: [
        {
          checkpointKey: 'use_effect',
          status: 'unclear',
          scoreAwarded: 0,
          maxScore: 1,
          followUpCount: 1,
          needsManualReview: false,
          rationale: 'redirect=asked',
        },
        {
          checkpointKey: 'use_state',
          status: 'partial',
          scoreAwarded: 0.75,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
        },
      ],
      followUpsUsedForQuestion: 1,
      maxFollowUpsPerQuestion: 4,
      maxFollowUpsPerCheckpoint: 1,
      questionScoreSufficientRatio: 0.85,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer:
        'useState хранит state, setState вызывает перерисовку компонента.',
      candidateDispositionFromAi: 'misunderstood_question',
      stickyTargetCheckpointKey: 'use_effect',
      latestCheckpointResults: [
        {
          checkpointKey: 'use_effect',
          status: 'missed',
          scoreAwarded: 0,
          rationale: 'coverage=none accuracy=none',
        },
        {
          checkpointKey: 'use_state',
          status: 'partial',
          scoreAwarded: 0.75,
          rationale: 'coverage=high accuracy=partial',
        },
      ],
    });

    if (decision.shouldAskFollowUp) {
      expect(decision.followUpKind).not.toBe('topic_redirect');
    } else {
      expect(decision.shouldAskFollowUp).toBe(false);
    }
  });
});

describe('topic mismatch vs scope clarification', () => {
  it('does not treat scope confirmation as topic mismatch when AI says misunderstood_question', () => {
    const detection = detectTopicMismatch({
      expectedCheckpointKey: 'fiber_definition',
      latestCandidateAnswer: 'Вы говорите про render и commit phase, да?',
      candidateTurnKind: 'scope_clarification',
      checkpoints: [
        {
          checkpointKey: 'fiber_definition',
          title: 'Понимает, что такое Fiber',
          expected: 'reconciliation, render phase, commit phase',
          score: 2,
          sortOrder: 0,
          evaluationHints: {
            mustConcepts: ['render phase', 'commit phase', 'reconciliation'],
          },
        },
      ],
      checkpointResults: [
        {
          checkpointKey: 'fiber_definition',
          status: 'missed',
          scoreAwarded: 0,
          rationale: 'coverage=none accuracy=none',
        },
      ],
      candidateDispositionFromAi: 'misunderstood_question',
      isTargetedFollowUp: true,
    });

    expect(detection.isMismatch).toBe(false);
    expect(detection.reason).toBe('scope_clarification_meta_turn');
  });

  it('humanizes rubric checkpoint titles for redirect copy', () => {
    expect(
      buildTopicRedirectFollowUpQuestion({
        expectedCheckpointTitle: 'Понимает, что такое Fiber',
      }),
    ).toContain('что такое Fiber');
    expect(
      buildTopicRedirectFollowUpQuestion({
        expectedCheckpointTitle: 'Понимает, что такое Fiber',
      }),
    ).not.toContain('понимает, что');
  });
});
