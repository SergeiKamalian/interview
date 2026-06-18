import { evaluateFollowUpPolicy } from './follow-up-policy.util';
import type { FollowUpPolicyInput } from '../types/follow-up-planner.types';
import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';

function attempt91Turn6PolicyInput(
  overrides: Partial<FollowUpPolicyInput> = {},
): FollowUpPolicyInput {
  const declineAnswer =
    'С child/sibling/return не углублюсь, лучше расскажу про lanes или commit phase';

  const checkpoints = [
    fiberCheckpoint('fiber_definition', { sortOrder: 0 }),
    fiberCheckpoint('stack_vs_fiber', { sortOrder: 1 }),
    fiberCheckpoint('fiber_pointers', { sortOrder: 2 }),
    fiberCheckpoint('render_phase', { sortOrder: 3 }),
    fiberCheckpoint('commit_phase', { sortOrder: 4 }),
    fiberCheckpoint('lanes_priority', { sortOrder: 5 }),
  ];

  return {
    questionMaxScore: 8,
    questionText: 'Как работает React Fiber и процесс обновления Virtual DOM?',
    checkpoints,
    checkpointStates: [
      {
        checkpointKey: 'fiber_definition',
        status: 'covered',
        scoreAwarded: 1,
        maxScore: 1,
        followUpCount: 0,
        needsManualReview: false,
      },
      {
        checkpointKey: 'stack_vs_fiber',
        status: 'covered',
        scoreAwarded: 1,
        maxScore: 1,
        followUpCount: 0,
        needsManualReview: false,
      },
      {
        checkpointKey: 'fiber_pointers',
        status: 'partial',
        scoreAwarded: 0.5,
        maxScore: 1,
        followUpCount: 1,
        needsManualReview: false,
        rationale: 'depth=heard_of. Explicit refusal after probe; shallow accept closed.',
      },
      {
        checkpointKey: 'render_phase',
        status: 'partial',
        scoreAwarded: 0.75,
        maxScore: 1,
        followUpCount: 1,
        needsManualReview: false,
      },
      {
        checkpointKey: 'commit_phase',
        status: 'missed',
        scoreAwarded: 0,
        maxScore: 1,
        followUpCount: 0,
        needsManualReview: false,
      },
      {
        checkpointKey: 'lanes_priority',
        status: 'missed',
        scoreAwarded: 0,
        maxScore: 1,
        followUpCount: 0,
        needsManualReview: false,
      },
    ],
    followUpsUsedForQuestion: 2,
    maxFollowUpsPerQuestion: 8,
    maxFollowUpsPerCheckpoint: 3,
    questionScoreSufficientRatio: 0.6,
    lowWeightCheckpointRatio: 0.2,
    latestCandidateAnswer: declineAnswer,
    candidateDispositionFromAi: 'declined',
    candidateTurnKind: 'decline_scoped',
    evaluationMode: 'target_refusal',
    stickyTargetCheckpointKey: 'fiber_pointers',
    isFollowUpAnswer: true,
    latestCheckpointResults: [
      {
        checkpointKey: 'fiber_pointers',
        status: 'partial',
        scoreAwarded: 0.5,
        rationale: 'depth=heard_of. Explicit refusal after probe; shallow accept closed.',
      },
    ],
    localTurns: [
      {
        role: 'candidate',
        sequenceOrder: 1,
        content:
          'Fiber — reconciliation engine с render и commit phase, child sibling return.',
        messageKind: 'main_answer',
      },
      {
        role: 'candidate',
        sequenceOrder: 2,
        content: declineAnswer,
        messageKind: 'follow_up_answer',
        targetCheckpointKey: 'fiber_pointers',
      },
    ],
    checkpointEvidenceTextByKey: {
      fiber_definition:
        'Fiber — reconciliation engine с render и commit phase.',
      stack_vs_fiber: 'call stack синхронно, Fiber связный список work loop.',
      fiber_pointers: declineAnswer,
    },
    ...overrides,
  };
}

describe('evaluateFollowUpPolicy — target refusal (DECL-01)', () => {
  it('attempt #91 turn 6: does not re-probe fiber_pointers after decline_scoped', () => {
    const decision = evaluateFollowUpPolicy(attempt91Turn6PolicyInput());

    if (decision.shouldAskFollowUp) {
      expect(decision.targetCheckpointKey).not.toBe('fiber_pointers');
      expect(decision.reason).toBe('candidate_refused_target_checkpoint');
      expect(decision.followUpKind).not.toBe('topic_redirect');
    } else {
      expect(decision.reason).toBe('candidate_refused_target_checkpoint');
    }
  });

  it('pivots toward checkpoint mentioned in refusal answer when budget allows', () => {
    const decision = evaluateFollowUpPolicy(attempt91Turn6PolicyInput());

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(['commit_phase', 'lanes_priority']).toContain(
        decision.targetCheckpointKey,
      );
      expect(decision.reason).toBe('candidate_refused_target_checkpoint');
    }
  });

  it('does not trigger topic mismatch redirect on decline_scoped turn', () => {
    const decision = evaluateFollowUpPolicy(
      attempt91Turn6PolicyInput({
        latestCheckpointResults: [
          {
            checkpointKey: 'fiber_pointers',
            status: 'missed',
            scoreAwarded: 0,
            rationale: 'coverage=none accuracy=none',
          },
          {
            checkpointKey: 'fiber_definition',
            status: 'covered',
            scoreAwarded: 1,
            rationale: 'coverage=high accuracy=full depth=understands',
          },
        ],
      }),
    );

    if (decision.shouldAskFollowUp) {
      expect(decision.reason).not.toBe('topic_mismatch_redirect');
      expect(decision.followUpKind).not.toBe('topic_redirect');
    }
  });

  it('returns candidate_refused_target_checkpoint when no other gaps remain', () => {
    const decision = evaluateFollowUpPolicy(
      attempt91Turn6PolicyInput({
        checkpointStates: [
          {
            checkpointKey: 'fiber_definition',
            status: 'covered',
            scoreAwarded: 1,
            maxScore: 1,
            followUpCount: 0,
            needsManualReview: false,
          },
          {
            checkpointKey: 'fiber_pointers',
            status: 'partial',
            scoreAwarded: 0.5,
            maxScore: 1,
            followUpCount: 1,
            needsManualReview: false,
          },
        ],
        checkpoints: [
          fiberCheckpoint('fiber_definition', { sortOrder: 0 }),
          fiberCheckpoint('fiber_pointers', { sortOrder: 1 }),
        ],
        followUpsUsedForQuestion: 7,
        maxFollowUpsPerQuestion: 8,
      }),
    );

    expect(decision).toEqual({
      shouldAskFollowUp: false,
      reason: 'candidate_refused_target_checkpoint',
    });
  });

  it('does not intercept decline_whole fast path', () => {
    const decision = evaluateFollowUpPolicy({
      ...attempt91Turn6PolicyInput(),
      candidateTurnKind: 'decline_whole',
      evaluationMode: 'skip',
      candidateDispositionFromAi: 'declined',
      latestCandidateAnswer: 'Я ничего не знаю по этой теме',
    });

    expect(decision.shouldAskFollowUp).toBe(false);
    expect(decision.reason).toBe('candidate_declined_knowledge');
  });
});
