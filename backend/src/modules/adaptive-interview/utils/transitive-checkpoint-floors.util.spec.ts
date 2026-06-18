import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { applyCheckpointScoreFloors } from './apply-checkpoint-score-floors.util';
import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';
import { applyTransitiveCheckpointFloors } from './transitive-checkpoint-floors.util';

describe('transitive-checkpoint-floors', () => {
  it('raises lanes floor when scheduling is strong and closed', () => {
    const scheduling = fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 });
    const lanes = fiberCheckpoint('lanes_priority', { score: 1.5, sortOrder: 7 });

    expect(scheduling.evaluationHints?.impliesCheckpointFloors?.length).toBeGreaterThan(
      0,
    );

    const outcome = applyTransitiveCheckpointFloors({
      checkpoints: [scheduling, lanes],
      entries: [
        {
          checkpointKey: 'scheduling',
          checkpoint: scheduling,
          guardedResult: {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 2.13,
            rationale:
              'depth=understands coverage=high accuracy=full',
          },
          priorState: {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 2.13,
            maxScore: 2.5,
            followUpCount: 1,
            rationale: 'depth=understands coverage=high accuracy=full',
          },
          checkpointEvidenceText:
            'Scheduler MessageChannel shouldYield yield startTransition',
          latestCandidateText:
            'Scheduler MessageChannel shouldYield yield startTransition',
          questionMaxScore: 8,
        },
        {
          checkpointKey: 'lanes_priority',
          checkpoint: lanes,
          guardedResult: {
            checkpointKey: 'lanes_priority',
            status: 'partial',
            scoreAwarded: 0.25,
            rationale: 'depth=partial_knowledge coverage=low accuracy=partial',
          },
          priorState: {
            checkpointKey: 'lanes_priority',
            status: 'partial',
            scoreAwarded: 0.25,
            maxScore: 1.5,
            followUpCount: 0,
          },
          checkpointEvidenceText: '',
          latestCandidateText: '',
          questionMaxScore: 8,
        },
      ],
    });

    expect(outcome.floorsByKey.get('lanes_priority')).toBe(0.75);
  });

  it('does not raise floors when scheduling source is weak', () => {
    const scheduling = fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 });
    const lanes = fiberCheckpoint('lanes_priority', { score: 1.5, sortOrder: 7 });

    const outcome = applyTransitiveCheckpointFloors({
      checkpoints: [scheduling, lanes],
      entries: [
        {
          checkpointKey: 'scheduling',
          checkpoint: scheduling,
          guardedResult: {
            checkpointKey: 'scheduling',
            status: 'partial',
            scoreAwarded: 0.25,
            rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
          },
          priorState: {
            checkpointKey: 'scheduling',
            status: 'partial',
            scoreAwarded: 0.25,
            maxScore: 2.5,
            followUpCount: 0,
          },
          checkpointEvidenceText: 'приоритеты ввода без lanes concepts',
          latestCandidateText: 'приоритеты ввода без lanes concepts',
          questionMaxScore: 8,
        },
        {
          checkpointKey: 'lanes_priority',
          checkpoint: lanes,
          guardedResult: {
            checkpointKey: 'lanes_priority',
            status: 'partial',
            scoreAwarded: 0.25,
            rationale: 'depth=partial_knowledge coverage=low accuracy=partial',
          },
          priorState: {
            checkpointKey: 'lanes_priority',
            status: 'partial',
            scoreAwarded: 0.25,
            maxScore: 1.5,
            followUpCount: 0,
          },
          checkpointEvidenceText: 'приоритеты ввода без lanes concepts',
          latestCandidateText: 'приоритеты ввода без lanes concepts',
          questionMaxScore: 8,
        },
      ],
    });

    expect(outcome.applications).toHaveLength(0);
  });

  it('does not raise transitive floor when target has coverage none and no direct evidence', () => {
    const scheduling = fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 });
    const lanes = fiberCheckpoint('lanes_priority', { score: 1.5, sortOrder: 7 });

    const outcome = applyTransitiveCheckpointFloors({
      checkpoints: [scheduling, lanes],
      entries: [
        {
          checkpointKey: 'scheduling',
          checkpoint: scheduling,
          guardedResult: {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 2.13,
            rationale:
              'depth=understands coverage=high accuracy=full',
          },
          priorState: {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 2.13,
            maxScore: 2.5,
            followUpCount: 1,
            rationale: 'depth=understands coverage=high accuracy=full',
          },
          checkpointEvidenceText:
            'Scheduler MessageChannel shouldYield yield startTransition',
          latestCandidateText:
            'Scheduler MessageChannel shouldYield yield startTransition приоритет',
          questionMaxScore: 8,
        },
        {
          checkpointKey: 'lanes_priority',
          checkpoint: lanes,
          guardedResult: {
            checkpointKey: 'lanes_priority',
            status: 'missed',
            scoreAwarded: 0,
            rationale: 'depth=none coverage=none accuracy=none',
          },
          priorState: {
            checkpointKey: 'lanes_priority',
            status: 'missed',
            scoreAwarded: 0,
            maxScore: 1.5,
            followUpCount: 0,
          },
          checkpointEvidenceText: '',
          latestCandidateText:
            'Scheduler MessageChannel shouldYield yield startTransition приоритет',
          questionMaxScore: 8,
        },
      ],
    });

    expect(outcome.applications).toHaveLength(0);
    expect(outcome.floorsByKey.get('lanes_priority')).toBeUndefined();
  });

  it('integrates with applyCheckpointScoreFloors for stack_vs_fiber → fiber_definition', () => {
    const context: AdaptiveInterviewContextPacket = {
      interviewQuestionId: 7,
      interviewId: 4,
      attemptId: 20,
      companyId: 1,
      questionText: 'Fiber?',
      referenceAnswer: 'Fiber',
      maxScore: 8,
      checkpoints: [
        fiberCheckpoint('stack_vs_fiber', { score: 1.5, sortOrder: 1 }),
        fiberCheckpoint('fiber_definition', { score: 1.5, sortOrder: 0 }),
      ],
      badAnswerExamples: [],
      latestCandidateAnswer:
        'Call stack синхронно, Fiber связный список yield work loop fiber-узел',
      latestCandidateMessageId: 1,
      checkpointStates: [
        {
          checkpointKey: 'stack_vs_fiber',
          status: 'partial',
          scoreAwarded: 1.2,
          maxScore: 1.5,
          followUpCount: 1,
        },
        {
          checkpointKey: 'fiber_definition',
          status: 'partial',
          scoreAwarded: 0.25,
          maxScore: 1.5,
          followUpCount: 0,
        },
      ],
      evidenceSnippets: [],
      localTurns: [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content:
            'Call stack синхронно, Fiber связный список yield work loop fiber-узел',
        },
      ],
      followUpLimits: {
        maxPerQuestion: 4,
        maxPerCheckpoint: 1,
        usedForQuestion: 0,
      },
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'stack_vs_fiber',
            status: 'covered',
            scoreAwarded: 1.35,
            confidence: 0.9,
            evidenceSummary: 'stack vs fiber',
            rationale: 'depth=understands coverage=high accuracy=full',
          },
          {
            checkpointKey: 'fiber_definition',
            status: 'partial',
            scoreAwarded: 0.25,
            confidence: 0.7,
            evidenceSummary: null,
            rationale: 'depth=partial_knowledge coverage=low accuracy=partial',
          },
        ],
      },
      context,
    );

    const definition = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'fiber_definition',
    );

    expect(definition?.scoreAwarded).toBeGreaterThanOrEqual(0.82);
  });
});
