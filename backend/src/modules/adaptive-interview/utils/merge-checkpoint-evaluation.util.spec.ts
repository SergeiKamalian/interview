import { mergeCheckpointEvaluation } from './merge-checkpoint-evaluation.util';

describe('mergeCheckpointEvaluation', () => {
  it('keeps the higher score when a later turn scores lower without decrease flag', () => {
    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: 0.5,
      currentStatus: 'partial',
      currentEvidenceSummary: 'Mentioned T[]',
      currentRationale: 'Partial reuse example',
      incomingScoreAwarded: 0,
      incomingStatus: 'missed',
      incomingEvidenceSummary: null,
      incomingRationale: 'Latest answer declined one aspect',
      maxScore: 1,
    });

    expect(merged).toEqual({
      scoreAwarded: 0.5,
      status: 'partial',
      evidenceSummary: 'Mentioned T[]',
      rationale: 'Partial reuse example',
    });
  });

  it('reduces score when latest turn signals false_claim', () => {
    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: 0.5,
      currentStatus: 'partial',
      currentEvidenceSummary: 'Earlier correct commit',
      currentRationale: 'Main answer partial',
      incomingScoreAwarded: 0.25,
      incomingStatus: 'partial',
      incomingEvidenceSummary: 'Wrong interruptible commit',
      incomingRationale:
        'depth=false_claim. Semantic guard capped score because candidate evidence contains a direct contradiction.',
      maxScore: 1,
      incomingAllowsScoreDecrease: true,
    });

    expect(merged.scoreAwarded).toBe(0.25);
    expect(merged.rationale).toContain('false_claim');
  });

  it('upgrades score and status when a later turn adds evidence', () => {
    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: 0,
      currentStatus: 'missed',
      currentEvidenceSummary: null,
      currentRationale: null,
      incomingScoreAwarded: 1,
      incomingStatus: 'covered',
      incomingEvidenceSummary: 'Explained DRY reuse',
      incomingRationale: 'Clear reusability answer',
      maxScore: 1,
    });

    expect(merged).toEqual({
      scoreAwarded: 1,
      status: 'covered',
      evidenceSummary: 'Explained DRY reuse',
      rationale: 'Clear reusability answer',
    });
  });

  it('applies lower weight for follow-up evidence than main answer', () => {
    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: 0,
      currentStatus: 'missed',
      currentEvidenceSummary: null,
      currentRationale: null,
      incomingScoreAwarded: 1,
      incomingStatus: 'covered',
      incomingEvidenceSummary: 'Buzzword on follow-up',
      incomingRationale: 'Follow-up mention',
      maxScore: 1,
      evidenceSource: 'follow_up_answer',
    });

    expect(merged.scoreAwarded).toBeLessThanOrEqual(0.25);
    expect(merged.status).not.toBe('covered');
  });

  it('allows stronger follow-up boost when main answer already partial', () => {
    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: 0.5,
      currentStatus: 'partial',
      currentEvidenceSummary: 'Partial main',
      currentRationale: 'Main partial',
      incomingScoreAwarded: 1,
      incomingStatus: 'covered',
      incomingEvidenceSummary: 'Clarified on follow-up',
      incomingRationale: 'Better follow-up',
      maxScore: 1,
      evidenceSource: 'follow_up_answer',
    });

    expect(merged.scoreAwarded).toBeGreaterThanOrEqual(0.75);
    expect(merged.scoreAwarded).toBeLessThanOrEqual(1);
  });
});
