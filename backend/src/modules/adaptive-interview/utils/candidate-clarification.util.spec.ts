import {
  buildClarificationTemplateFallback,
  countScopeClarificationTurns,
  isScopeClarificationTurn,
  isVagueFollowUpQuestion,
  MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION,
  resolveScopeClarificationDisposition,
} from './candidate-clarification.util';
import { FIBER_EVALUATION_HINTS } from './fiber-evaluation-hints.fixture';

describe('candidate-clarification.util', () => {
  describe('isVagueFollowUpQuestion', () => {
    it('detects generic vague follow-ups', () => {
      expect(
        isVagueFollowUpQuestion('Можете уточнить технические детали?'),
      ).toBe(true);
      expect(isVagueFollowUpQuestion('Расскажите про scheduler?')).toBe(false);
    });
  });

  describe('resolveScopeClarificationDisposition', () => {
    it('maps classifier turn_kind to disposition', () => {
      expect(
        resolveScopeClarificationDisposition({
          candidateTurnKind: 'scope_clarification',
          aiDisposition: 'engaged',
        }),
      ).toBe('asked_for_scope');
    });

    it('falls back to AI disposition when turn_kind is absent', () => {
      expect(
        resolveScopeClarificationDisposition({
          aiDisposition: 'asked_for_scope',
        }),
      ).toBe('asked_for_scope');
    });

    it('prefers classifier over evaluator disposition', () => {
      expect(
        resolveScopeClarificationDisposition({
          candidateTurnKind: 'substantive_answer',
          aiDisposition: 'misunderstood_question',
        }),
      ).toBe('engaged');
    });
  });

  describe('isScopeClarificationTurn', () => {
    it('uses classifier turn_kind when provided', () => {
      expect(
        isScopeClarificationTurn({
          candidateTurnKind: 'scope_clarification',
          aiDisposition: 'engaged',
        }),
      ).toBe(true);
    });
  });

  describe('countScopeClarificationTurns', () => {
    it('counts scope asks in local turns and latest answer', () => {
      expect(
        countScopeClarificationTurns({
          localTurns: [
            { role: 'ai', content: 'Уточните детали?' },
            { role: 'candidate', content: 'Что именно?' },
          ],
          latestCandidateAnswer: 'Что вы имеете в виду?',
          candidateTurnKind: 'scope_clarification',
          candidateDispositionFromAi: 'asked_for_scope',
          isTargetedFollowUp: true,
        }),
      ).toBe(2);
    });

    it('respects max clarification budget constant', () => {
      expect(MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION).toBe(2);
    });
  });

  describe('buildClarificationTemplateFallback', () => {
    it('uses bank probe phrases instead of vague mustConcepts list', () => {
      const question = buildClarificationTemplateFallback({
        checkpointTitle: 'Stack vs Fiber',
        missingMustConcepts: ['call stack', 'стек'],
        hints: FIBER_EVALUATION_HINTS.stack_vs_fiber,
        candidateTurnKind: 'scope_clarification',
      });

      expect(question).toMatch(/Имею в виду/i);
      expect(question).toMatch(/stack reconciler|Fiber/i);
      expect(question).not.toMatch(/call stack, стек/i);
    });

    it('uses format branch only from classifier turn_kind', () => {
      const question = buildClarificationTemplateFallback({
        checkpointTitle: 'Fiber definition',
        missingMustConcepts: ['scheduler', 'MessageChannel'],
        hints: FIBER_EVALUATION_HINTS.scheduling,
        candidateTurnKind: 'format_clarification',
      });

      expect(question).toMatch(/^Кратко и по существу/i);
      expect(question).not.toMatch(/в целом всё так/i);
    });
  });
});
