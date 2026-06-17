import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import {
  collectCheckpointEvidenceText,
  stripNeutralMetaphors,
} from './checkpoint-evidence-text.util';

function buildContext(
  localTurns: AdaptiveInterviewContextPacket['localTurns'],
  latestAnswer = '',
): AdaptiveInterviewContextPacket {
  return {
    companyId: 1,
    interviewId: 1,
    attemptId: 1,
    interviewQuestionId: 1,
    questionText: 'Q',
    referenceAnswer: 'A',
    maxScore: 10,
    checkpoints: [],
    badAnswerExamples: [],
    latestCandidateAnswer: latestAnswer,
    latestCandidateMessageId: 1,
    checkpointStates: [],
    evidenceSnippets: [],
    localTurns,
    followUpLimits: {
      maxPerQuestion: 3,
      maxPerCheckpoint: 1,
      usedForQuestion: 0,
    },
  };
}

describe('collectCheckpointEvidenceText', () => {
  it('uses main answer plus targeted follow-up turns for a checkpoint', () => {
    const context = buildContext(
      [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content: 'Main answer about fiber basics',
          messageKind: 'main_answer',
        },
        {
          role: 'candidate',
          sequenceOrder: 2,
          content: 'Stack is sync, Fiber can pause',
          messageKind: 'follow_up_answer',
          targetCheckpointKey: 'stack_vs_fiber',
        },
        {
          role: 'candidate',
          sequenceOrder: 3,
          content: 'Commit phase applies DOM changes',
          messageKind: 'follow_up_answer',
          targetCheckpointKey: 'commit_phase',
        },
      ],
      'Commit phase applies DOM changes',
    );

    expect(collectCheckpointEvidenceText(context, 'stack_vs_fiber')).toContain(
      'main answer about fiber basics',
    );
    expect(collectCheckpointEvidenceText(context, 'stack_vs_fiber')).toContain(
      'fiber can pause',
    );
    expect(collectCheckpointEvidenceText(context, 'stack_vs_fiber')).not.toContain(
      'commit phase applies dom',
    );
  });

  it('excludes follow-up answers scoped to other checkpoints', () => {
    const context = buildContext(
      [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content: 'Commit uses requestIdleCallback incorrectly',
          messageKind: 'follow_up_answer',
          targetCheckpointKey: 'commit_phase',
        },
        {
          role: 'candidate',
          sequenceOrder: 2,
          content: 'Scheduler uses MessageChannel not idle callback',
          messageKind: 'follow_up_answer',
          targetCheckpointKey: 'scheduling',
        },
      ],
      'Scheduler uses MessageChannel not idle callback',
    );

    expect(collectCheckpointEvidenceText(context, 'scheduling')).not.toContain(
      'requestidlecallback',
    );
    expect(collectCheckpointEvidenceText(context, 'scheduling')).toContain(
      'messagechannel',
    );
  });

  it('falls back to all candidate turns when no scoped metadata exists', () => {
    const context = buildContext([
      {
        role: 'candidate',
        sequenceOrder: 1,
        content: 'Only one cumulative answer',
      },
    ]);

    expect(collectCheckpointEvidenceText(context, 'fiber_definition')).toContain(
      'only one cumulative answer',
    );
  });
});

describe('stripNeutralMetaphors', () => {
  it('removes configured neutral metaphors before overlap checks', () => {
    const stripped = stripNeutralMetaphors(
      'Fiber-узел — внутренняя карточка React для компонента',
      ['карточка', 'рабочий узел'],
    );

    expect(stripped.toLowerCase()).not.toContain('карточка');
    expect(stripped.toLowerCase()).toContain('fiber-узел');
  });
});
