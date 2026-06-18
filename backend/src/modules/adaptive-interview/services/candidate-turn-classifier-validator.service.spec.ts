import { CandidateTurnClassifierValidatorService } from './candidate-turn-classifier-validator.service';

describe('CandidateTurnClassifierValidatorService', () => {
  const validator = new CandidateTurnClassifierValidatorService();

  it('accepts valid classifier JSON', () => {
    const result = validator.validateResponse(
      JSON.stringify({
        turn_kind: 'scope_clarification',
        confidence: 'high',
        reason: 'Кандидат уточняет, о чём вопрос.',
      }),
    );

    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.data.turnKind).toBe('scope_clarification');
      expect(result.data.disposition).toBe('asked_for_scope');
    }
  });

  it('strips markdown fences', () => {
    const result = validator.validateResponse(
      '```json\n{"turn_kind":"substantive_answer","confidence":"high","reason":"Есть объяснение."}\n```',
    );

    expect(result.status).toBe('valid');
  });

  it('rejects unknown turn_kind', () => {
    const result = validator.validateResponse(
      JSON.stringify({
        turn_kind: 'maybe_answer',
        confidence: 'high',
        reason: 'test',
      }),
    );

    expect(result.status).toBe('invalid');
  });

  it('rejects missing reason', () => {
    const result = validator.validateResponse(
      JSON.stringify({
        turn_kind: 'substantive_answer',
        confidence: 'high',
      }),
    );

    expect(result.status).toBe('invalid');
  });
});
