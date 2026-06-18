import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import {
  allowsFullCheckpointScoring,
  isMetaTurnMode,
  resolveEvaluationMode,
  shouldFreezeCheckpointOnMetaTurn,
  shouldSkipEvaluation,
} from './resolve-evaluation-mode.util';

describe('resolve-evaluation-mode.util', () => {
  it.each([
    ['substantive_answer', 'full'],
    ['scope_clarification', 'clarification'],
    ['format_clarification', 'clarification'],
    ['decline_scoped', 'target_refusal'],
    ['topic_refusal', 'target_refusal'],
    ['confused', 'redirect'],
    ['off_topic', 'redirect'],
    ['decline_whole', 'skip'],
  ] as const satisfies ReadonlyArray<
    readonly [CandidateTurnKind, ReturnType<typeof resolveEvaluationMode>]
  >)('maps %s to %s', (turnKind, mode) => {
    expect(resolveEvaluationMode(turnKind)).toBe(mode);
  });

  it.each([null, undefined])(
    'returns full for missing turn_kind (%s)',
    (turnKind) => {
      expect(resolveEvaluationMode(turnKind)).toBe('full');
    },
  );

  it('returns full for unknown turn_kind at runtime', () => {
    expect(
      resolveEvaluationMode('not_a_real_turn_kind' as CandidateTurnKind),
    ).toBe('full');
  });

  describe('isMetaTurnMode', () => {
    it.each([
      ['full', false],
      ['clarification', true],
      ['target_refusal', true],
      ['redirect', true],
      ['skip', true],
    ] as const)('returns %s → %s', (mode, expected) => {
      expect(isMetaTurnMode(mode)).toBe(expected);
    });
  });

  describe('shouldSkipEvaluation', () => {
    it.each([
      ['skip', true],
      ['full', false],
      ['clarification', false],
      ['target_refusal', false],
      ['redirect', false],
    ] as const)('returns %s → %s', (mode, expected) => {
      expect(shouldSkipEvaluation(mode)).toBe(expected);
    });
  });

  describe('allowsFullCheckpointScoring', () => {
    it.each([
      ['full', true],
      ['clarification', false],
      ['target_refusal', false],
      ['redirect', false],
      ['skip', false],
    ] as const)('returns %s → %s', (mode, expected) => {
      expect(allowsFullCheckpointScoring(mode)).toBe(expected);
    });
  });

  describe('shouldFreezeCheckpointOnMetaTurn', () => {
    it.each([
      ['full', 'fiber_definition', 'fiber_pointers', false],
      ['target_refusal', 'fiber_definition', 'fiber_pointers', true],
      ['target_refusal', 'fiber_pointers', 'fiber_pointers', false],
      ['clarification', 'render_phase', 'fiber_pointers', true],
    ] as const)(
      'mode=%s key=%s target=%s → %s',
      (mode, checkpointKey, targetKey, expected) => {
        expect(
          shouldFreezeCheckpointOnMetaTurn(mode, checkpointKey, targetKey),
        ).toBe(expected);
      },
    );
  });
});
