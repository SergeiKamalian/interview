import {
  buildClarificationFollowUpQuestion,
  countScopeClarificationTurns,
  isCandidateAskingForScope,
  isVagueFollowUpQuestion,
  MAX_SCOPE_CLARIFICATION_TURNS_PER_QUESTION,
  resolveScopeClarificationDisposition,
} from './candidate-clarification.util';
import { FIBER_EVALUATION_HINTS } from './fiber-evaluation-hints.fixture';

describe('candidate-clarification.util', () => {
  describe('isCandidateAskingForScope', () => {
    it('detects Russian scope-clarification questions', () => {
      expect(isCandidateAskingForScope('Что именно вам интересно?')).toBe(true);
      expect(isCandidateAskingForScope('Что вы имеете в виду?')).toBe(true);
      expect(isCandidateAskingForScope('Вы про useEffect или useState?')).toBe(
        true,
      );
    });

    it('detects confirmation-style scope questions', () => {
      expect(
        isCandidateAskingForScope(
          'Вы говорите о этапах и методах react fiber да?',
        ),
      ).toBe(true);
      expect(isCandidateAskingForScope('Речь про scheduler, да?')).toBe(true);
    });

    it('does not treat decline as scope ask', () => {
      expect(isCandidateAskingForScope('Не знаю')).toBe(false);
      expect(isCandidateAskingForScope('Давайте дальше')).toBe(false);
    });
  });

  describe('isVagueFollowUpQuestion', () => {
    it('detects generic vague follow-ups', () => {
      expect(
        isVagueFollowUpQuestion('Можете уточнить технические детали?'),
      ).toBe(true);
      expect(isVagueFollowUpQuestion('Расскажите про scheduler?')).toBe(false);
    });
  });

  describe('resolveScopeClarificationDisposition', () => {
    it('overrides misunderstood_question on targeted meta question', () => {
      expect(
        resolveScopeClarificationDisposition({
          answer: 'Вы говорите про render и commit phase, да?',
          aiDisposition: 'misunderstood_question',
          isTargetedFollowUp: true,
        }),
      ).toBe('asked_for_scope');
    });

    it('trusts AI asked_for_scope even without regex match', () => {
      expect(
        resolveScopeClarificationDisposition({
          answer: 'То есть речь про планировщик внутри Fiber?',
          aiDisposition: 'asked_for_scope',
          isTargetedFollowUp: true,
        }),
      ).toBe('asked_for_scope');
    });

    it('uses regex fallback when AI missed on targeted follow-up', () => {
      expect(
        resolveScopeClarificationDisposition({
          answer: 'Что именно?',
          aiDisposition: 'engaged',
          isTargetedFollowUp: true,
        }),
      ).toBe('asked_for_scope');
    });

    it('does not override AI engaged when answer is substantive', () => {
      expect(
        resolveScopeClarificationDisposition({
          answer:
            'Scheduler через MessageChannel проверяет shouldYield каждые 5ms.',
          aiDisposition: 'engaged',
          isTargetedFollowUp: true,
        }),
      ).toBe('engaged');
    });

    it('overrides to asked_for_scope on targeted follow-up', () => {
      expect(
        resolveScopeClarificationDisposition({
          answer: 'Что именно?',
          aiDisposition: 'engaged',
          isTargetedFollowUp: true,
        }),
      ).toBe('asked_for_scope');
    });

    it('keeps AI disposition on main answer', () => {
      expect(
        resolveScopeClarificationDisposition({
          answer: 'Что именно?',
          aiDisposition: 'engaged',
          isTargetedFollowUp: false,
        }),
      ).toBe('engaged');
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
      });

      expect(question).toMatch(/^Да, именно про/i);
      expect(question).toMatch(/MessageChannel|shouldYield/i);
      expect(question.length).toBeLessThan(120);
    });

    it('detects answer-format meta questions on follow-up context', () => {
      expect(
        resolveScopeClarificationDisposition({
          answer:
            'А вам нужно чтобы я ответил коротко и по делу или по деталям?',
          aiDisposition: 'engaged',
          isTargetedFollowUp: false,
          isFollowUpContext: true,
        }),
      ).toBe('asked_for_scope');
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
