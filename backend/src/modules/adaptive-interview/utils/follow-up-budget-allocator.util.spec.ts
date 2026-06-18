import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';
import {
  allocateFollowUpBudget,
  buildBudgetAllocatorCandidate,
  hasPendingRequiredProbe,
  maxFollowUpsForCheckpoint,
} from './follow-up-budget-allocator.util';

const budgetConfig = {
  maxFollowUpsPerQuestion: 2,
  maxFollowUpsHeavyCheckpoint: 2,
  heavyCheckpointWeightRatio: 0.2,
  minPriorityToProbe: 0.15,
};

describe('follow-up-budget-allocator', () => {
  const candidateText =
    'Планирование Fiber — приоритеты ввода. У Fiber child sibling return.';

  function buildCandidate(
    key: 'scheduling' | 'fiber_pointers',
    overrides: {
      score?: number;
      followUpCount?: number;
    } = {},
  ) {
    const checkpoint = fiberCheckpoint(key, {
      score: overrides.score ?? (key === 'scheduling' ? 2.5 : 1),
    });

    return buildBudgetAllocatorCandidate({
      checkpoint,
      state: {
        checkpointKey: key,
        status: 'partial',
        scoreAwarded: key === 'scheduling' ? 1.38 : 0.5,
        maxScore: checkpoint.score,
        followUpCount: overrides.followUpCount ?? 0,
        rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
      },
      questionMaxScore: 8,
      candidateEvidenceText: candidateText,
      latestCandidateText: candidateText,
      config: budgetConfig,
    });
  }

  it('selects scheduling before fiber_pointers when budget=2', () => {
    const allocation = allocateFollowUpBudget({
      candidates: [buildCandidate('fiber_pointers'), buildCandidate('scheduling')],
      followUpsUsedForQuestion: 0,
      config: budgetConfig,
    });

    expect(allocation.canProbe).toBe(true);
    expect(allocation.selectedCheckpointKey).toBe('scheduling');
    expect(allocation.skippedLowPriority).not.toContain('fiber_pointers');
  });

  it('gives heavy checkpoint cap of 2', () => {
    expect(
      maxFollowUpsForCheckpoint({
        checkpoint: fiberCheckpoint('scheduling', { score: 2.5 }),
        hints: fiberCheckpoint('scheduling').evaluationHints,
        questionMaxScore: 8,
        config: budgetConfig,
      }),
    ).toBe(2);
  });

  it('gives mention/basic tier zero follow-ups', () => {
    expect(
      maxFollowUpsForCheckpoint({
        checkpoint: fiberCheckpoint('fiber_definition', { score: 0.5 }),
        hints: fiberCheckpoint('fiber_definition').evaluationHints,
        questionMaxScore: 8,
        config: budgetConfig,
      }),
    ).toBe(0);
  });

  it('returns budget exhausted when question limit reached', () => {
    const allocation = allocateFollowUpBudget({
      candidates: [buildCandidate('scheduling')],
      followUpsUsedForQuestion: 2,
      config: budgetConfig,
    });

    expect(allocation.canProbe).toBe(false);
    expect(allocation.reason).toBe('question_follow_up_limit_reached');
  });

  it('skips low-priority checkpoints below minPriorityToProbe', () => {
    const checkpoint = fiberCheckpoint('fiber_definition', { score: 0.5 });
    const candidate = buildBudgetAllocatorCandidate({
      checkpoint,
      state: {
        checkpointKey: 'fiber_definition',
        status: 'partial',
        scoreAwarded: 0.25,
        maxScore: 0.5,
        followUpCount: 0,
        rationale: 'depth=partial_knowledge coverage=low accuracy=partial',
      },
      questionMaxScore: 8,
      candidateEvidenceText: 'Fiber reconciliation.',
      latestCandidateText: 'Fiber reconciliation.',
      config: budgetConfig,
    });

    const allocation = allocateFollowUpBudget({
      candidates: [candidate],
      followUpsUsedForQuestion: 0,
      config: budgetConfig,
    });

    expect(allocation.canProbe).toBe(false);
    expect(allocation.reason).toBe('low_probe_priority');
    expect(allocation.skippedLowPriority).toEqual(['fiber_definition']);
  });

  it('hasPendingRequiredProbe is true when probeRequired even below minPriority', () => {
    const checkpoint = fiberCheckpoint('stack_vs_fiber', { score: 1.5 });
    const candidate = buildBudgetAllocatorCandidate({
      checkpoint,
      state: {
        checkpointKey: 'stack_vs_fiber',
        status: 'missed',
        scoreAwarded: 0,
        maxScore: 1.5,
        followUpCount: 0,
        rationale: 'depth=none coverage=none accuracy=none',
      },
      questionMaxScore: 8,
      candidateEvidenceText: attempt82MainAnswer,
      latestCandidateText: attempt82MainAnswer,
      config: budgetConfig,
    });

    expect(candidate.isProbeRequired).toBe(true);
    expect(candidate.priorityResult.priority).toBeLessThan(
      budgetConfig.minPriorityToProbe,
    );
    expect(hasPendingRequiredProbe({ candidates: [candidate] })).toBe(true);
  });
});

const attempt82MainAnswer =
  'React Fiber — reconciliation engine с render и commit phase и приоритетами.';
