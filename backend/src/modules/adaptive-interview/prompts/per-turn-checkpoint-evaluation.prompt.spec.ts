import {
  buildPerTurnCheckpointEvaluationSystemPrompt,
  PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION,
} from './per-turn-checkpoint-evaluation.prompt';

describe('per-turn checkpoint evaluation prompt', () => {
  it('requires coverage vs accuracy checklist and depth taxonomy', () => {
    const prompt = buildPerTurnCheckpointEvaluationSystemPrompt();

    expect(PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION).toBe('2.5.0');
    expect(prompt).toContain('Per-checkpoint mental checklist');
    expect(prompt).toContain('Coverage vs accuracy');
    expect(prompt).toContain('depth=mention_only');
    expect(prompt).toContain('depth=false_claim');
    expect(prompt).toContain('Half-right / half-wrong answers');
    expect(prompt).toContain('status MUST be partial');
    expect(prompt).toContain('Evaluate semantic correctness');
    expect(prompt).toContain(
      'Do NOT award credit just because the candidate mentions a relevant term',
    );
    expect(prompt).toContain('Confident false statements MUST cap');
  });
});
