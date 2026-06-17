import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';
import {
  buildInterviewPolicyTurnBlock,
  formatInterviewPolicyTurnBlock,
} from './build-interview-policy-turn-block.util';

describe('buildInterviewPolicyTurnBlock', () => {
  it('includes probe policy block when scheduling needs probe', () => {
    const context: AdaptiveInterviewContextPacket = {
      interviewQuestionId: 7,
      interviewId: 4,
      attemptId: 77,
      companyId: 1,
      questionText: 'Как работает React Fiber?',
      referenceAnswer: 'Fiber',
      maxScore: 8,
      checkpoints: [
        fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 }),
      ],
      badAnswerExamples: [],
      latestCandidateAnswer:
        'Планирование Fiber — React не делает весь рендер одним блоком. Разбивает на части, ввод — высокий приоритет.',
      latestCandidateMessageId: 1,
      checkpointStates: [
        {
          checkpointKey: 'scheduling',
          status: 'partial',
          scoreAwarded: 0.25,
          maxScore: 2.5,
          followUpCount: 0,
          rationale:
            'depth=partial_knowledge coverage=medium accuracy=partial нет scheduler',
        },
      ],
      evidenceSnippets: [],
      localTurns: [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content:
            'Планирование Fiber — React не делает весь рендер одним блоком. Разбивает на части, ввод — высокий приоритет.',
        },
      ],
      followUpLimits: {
        maxPerQuestion: 3,
        maxPerCheckpoint: 1,
        usedForQuestion: 0,
      },
    };

    const block = formatInterviewPolicyTurnBlock(
      buildInterviewPolicyTurnBlock(context),
    );

    expect(block).toContain('Interview policy (this turn)');
    expect(block).toContain('scheduling');
    expect(block).toContain('Probe status: open');
    expect(block).toContain('probe=pending');
    expect(block).toContain('MessageChannel');
  });
});
