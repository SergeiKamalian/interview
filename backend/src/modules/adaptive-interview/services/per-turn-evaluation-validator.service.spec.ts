import { PerTurnEvaluationValidatorService } from './per-turn-evaluation-validator.service';

describe('PerTurnEvaluationValidatorService', () => {
  let service: PerTurnEvaluationValidatorService;

  beforeEach(() => {
    service = new PerTurnEvaluationValidatorService();
  });

  const maxScoreByKey = {
    dependency_array: 1,
    cleanup: 1,
  };

  it('accepts a valid per-turn checkpoint payload', () => {
    const rawContent = JSON.stringify({
      candidate_disposition: 'engaged',
      checkpoint_results: [
        {
          checkpoint_key: 'dependency_array',
          status: 'missed',
          score_awarded: 0,
          confidence: 0.92,
          evidence_summary: null,
          rationale: 'Candidate did not mention dependency array.',
        },
        {
          checkpoint_key: 'cleanup',
          status: 'partial',
          score_awarded: 0.5,
          confidence: 0.7,
          evidence_summary: 'Brief cleanup mention',
          rationale: 'Mentioned cleanup briefly.',
        },
      ],
    });

    const result = service.validateResponse(
      rawContent,
      ['dependency_array', 'cleanup'],
      maxScoreByKey,
    );

    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.data.candidateDisposition).toBe('engaged');
      expect(result.data.checkpointResults[0]).toEqual({
        checkpointKey: 'dependency_array',
        status: 'missed',
        scoreAwarded: 0,
        confidence: 0.92,
        evidenceSummary: null,
        rationale: 'Candidate did not mention dependency array.',
      });
    }
  });

  it('rejects unknown checkpoint keys', () => {
    const rawContent = JSON.stringify({
      candidate_disposition: 'engaged',
      checkpoint_results: [
        {
          checkpoint_key: 'unknown_key',
          status: 'missed',
          score_awarded: 0,
          confidence: 0.5,
          evidence_summary: null,
          rationale: 'Unknown',
        },
      ],
    });

    const result = service.validateResponse(rawContent, ['dependency_array'], {
      dependency_array: 1,
    });

    expect(result.status).toBe('invalid_ai_response');
    if (result.status === 'invalid_ai_response') {
      expect(result.errors).toContain('Unknown checkpoint key "unknown_key"');
    }
  });

  it('rejects score_awarded above checkpoint max', () => {
    const rawContent = JSON.stringify({
      candidate_disposition: 'engaged',
      checkpoint_results: [
        {
          checkpoint_key: 'dependency_array',
          status: 'covered',
          score_awarded: 2,
          confidence: 0.9,
          evidence_summary: 'Full answer',
          rationale: 'Complete',
        },
      ],
    });

    const result = service.validateResponse(
      rawContent,
      ['dependency_array'],
      maxScoreByKey,
    );

    expect(result.status).toBe('invalid_ai_response');
    if (result.status === 'invalid_ai_response') {
      expect(result.errors.join(' ')).toContain('exceeds max_score');
    }
  });

  it('rejects out-of-range confidence', () => {
    const rawContent = JSON.stringify({
      candidate_disposition: 'engaged',
      checkpoint_results: [
        {
          checkpoint_key: 'dependency_array',
          status: 'missed',
          score_awarded: 0,
          confidence: 1.2,
          evidence_summary: null,
          rationale: 'Too confident',
        },
      ],
    });

    const result = service.validateResponse(
      rawContent,
      ['dependency_array'],
      maxScoreByKey,
    );

    expect(result.status).toBe('invalid_ai_response');
  });
});
