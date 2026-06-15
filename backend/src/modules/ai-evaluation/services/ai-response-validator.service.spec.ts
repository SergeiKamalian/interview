import { AiResponseValidatorService } from './ai-response-validator.service';

describe('AiResponseValidatorService', () => {
  let service: AiResponseValidatorService;

  beforeEach(() => {
    service = new AiResponseValidatorService();
  });

  it('accepts a valid checkpoint payload', () => {
    const rawContent = JSON.stringify({
      checkpoints: [
        {
          checkpoint_key: 'react_definition',
          status: 'met',
          confidence: 0.9,
          evidence_quote: 'React is a UI library',
          reasoning_short: 'Candidate defined React correctly.',
        },
      ],
    });

    const result = service.validateCheckpointResponse(rawContent, [
      'react_definition',
    ]);

    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.data.checkpoints[0]).toEqual({
        checkpointKey: 'react_definition',
        status: 'met',
        confidence: 0.9,
        evidenceQuote: 'React is a UI library',
        reasoningShort: 'Candidate defined React correctly.',
      });
    }
  });

  it('rejects checkpoint payload with missing field', () => {
    const rawContent = JSON.stringify({
      checkpoints: [
        {
          checkpoint_key: 'react_definition',
          status: 'met',
          confidence: 0.9,
          evidence_quote: 'React is a UI library',
        },
      ],
    });

    const result = service.validateCheckpointResponse(rawContent, [
      'react_definition',
    ]);

    expect(result.status).toBe('invalid_ai_response');
    if (result.status === 'invalid_ai_response') {
      expect(result.errors.join(' ')).toMatch(/reasoning_short|required/i);
    }
  });

  it('rejects checkpoint payload with out-of-range confidence', () => {
    const rawContent = JSON.stringify({
      checkpoints: [
        {
          checkpoint_key: 'react_definition',
          status: 'met',
          confidence: 1.5,
          evidence_quote: '',
          reasoning_short: 'Too confident.',
        },
      ],
    });

    const result = service.validateCheckpointResponse(rawContent, [
      'react_definition',
    ]);

    expect(result.status).toBe('invalid_ai_response');
  });

  it('rejects unknown checkpoint keys', () => {
    const rawContent = JSON.stringify({
      checkpoints: [
        {
          checkpoint_key: 'unknown_key',
          status: 'not_met',
          confidence: 0.1,
          evidence_quote: '',
          reasoning_short: 'Not covered.',
        },
      ],
    });

    const result = service.validateCheckpointResponse(rawContent, [
      'react_definition',
    ]);

    expect(result.status).toBe('invalid_ai_response');
    if (result.status === 'invalid_ai_response') {
      expect(result.errors).toContain('Unknown checkpoint key "unknown_key"');
    }
  });

  it('accepts a valid final evaluation narrative payload', () => {
    const rawContent = JSON.stringify({
      summary: 'Solid overall performance.',
      detailed_summary: 'Candidate demonstrated good fundamentals.',
      strengths: ['Clear communication'],
      weaknesses: ['Missed edge cases'],
      risks: ['Limited depth on performance'],
    });

    const result = service.validateFinalEvaluationResponse(rawContent);

    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.data.summary).toBe('Solid overall performance.');
      expect(result.data.strengths).toEqual(['Clear communication']);
    }
  });

  it('rejects final evaluation payload missing required narrative fields', () => {
    const rawContent = JSON.stringify({
      summary: 'Too short.',
      strengths: [],
      weaknesses: [],
      risks: [],
    });

    const result = service.validateFinalEvaluationResponse(rawContent);

    expect(result.status).toBe('invalid_ai_response');
  });
});
