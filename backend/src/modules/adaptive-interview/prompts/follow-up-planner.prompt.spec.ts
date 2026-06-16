import {
  buildFollowUpPlannerStreamingSystemPrompt,
  buildFollowUpPlannerSystemPrompt,
  buildFollowUpPlannerUserPrompt,
} from './follow-up-planner.prompt';

describe('follow-up-planner.prompt v2', () => {
  const input = {
    questionText: 'Для чего нужны generics в TypeScript?',
    targetCheckpointKey: 'type_parameter',
    checkpointTitle: 'Понимает параметр типа',
    checkpointExpected:
      'Кандидат объясняет, что generic добавляет параметр типа для функции.',
    latestCandidateAnswer: 'Я не очень понимаю что это и для чего',
    previousFollowUpQuestions: [
      'Можете подробнее рассказать про «Понимает параметр типа»?',
    ],
  };

  it('instructs human interviewer behavior and forbids rubric labels', () => {
    const systemPrompt = buildFollowUpPlannerSystemPrompt();

    expect(systemPrompt).toContain('human technical interviewer');
    expect(systemPrompt).toContain('MANDATORY');
    expect(systemPrompt).toContain('first person «я»');
    expect(systemPrompt).toContain('NEVER use third person');
    expect(systemPrompt).toContain('NEVER start every follow-up with «Понял, спасибо»');
    expect(systemPrompt).toContain('NEVER use robotic templates');
  });

  it('passes candidate answer and uses sanitized topic hint', () => {
    const userPrompt = buildFollowUpPlannerUserPrompt(input);

    expect(userPrompt).toContain(input.latestCandidateAnswer);
    expect(userPrompt).toContain(input.questionText);
    expect(userPrompt).not.toContain('Checkpoint title:');
    expect(userPrompt).toContain('generic добавляет параметр типа');
  });

  it('streaming prompt returns plain text instruction', () => {
    const streamingPrompt = buildFollowUpPlannerStreamingSystemPrompt();

    expect(streamingPrompt).toContain('plain text only');
  });
});
