import { resolveWelcomeMessage } from './interview-welcome.util';

describe('resolveWelcomeMessage', () => {
  it('replaces placeholders in the default template', () => {
    const message = resolveWelcomeMessage({
      template: null,
      interviewerName: 'Аня',
      candidateName: 'Иван Петров',
      jobRole: 'Frontend Developer',
      title: 'React Middle',
      questionCount: 5,
    });

    expect(message).toContain('Иван Петров');
    expect(message).toContain('Аня');
    expect(message).toContain('Frontend Developer');
    expect(message).toContain('Готов начать?');
  });
});
