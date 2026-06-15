import {
  isCandidateDecliningKnowledge,
  isFullQuestionDecline,
  isScopedTopicDecline,
  shouldSkipFollowUps,
} from './candidate-decline.util';

describe('isCandidateDecliningKnowledge', () => {
  it('detects Russian decline phrases', () => {
    expect(isCandidateDecliningKnowledge('Я ничего не знаю по useEffect')).toBe(
      true,
    );
    expect(
      isCandidateDecliningKnowledge('Не знаю про generics в TypeScript'),
    ).toBe(true);
    expect(isCandidateDecliningKnowledge('Без понятия')).toBe(true);
  });

  it('detects confusion and partial understanding as decline', () => {
    expect(
      isCandidateDecliningKnowledge(
        'Я не очень понимаю что это и для чего',
      ),
    ).toBe(true);
    expect(
      isCandidateDecliningKnowledge('Я же сказал что не очень хорошо понимаю'),
    ).toBe(true);
    expect(isCandidateDecliningKnowledge('Не разбираюсь в generics')).toBe(
      true,
    );
  });

  it('detects English decline phrases', () => {
    expect(isCandidateDecliningKnowledge("I don't know anything about hooks")).toBe(
      true,
    );
    expect(isCandidateDecliningKnowledge('No idea')).toBe(true);
  });

  it('does not treat scoped decline as whole-question refusal', () => {
    expect(
      isScopedTopicDecline('На это я вряд ли смогу ответить'),
    ).toBe(true);
    expect(isFullQuestionDecline('На это я вряд ли смогу ответить')).toBe(
      false,
    );
    expect(
      shouldSkipFollowUps({
        answer: 'На это я вряд ли смогу ответить',
        aiDisposition: 'declined',
        followUpsUsedForQuestion: 3,
      }),
    ).toBe(false);
  });

  it('detects AI negative disposition via shouldSkipFollowUps', () => {
    expect(
      shouldSkipFollowUps({
        answer: 'Ну типа что-то с типами, но я путаюсь',
        aiDisposition: 'confused',
        followUpsUsedForQuestion: 0,
      }),
    ).toBe(false);
    expect(
      shouldSkipFollowUps({
        answer: 'Ну типа что-то с типами, но я путаюсь',
        aiDisposition: 'confused',
        followUpsUsedForQuestion: 1,
      }),
    ).toBe(true);
    expect(
      shouldSkipFollowUps({
        answer: 'Generics помогают переиспользовать код',
        aiDisposition: 'engaged',
      }),
    ).toBe(false);
    expect(
      shouldSkipFollowUps({
        answer: 'Не знаю',
        aiDisposition: 'declined',
        followUpsUsedForQuestion: 0,
      }),
    ).toBe(true);
  });

  it('does not treat substantive answers as decline', () => {
    expect(
      isCandidateDecliningKnowledge(
        'useEffect запускается после рендера и нужен для side effects',
      ),
    ).toBe(false);
  });
});
