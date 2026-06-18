import {
  legacyClassifyTopicOpenerResponse,
  legacyIsCandidateAskingForScope,
  legacyIsCandidateDecliningKnowledge,
  legacyIsFullQuestionDecline,
  legacyIsScopedTopicDecline,
  legacyIsTargetedTopicRefusal,
} from './legacy-intent-regex.util';

describe('legacy-intent-regex.util', () => {
  describe('legacyIsCandidateAskingForScope', () => {
    it('detects Russian scope-clarification questions', () => {
      expect(legacyIsCandidateAskingForScope('Что именно вам интересно?')).toBe(
        true,
      );
      expect(legacyIsCandidateAskingForScope('Что вы имеете в виду?')).toBe(
        true,
      );
      expect(
        legacyIsCandidateAskingForScope('Вы про useEffect или useState?'),
      ).toBe(true);
    });

    it('does not treat decline as scope ask', () => {
      expect(legacyIsCandidateAskingForScope('Не знаю')).toBe(false);
      expect(legacyIsCandidateAskingForScope('Давайте дальше')).toBe(false);
    });
  });

  describe('legacyIsCandidateDecliningKnowledge', () => {
    it('detects Russian decline phrases', () => {
      expect(
        legacyIsCandidateDecliningKnowledge('Я ничего не знаю по useEffect'),
      ).toBe(true);
      expect(legacyIsCandidateDecliningKnowledge('Без понятия')).toBe(true);
    });

    it('does not treat scoped decline as whole-question refusal', () => {
      expect(
        legacyIsScopedTopicDecline('На это я вряд ли смогу ответить'),
      ).toBe(true);
      expect(
        legacyIsFullQuestionDecline('На это я вряд ли смогу ответить'),
      ).toBe(false);
    });
  });

  describe('legacyIsTargetedTopicRefusal', () => {
    it('detects honest lanes refusal', () => {
      expect(
        legacyIsTargetedTopicRefusal(
          'Честно, с lanes и приоритетами не разбирался — startTransition только названия слышал.',
        ),
      ).toBe(true);
    });
  });

  describe('legacyClassifyTopicOpenerResponse', () => {
    it('classifies opener readiness for shadow logging', () => {
      expect(
        legacyClassifyTopicOpenerResponse('Да, работал с этим в проектах'),
      ).toBe('ready');
      expect(
        legacyClassifyTopicOpenerResponse('Только слышал, не сталкивался'),
      ).toBe('uncertain');
      expect(legacyClassifyTopicOpenerResponse('Не знаю эту тему')).toBe(
        'declined',
      );
    });
  });
});
