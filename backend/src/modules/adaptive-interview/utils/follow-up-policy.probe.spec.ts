import { evaluateFollowUpPolicy } from './follow-up-policy.util';
import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';

describe('evaluateFollowUpPolicy probe-or-accept', () => {
  it('selects scheduling probe before lower-weight partial checkpoint', () => {
    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 8,
      checkpoints: [
        fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 }),
        fiberCheckpoint('fiber_pointers', { score: 1, sortOrder: 2 }),
      ],
      checkpointStates: [
        {
          checkpointKey: 'scheduling',
          status: 'partial',
          scoreAwarded: 1.38,
          maxScore: 2.5,
          followUpCount: 0,
          needsManualReview: false,
          rationale:
            'depth=partial_knowledge coverage=medium accuracy=partial нет scheduler',
        },
        {
          checkpointKey: 'fiber_pointers',
          status: 'partial',
          scoreAwarded: 0.5,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
          rationale: 'depth=partial_knowledge coverage=low accuracy=partial',
        },
      ],
      followUpsUsedForQuestion: 0,
      maxFollowUpsPerQuestion: 3,
      maxFollowUpsPerCheckpoint: 1,
      questionScoreSufficientRatio: 0.6,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer:
        'Планирование Fiber — приоритеты ввода. У Fiber child sibling return.',
    });

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(decision.targetCheckpointKey).toBe('scheduling');
      expect(decision.followUpKind).toBe('depth_probe');
      expect(decision.reason).toBe('checkpoint_probe_required');
    }
  });

  it('does not early-stop when advanced scheduling probe is pending', () => {
    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 8,
      checkpoints: [
        fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 }),
        fiberCheckpoint('render_phase', { score: 1, sortOrder: 4 }),
      ],
      checkpointStates: [
        {
          checkpointKey: 'scheduling',
          status: 'partial',
          scoreAwarded: 1.38,
          maxScore: 2.5,
          followUpCount: 0,
          needsManualReview: false,
          rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
        },
        {
          checkpointKey: 'render_phase',
          status: 'covered',
          scoreAwarded: 1,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
          rationale: 'depth=understands coverage=high accuracy=full',
        },
      ],
      followUpsUsedForQuestion: 0,
      maxFollowUpsPerQuestion: 3,
      maxFollowUpsPerCheckpoint: 1,
      questionScoreSufficientRatio: 0.6,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer: 'Планирование Fiber — приоритеты ввода.',
    });

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(decision.targetCheckpointKey).toBe('scheduling');
    }
  });
});
