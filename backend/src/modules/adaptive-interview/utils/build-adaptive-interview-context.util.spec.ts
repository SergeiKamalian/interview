import {
  buildAdaptiveInterviewContextPacket,
  boundText,
} from './build-adaptive-interview-context.util';

const limits = {
  localTurnLimit: 3,
  maxFollowUpsPerQuestion: 3,
  maxFollowUpsPerCheckpoint: 1,
  maxTextLength: 500,
  maxReferenceAnswerLength: 600,
};

const baseInput = {
  interviewQuestionId: 10,
  interviewId: 1,
  attemptId: 5,
  companyId: 7,
  questionText: 'What is useEffect?',
  shortAnswer: 'Hook for side effects.',
  idealAnswer: 'A longer ideal answer about useEffect side effects.',
  maxScore: 5,
  checkpoints: [
    {
      checkpointKey: 'side_effects',
      title: 'Side effects',
      expected: 'Mentions side effects',
      score: 1,
      sortOrder: 0,
    },
  ],
  checkpointStates: [
    {
      checkpointKey: 'side_effects',
      status: 'partial',
      scoreAwarded: 0.5,
      maxScore: 1,
      followUpCount: 0,
      evidenceSummary: 'Mentioned effects briefly.',
    },
  ],
  limits,
};

describe('buildAdaptiveInterviewContextPacket', () => {
  it('does not include messages from another interview question', () => {
    const packet = buildAdaptiveInterviewContextPacket({
      ...baseInput,
      questionMessages: [
        {
          id: 1,
          role: 'ai',
          content: 'Question 1',
          sequenceOrder: 1,
          interviewQuestionId: 10,
        },
        {
          id: 2,
          role: 'candidate',
          content: 'Answer for question 1',
          sequenceOrder: 2,
          interviewQuestionId: 10,
        },
        {
          id: 3,
          role: 'ai',
          content: 'Question 2',
          sequenceOrder: 3,
          interviewQuestionId: 20,
        },
        {
          id: 4,
          role: 'candidate',
          content: 'Answer for question 2',
          sequenceOrder: 4,
          interviewQuestionId: 20,
        },
      ],
    });

    expect(packet.localTurns).toHaveLength(2);
    expect(packet.localTurns.every((turn) => turn.content !== 'Question 2')).toBe(
      true,
    );
    expect(packet.latestCandidateAnswer).toBe('Answer for question 1');
    expect(packet.latestCandidateMessageId).toBe(2);
  });

  it('includes checkpoint states, evidence snippets, and follow-up limits', () => {
    const packet = buildAdaptiveInterviewContextPacket({
      ...baseInput,
      questionMessages: [
        {
          id: 2,
          role: 'candidate',
          content: 'Latest answer',
          sequenceOrder: 2,
          interviewQuestionId: 10,
        },
      ],
      checkpointStates: [
        {
          checkpointKey: 'side_effects',
          status: 'partial',
          scoreAwarded: 0.5,
          maxScore: 1,
          followUpCount: 1,
          evidenceSummary: 'Mentioned effects briefly.',
        },
      ],
    });

    expect(packet.checkpointStates).toEqual([
      {
        checkpointKey: 'side_effects',
        status: 'partial',
        scoreAwarded: 0.5,
        maxScore: 1,
        followUpCount: 1,
      },
    ]);
    expect(packet.evidenceSnippets).toEqual([
      {
        checkpointKey: 'side_effects',
        summary: 'Mentioned effects briefly.',
      },
    ]);
    expect(packet.followUpLimits).toEqual({
      maxPerQuestion: 3,
      maxPerCheckpoint: 1,
      usedForQuestion: 1,
    });
    expect(packet.referenceAnswer).toBe('Hook for side effects.');
  });

  it('bounds long candidate answers and keeps only latest local turns', () => {
    const longAnswer = 'a'.repeat(700);
    const messages = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      role: (index % 2 === 0 ? 'ai' : 'candidate') as 'ai' | 'candidate',
      content: `turn-${index}`,
      sequenceOrder: index + 1,
      interviewQuestionId: 10,
    }));

    messages[7] = {
      id: 8,
      role: 'candidate',
      content: longAnswer,
      sequenceOrder: 8,
      interviewQuestionId: 10,
    };

    const packet = buildAdaptiveInterviewContextPacket({
      ...baseInput,
      questionMessages: messages,
    });

    expect(packet.latestCandidateAnswer.length).toBeLessThanOrEqual(500);
    expect(packet.latestCandidateAnswer.endsWith('…')).toBe(true);
    expect(packet.localTurns).toHaveLength(6);
    expect(packet.localTurns[0]?.sequenceOrder).toBe(3);
  });
});

describe('boundText', () => {
  it('truncates text longer than max length', () => {
    expect(boundText('x'.repeat(10), 5)).toBe('xxxx…');
  });
});
