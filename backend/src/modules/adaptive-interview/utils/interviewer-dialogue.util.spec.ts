import { buildNextMainQuestionMessage } from './interviewer-dialogue.util';

describe('buildNextMainQuestionMessage', () => {
  it('prepends a transition before the next main question', () => {
    const message = buildNextMainQuestionMessage(
      'Что такое useEffect в React?',
      1,
    );

    expect(message).toContain('Что такое useEffect в React?');
    expect(message).toMatch(/Спасибо|Хорошо|Понятно|Ок|Отлично/);
    expect(message.indexOf('\n\n')).toBeGreaterThan(0);
  });
});
