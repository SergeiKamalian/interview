import {
  mapTurnKindToDisposition,
  normalizeCandidateTurnClassification,
} from './map-turn-kind-to-disposition.util';

describe('map-turn-kind-to-disposition.util', () => {
  it.each([
    ['substantive_answer', 'engaged'],
    ['scope_clarification', 'asked_for_scope'],
    ['format_clarification', 'asked_for_scope'],
    ['decline_whole', 'declined'],
    ['decline_scoped', 'declined'],
    ['topic_refusal', 'declined'],
    ['confused', 'confused'],
    ['off_topic', 'off_topic'],
  ] as const)('maps %s to %s', (turnKind, disposition) => {
    expect(mapTurnKindToDisposition(turnKind)).toBe(disposition);
  });

  it('normalizes classifier JSON payload', () => {
    expect(
      normalizeCandidateTurnClassification({
        turn_kind: 'scope_clarification',
        confidence: 'high',
        reason: 'Кандидат уточняет scope.',
        opener_readiness: null,
      }),
    ).toEqual({
      turnKind: 'scope_clarification',
      confidence: 'high',
      reason: 'Кандидат уточняет scope.',
      openerReadiness: null,
      disposition: 'asked_for_scope',
    });
  });
});
