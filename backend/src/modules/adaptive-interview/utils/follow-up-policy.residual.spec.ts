import { fiberCheckpoint, FIBER_EVALUATION_HINTS } from './fiber-evaluation-hints.fixture';
import {
  buildNaturalTemplateFollowUp,
  evaluateFollowUpPolicy,
} from './follow-up-policy.util';

describe('follow-up-policy residual gap probe', () => {
  const renderCheckpoint = fiberCheckpoint('render_phase', {
    score: 1,
    sortOrder: 4,
    title: 'Render phase и WIP',
  });

  it('requests residual follow-up when compound answer covers only part of mustConcepts', () => {
    const partialRenderAnswer =
      'Render phase — React считает изменения в памяти, экран пока не обновляет.';
    const cumulativeEvidence = [
      'Fiber render commit частями.',
      partialRenderAnswer,
    ].join(' ');

    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 8,
      checkpoints: [renderCheckpoint],
      checkpointStates: [
        {
          checkpointKey: 'render_phase',
          status: 'partial',
          scoreAwarded: 0.55,
          maxScore: 1,
          followUpCount: 1,
          needsManualReview: false,
          rationale:
            'depth=partial_knowledge coverage=medium accuracy=partial',
        },
      ],
      followUpsUsedForQuestion: 2,
      maxFollowUpsPerQuestion: 10,
      maxFollowUpsPerCheckpoint: 1,
      questionScoreSufficientRatio: 0.6,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer: partialRenderAnswer,
      checkpointEvidenceTextByKey: {
        render_phase: cumulativeEvidence,
      },
      stickyTargetCheckpointKey: 'render_phase',
    });

    expect(decision.shouldAskFollowUp).toBe(true);
    if (decision.shouldAskFollowUp) {
      expect(decision.targetCheckpointKey).toBe('render_phase');
      expect(decision.followUpKind).toBe('residual_probe');
      expect(decision.reason).toBe('checkpoint_residual_gap_probe');
      expect(decision.missingMustConcepts).toEqual(
        expect.arrayContaining(['wip', 'alternate']),
      );
    }
  });

  it('builds narrowing template for residual probe', () => {
    const question = buildNaturalTemplateFollowUp({
      questionText: 'Fiber',
      checkpointTitle: 'Render phase',
      latestCandidateAnswer: 'render phase в памяти',
      followUpKind: 'residual_probe',
      missingMustConcepts: ['wip', 'alternate', 'current tree'],
      evaluationHints: FIBER_EVALUATION_HINTS.render_phase,
    });

    expect(question).toMatch(/верно|схвач|прав/i);
    expect(question).toContain('WIP tree');
    expect(question).not.toContain('Понимает');
  });

  it('does not request residual probe when mustConcepts threshold is met', () => {
    const fullAnswer =
      'Render phase строит WIP alternate в памяти, current tree на экране, DOM не трогается, render прерывается.';

    const decision = evaluateFollowUpPolicy({
      questionMaxScore: 8,
      checkpoints: [renderCheckpoint],
      checkpointStates: [
        {
          checkpointKey: 'render_phase',
          status: 'partial',
          scoreAwarded: 0.85,
          maxScore: 1,
          followUpCount: 1,
          needsManualReview: false,
          rationale: 'depth=understands coverage=high accuracy=partial',
        },
      ],
      followUpsUsedForQuestion: 2,
      maxFollowUpsPerQuestion: 10,
      maxFollowUpsPerCheckpoint: 1,
      questionScoreSufficientRatio: 0.6,
      lowWeightCheckpointRatio: 0.2,
      latestCandidateAnswer: fullAnswer,
      checkpointEvidenceTextByKey: {
        render_phase: fullAnswer,
      },
    });

    expect(decision.shouldAskFollowUp).toBe(false);
  });
});
