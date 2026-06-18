import {
  buildCandidateTurnClassifierSystemPrompt,
  buildCandidateTurnClassifierUserPrompt,
  CANDIDATE_TURN_CLASSIFIER_PROMPT_VERSION,
} from '../prompts/candidate-turn-classifier.prompt';

describe('candidate-turn-classifier.prompt', () => {
  it('uses version 1.2.0', () => {
    expect(CANDIDATE_TURN_CLASSIFIER_PROMPT_VERSION).toBe('1.2.0');
  });

  it('includes speech-act-first rules in system prompt', () => {
    const systemPrompt = buildCandidateTurnClassifierSystemPrompt();

    expect(systemPrompt).toContain('STEP 0');
    expect(systemPrompt).toContain('speech act');
    expect(systemPrompt).toContain('NEVER substantive_answer');
    expect(systemPrompt).toContain('substantive_answer');
    expect(systemPrompt).toContain('scope_clarification');
    expect(systemPrompt).toContain('Не понял о чем вопрос');
    expect(systemPrompt).toContain('format_clarification');
    expect(systemPrompt).toContain('decline_whole');
    expect(systemPrompt).toContain('decline_scoped');
    expect(systemPrompt).toContain('topic_refusal');
    expect(systemPrompt).toContain('confused');
    expect(systemPrompt).toContain('off_topic');
    expect(systemPrompt).toContain('Never use phrase matching');
    expect(systemPrompt).toContain('technical words alone do NOT make substantive_answer');
  });

  it('includes decision checklist and dialogue context in user prompt', () => {
    const userPrompt = buildCandidateTurnClassifierUserPrompt({
      messageKind: 'follow_up_answer',
      mainQuestionText: 'Как работает React Fiber?',
      lastInterviewerMessage: 'Расскажите про scheduler.',
      targetCheckpointTitle: 'scheduling',
      targetCheckpointKey: 'scheduling',
      candidateAnswer: 'Что именно вам интересно?',
      localTurns: [
        { role: 'ai', content: 'Расскажите про scheduler.' },
        { role: 'candidate', content: 'Что именно вам интересно?' },
      ],
    });

    expect(userPrompt).toContain('message_kind: follow_up_answer');
    expect(userPrompt).toContain('Target checkpoint:');
    expect(userPrompt).toContain('scheduling');
    expect(userPrompt).toContain('Decision checklist (strict order)');
    expect(userPrompt).toContain('Speech act');
    expect(userPrompt).toContain('Что именно вам интересно?');
  });
});
