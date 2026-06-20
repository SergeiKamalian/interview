import {
  buildPerTurnCheckpointEvaluationSystemPrompt,
  buildPerTurnCheckpointEvaluationUserPrompt,
  PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION,
} from './per-turn-checkpoint-evaluation.prompt';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { fiberCheckpoint } from '../utils/fiber-evaluation-hints.fixture';

describe('per-turn checkpoint evaluation prompt', () => {
  it('requires cumulative scoring and probe-or-accept rules in system prompt', () => {
    const prompt = buildPerTurnCheckpointEvaluationSystemPrompt();

    expect(PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION).toBe('2.10.0');
    expect(prompt).toContain('cumulative evidence');
    expect(prompt).toContain('Probe-or-accept');
    expect(prompt).toContain('probe=pending');
    expect(prompt).toContain('asked_for_scope');
    expect(prompt).toContain('NOT keyword matching');
    expect(prompt).not.toContain('LATEST answer has highest weight');
    expect(prompt).toContain('Per-checkpoint mental checklist');
    expect(prompt).toContain('Coverage vs accuracy');
  });

  it('includes interview policy block when probe is required', () => {
    const userPrompt = buildPerTurnCheckpointEvaluationUserPrompt({
      interviewQuestionId: 1,
      interviewId: 1,
      attemptId: 77,
      companyId: 1,
      questionText: 'Fiber question',
      referenceAnswer: 'Fiber',
      maxScore: 8,
      checkpoints: [
        fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 }),
      ],
      badAnswerExamples: [],
      latestCandidateAnswer:
        'Планирование Fiber — React не делает весь рендер одним блоком.',
      latestCandidateMessageId: 1,
      checkpointStates: [
        {
          checkpointKey: 'scheduling',
          status: 'partial',
          scoreAwarded: 0.25,
          maxScore: 2.5,
          followUpCount: 0,
          rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
        },
      ],
      evidenceSnippets: [],
      localTurns: [],
      followUpLimits: {
        maxPerQuestion: 3,
        maxPerCheckpoint: 1,
        usedForQuestion: 0,
      },
    } satisfies AdaptiveInterviewContextPacket);

    expect(userPrompt).toContain('Interview policy (this turn)');
    expect(userPrompt).toContain('Probe status: open');
    expect(userPrompt).toContain('probe=pending');
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
      followUpLimits: {
        maxPerQuestion: 3,
        maxPerCheckpoint: 1,
        usedForQuestion: 1,
      },
    } satisfies AdaptiveInterviewContextPacket);

    expect(userPrompt).toContain('Follow-up target checkpoint');
    expect(userPrompt).toContain('fiber_pointers');
  });

  it('includes disposition decision block on follow-up answers', () => {
    const userPrompt = buildPerTurnCheckpointEvaluationUserPrompt({
      interviewQuestionId: 1,
      interviewId: 1,
      attemptId: 1,
      companyId: 1,
      questionText: 'Fiber question',
      referenceAnswer: 'Fiber',
      maxScore: 8,
      checkpoints: [
        fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 }),
      ],
      badAnswerExamples: [],
      latestCandidateAnswer: 'То есть речь про планировщик внутри Fiber?',
      latestCandidateMessageId: 2,
      latestAnswerMessageKind: 'follow_up_answer',
      targetCheckpointKey: 'scheduling',
      checkpointStates: [],
      evidenceSnippets: [],
      localTurns: [
        {
          role: 'ai',
          content: 'Как работает scheduler, MessageChannel и postMessage?',
        },
        {
          role: 'candidate',
          content: 'То есть речь про планировщик внутри Fiber?',
        },
      ],
      followUpLimits: {
        maxPerQuestion: 3,
        maxPerCheckpoint: 1,
        usedForQuestion: 1,
      },
    } satisfies AdaptiveInterviewContextPacket);

    expect(userPrompt).toContain('Disposition check');
    expect(userPrompt).toContain('Last interviewer follow-up:');
    expect(userPrompt).toContain('candidate_disposition=asked_for_scope');
  });
});
