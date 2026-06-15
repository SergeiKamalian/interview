const MAIN_QUESTION_TRANSITIONS = [
  'Спасибо, понял вас. Давайте перейдём к следующему вопросу.',
  'Хорошо, спасибо за ответ. Следующий вопрос:',
  'Ок, услышал. Двигаемся дальше.',
  'Понятно, спасибо. Следующая тема:',
  'Отлично, спасибо. Продолжим интервью — следующий вопрос:',
] as const;

/** Brief intro before the next main question after closing the previous one. */
export function buildNextMainQuestionMessage(
  nextQuestionText: string,
  seed: number,
): string {
  const intro =
    MAIN_QUESTION_TRANSITIONS[
      Math.abs(seed) % MAIN_QUESTION_TRANSITIONS.length
    ]!;

  return `${intro}\n\n${nextQuestionText.trim()}`;
}
