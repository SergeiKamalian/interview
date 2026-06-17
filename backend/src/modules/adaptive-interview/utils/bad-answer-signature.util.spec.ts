import {
  overlapsQuestionBadAnswerExamples,
  rationaleIndicatesSoundEvidence,
} from './bad-answer-signature.util';

describe('overlapsQuestionBadAnswerExamples', () => {
  const fiberBadExamples = [
    'Fiber — это просто Virtual DOM. React сравнивает деревья и обновляет страницу быстрее.',
    'Concurrent mode полностью убирает лаги. Можно рендерить 20 000 div без virtualization — Fiber всё разобьёт на кадры.',
    'Render phase и commit phase — одно и то же. React сразу пишет в DOM во время reconcileChildFibers.',
  ];

  it('detects overlap with question bank bad examples', () => {
    const candidate =
      'Fiber — это просто Virtual DOM, React сравнивает деревья и обновляет страницу быстрее.';

    expect(
      overlapsQuestionBadAnswerExamples(candidate, fiberBadExamples),
    ).toBe(true);
  });

  it('does not flag a correct paraphrase that does not reuse bad claims', () => {
    const candidate =
      'Раньше reconciler шёл рекурсивно через call stack. Fiber заменил это на связный список fiber-узлов и работу порциями.';

    expect(
      overlapsQuestionBadAnswerExamples(candidate, fiberBadExamples),
    ).toBe(false);
  });

  it('returns false when bad examples are empty', () => {
    expect(overlapsQuestionBadAnswerExamples('anything', [])).toBe(false);
  });
});

describe('rationaleIndicatesSoundEvidence', () => {
  it('accepts accuracy=full without negative wording', () => {
    expect(
      rationaleIndicatesSoundEvidence(
        'depth=knows, coverage=high, accuracy=full: coherent explanation.',
      ),
    ).toBe(true);
  });
});
