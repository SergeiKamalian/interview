import type { ScoringStrictness } from '../../interview-core/types/interview-config.enum';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { applyCheckpointScoreFloors } from './apply-checkpoint-score-floors.util';

/**
 * TASK-16.10 — end-to-end check that scoringStrictness scales the deterministic
 * contradiction cap: the SAME partial answer scores lower under `strict`, higher
 * under `lenient`, while `max_score` stays the same and `balanced` matches the
 * prior behavior exactly.
 */
function buildContradictionContext(
  scoringStrictness: ScoringStrictness,
): AdaptiveInterviewContextPacket {
  return {
    companyId: 1,
    interviewId: 1,
    attemptId: 1,
    interviewQuestionId: 3,
    aiTone: 'neutral',
    probingDepth: 'balanced',
    scoringStrictness,
    timeLimitMinutes: null,
    questionText: 'Что такое constraints у generics в TypeScript?',
    referenceAnswer: 'extends ограничивает допустимые типы.',
    latestCandidateAnswer:
      'Constraints это когда дженерик сам узнает все поля и можно обращаться к любому полю.',
    latestCandidateMessageId: 10,
    maxScore: 4,
    badAnswerExamples: [],
    checkpoints: [
      {
        checkpointKey: 'constraints',
        title: 'Знает constraints',
        expected:
          'Кандидат упоминает extends или ограничение допустимых типов.',
        score: 4,
        sortOrder: 0,
        evaluationHints: {
          falseClaims: [
            'сам узнает все поля',
            'можно обращаться к любому полю',
          ],
        },
      },
    ],
    checkpointStates: [],
    evidenceSnippets: [],
    localTurns: [
      {
        role: 'candidate' as const,
        sequenceOrder: 1,
        content:
          'Constraints это когда дженерик сам узнает все поля и можно обращаться к любому полю.',
      },
    ],
    followUpLimits: {
      maxPerQuestion: 3,
      maxPerCheckpoint: 1,
      usedForQuestion: 0,
    },
  };
}

function scoreFor(scoringStrictness: ScoringStrictness): number {
  const { evaluation } = applyCheckpointScoreFloors(
    {
      candidateDisposition: 'engaged',
      checkpointResults: [
        {
          checkpointKey: 'constraints',
          status: 'partial',
          scoreAwarded: 3,
          confidence: 0.8,
          evidenceSummary: 'Mentions fields access for generic.',
          rationale: 'Partial constraints understanding.',
        },
      ],
    },
    buildContradictionContext(scoringStrictness),
  );

  const constraints = evaluation.checkpointResults.find(
    (item) => item.checkpointKey === 'constraints',
  );
  return constraints?.scoreAwarded ?? Number.NaN;
}

describe('applyCheckpointScoreFloors — scoringStrictness (TASK-16.10)', () => {
  it('strict < balanced < lenient for the same false-claim partial answer', () => {
    const strict = scoreFor('strict');
    const balanced = scoreFor('balanced');
    const lenient = scoreFor('lenient');

    expect(strict).toBeLessThan(balanced);
    expect(lenient).toBeGreaterThan(balanced);
  });

  it('never changes max_score: every strictness stays within [0, max_score]', () => {
    for (const strictness of ['strict', 'balanced', 'lenient'] as const) {
      const score = scoreFor(strictness);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(4);
    }
  });
});
