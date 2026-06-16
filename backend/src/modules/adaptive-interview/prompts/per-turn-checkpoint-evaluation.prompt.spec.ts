import {
  buildPerTurnCheckpointEvaluationSystemPrompt,
  buildPerTurnCheckpointEvaluationUserPrompt,
  PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION,
} from './per-turn-checkpoint-evaluation.prompt';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';

describe('per-turn checkpoint evaluation prompt', () => {
  it('requires coverage vs accuracy checklist and depth taxonomy', () => {
    const prompt = buildPerTurnCheckpointEvaluationSystemPrompt();

    expect(PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION).toBe('2.5.3');
    expect(prompt).toContain('LATEST answer has highest weight');
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

  it('includes follow-up target checkpoint in user prompt', () => {
    const userPrompt = buildPerTurnCheckpointEvaluationUserPrompt({
      interviewQuestionId: 1,
      interviewId: 1,
      attemptId: 1,
      companyId: 1,
      questionText: 'Fiber question',
      referenceAnswer: 'Fiber',
      maxScore: 8,
      checkpoints: [
        {
          checkpointKey: 'fiber_pointers',
          title: 'Pointers',
          expected: 'child sibling return',
          score: 1,
          sortOrder: 0,
        },
      ],
      badAnswerExamples: [],
      latestCandidateAnswer: 'child sibling return',
      latestCandidateMessageId: 1,
      latestAnswerMessageKind: 'follow_up_answer',
      targetCheckpointKey: 'fiber_pointers',
      checkpointStates: [],
      evidenceSnippets: [],
      localTurns: [],
      followUpLimits: { maxPerQuestion: 3, maxPerCheckpoint: 1, usedForQuestion: 1 },
    } satisfies AdaptiveInterviewContextPacket);

    expect(userPrompt).toContain('Follow-up target checkpoint');
    expect(userPrompt).toContain('fiber_pointers');
  });
});
