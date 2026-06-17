import {
  normalizeFollowUpQuestionForCandidate,
  sanitizeCheckpointExpectedForCandidateSpeech,
  stripCandidateAnswerEchoFromFollowUp,
} from './checkpoint-expected-speech.util';

describe('checkpoint-expected-speech.util', () => {
  it('strips "Кандидат объясняет, что …" prefix', () => {
    expect(
      sanitizeCheckpointExpectedForCandidateSpeech(
        'Кандидат объясняет, что generic добавляет параметр типа.',
      ),
    ).toBe('generic добавляет параметр типа');
  });

  it('strips "Кандидат объясняет роль …" without "что"', () => {
    expect(
      sanitizeCheckpointExpectedForCandidateSpeech(
        'Кандидат объясняет роль массива зависимостей.',
      ),
    ).toBe('роль массива зависимостей');
  });

  it('removes third-person rubric from follow-up question', () => {
    expect(
      normalizeFollowUpQuestionForCandidate(
        'Понял, спасибо — про «Ну он для сайд эффектов» услышал. Можете своими словами дополнить: Кандидат объясняет роль массива зависимостей?',
      ),
    ).toBe(
      'Понял, спасибо. Можете своими словами дополнить: роль массива зависимостей?',
    );
  });

  it('strips rubric checkpoint title from shallow-accept probe template', () => {
    expect(
      normalizeFollowUpQuestionForCandidate(
        'Вы верно описали общую идею про Понимает планирование Fiber. Уточните, пожалуйста: scheduler, планирован?',
      ),
    ).toBe(
      'Вы верно описали общую идею. Уточните, пожалуйста: scheduler, планирован?',
    );
  });

  it('strips quoted recap of candidate answer', () => {
    expect(
      stripCandidateAnswerEchoFromFollowUp(
        'Понял, спасибо — про «Юзефект это хук в реакте для выполнения таких функционалов как запрос к апи, изм…» услышал. Можете своими словами дополнить: роль массива зависимостей?',
      ),
    ).toBe(
      'Понял, спасибо. Можете своими словами дополнить: роль массива зависимостей?',
    );
  });
});
