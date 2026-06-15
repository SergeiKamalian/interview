import { mergeCheckpointEvaluation } from './merge-checkpoint-evaluation.util';

describe('mergeCheckpointEvaluation', () => {
  it('keeps the higher score when a later turn scores lower', () => {
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
});
