import {
  buildClarificationFollowUpQuestion,
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

  describe('buildClarificationFollowUpQuestion', () => {
    it('names missing mustConcepts instead of staying vague', () => {
      const question = buildClarificationFollowUpQuestion({
        checkpointTitle: 'Scheduling',
        missingMustConcepts: ['MessageChannel', 'shouldYield'],
        hints: FIBER_EVALUATION_HINTS.scheduling,
        candidateScopeQuestion: 'Что именно вам интересно?',
        candidateTurnKind: 'scope_clarification',
      });

      expect(question).toMatch(/MessageChannel|shouldYield/i);
      expect(question).not.toContain('технические детали');
    });

    it('answers format clarification without false positive acknowledgment', () => {
      const previousFollowUp =
        'Расскажите, как вы понимаете работу React Fiber: что именно происходит при обновлении (render/reconciliation) и чем это отличается от commit?';

      const question = buildClarificationFollowUpQuestion({
        checkpointTitle: 'Fiber definition',
        missingMustConcepts: ['scheduler', 'MessageChannel'],
        hints: FIBER_EVALUATION_HINTS.scheduling,
        candidateScopeQuestion:
          'А вам нужно чтобы я ответил коротко и по делу или по деталям?',
        candidateTurnKind: 'format_clarification',
        previousFollowUpQuestion: previousFollowUp,
      });

      expect(question).toMatch(/^Кратко и по существу/i);
      expect(question).toMatch(/render|commit|reconciliation/i);
      expect(question).not.toMatch(/scheduler|MessageChannel/i);
      expect(question).not.toMatch(/в целом всё так/i);
    });

    it('answers confirmation with short да-именно-pro reply', () => {
      const question = buildClarificationFollowUpQuestion({
        checkpointTitle: 'Scheduling',
        missingMustConcepts: ['MessageChannel', 'shouldYield'],
        hints: FIBER_EVALUATION_HINTS.scheduling,
        candidateScopeQuestion:
          'Вы говорите о этапах и методах react fiber да?',
        candidateTurnKind: 'scope_clarification',
      });

      expect(question).toMatch(/^Да, именно про/i);
      expect(question).toMatch(/MessageChannel|shouldYield/i);
      expect(question.length).toBeLessThan(120);
    });

    it('clarifies or-choice scope questions', () => {
      const question = buildClarificationFollowUpQuestion({
        checkpointTitle: 'Scheduling',
        missingMustConcepts: ['MessageChannel'],
        hints: FIBER_EVALUATION_HINTS.scheduling,
        candidateScopeQuestion: 'Вы про useEffect или useState?',
      });

      expect(question).toMatch(/не про useState/i);
    });
  });
});
