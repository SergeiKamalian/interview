import { buildQuestionSummaryFromCheckpointStates } from './build-question-summary.util';

describe('buildQuestionSummaryFromCheckpointStates', () => {
  it('calculates deterministic score from checkpoint states', () => {
    const summary = buildQuestionSummaryFromCheckpointStates({
      companyId: 1,
      attemptId: 5,
      interviewQuestionId: 10,
      followUpCount: 1,
      checkpoints: [
        {
          id: 1,
          interviewQuestionId: 10,
          checkpointKey: 'dependency_array',
          title: 'Dependency array',
          expected: 'Explains deps',
          score: 2,
          sortOrder: 0,
          createdAt: new Date(),
        },
        {
          id: 2,
          interviewQuestionId: 10,
          checkpointKey: 'cleanup',
          title: 'Cleanup',
          expected: 'Explains cleanup',
          score: 1,
          sortOrder: 1,
          createdAt: new Date(),
        },
      ],
      states: [
        {
          id: 1,
          companyId: 1,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          checkpointKey: 'dependency_array',
          status: 'covered',
          scoreAwarded: 2,
          maxScore: 2,
          confidence: 0.9,
          evidenceSummary: 'Mentioned deps',
          evidenceMessageIds: [22],
          rationale: 'Clear',
          followUpCount: 0,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          companyId: 1,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          checkpointKey: 'cleanup',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1,
          confidence: 0.8,
          evidenceSummary: null,
          evidenceMessageIds: null,
          rationale: 'Not mentioned',
          followUpCount: 1,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    expect(summary.score).toBe(2);
    expect(summary.maxScore).toBe(3);
    expect(summary.strengths).toEqual(['Dependency array']);
    expect(summary.weaknesses).toEqual(['Cleanup']);
    expect(summary.followUpCount).toBe(1);
  });

  it('TASK-17.3: excludes never-asked SECONDARY checkpoints from the denominator (shallow)', () => {
    const baseCheckpoint = (
      key: string,
      title: string,
      score: number,
      sortOrder: number,
      tier: 'advanced' | 'mention',
    ) => ({
      id: sortOrder + 1,
      interviewQuestionId: 10,
      checkpointKey: key,
      title,
      expected: title,
      evaluationHints: { complexityTier: tier },
      score,
      sortOrder,
      createdAt: new Date(),
    });

    const baseState = (
      key: string,
      status: 'covered' | 'partial' | 'missed',
      scoreAwarded: number,
      maxScore: number,
      followUpCount: number,
    ) => ({
      id: 0,
      companyId: 1,
      interviewAttemptId: 5,
      interviewQuestionId: 10,
      checkpointKey: key,
      status,
      scoreAwarded,
      maxScore,
      confidence: 0.9,
      evidenceSummary: null,
      evidenceMessageIds: null,
      rationale: null,
      followUpCount,
      needsManualReview: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const summary = buildQuestionSummaryFromCheckpointStates({
      companyId: 1,
      attemptId: 5,
      interviewQuestionId: 10,
      followUpCount: 0,
      checkpoints: [
        // Must-have, strongly answered (heavy weight → ratio keeps secondaries low).
        baseCheckpoint('definition', 'Definition', 6, 0, 'advanced'),
        // Secondary, never asked, no evidence → should be excluded (ratio 1/8 < 0.2).
        baseCheckpoint('when_to_use', 'When to use', 1, 1, 'mention'),
        baseCheckpoint('ecosystem', 'Ecosystem', 1, 2, 'mention'),
      ],
      states: [
        baseState('definition', 'covered', 6, 6, 0),
        baseState('when_to_use', 'missed', 0, 1, 0),
        baseState('ecosystem', 'missed', 0, 1, 0),
      ],
    });

    // Denominator excludes the two never-asked secondary checkpoints → 6/6, not 6/8.
    expect(summary.score).toBe(6);
    expect(summary.maxScore).toBe(6);
    expect(summary.strengths).toEqual(['Definition']);
    expect(summary.weaknesses).toBeNull();
  });

  it('TASK-17.3: keeps the penalty for a SECONDARY checkpoint that WAS probed but missed', () => {
    const summary = buildQuestionSummaryFromCheckpointStates({
      companyId: 1,
      attemptId: 5,
      interviewQuestionId: 10,
      followUpCount: 1,
      checkpoints: [
        {
          id: 1,
          interviewQuestionId: 10,
          checkpointKey: 'definition',
          title: 'Definition',
          expected: 'Definition',
          evaluationHints: { complexityTier: 'advanced' },
          score: 6,
          sortOrder: 0,
          createdAt: new Date(),
        },
        {
          id: 2,
          interviewQuestionId: 10,
          checkpointKey: 'when_to_use',
          title: 'When to use',
          expected: 'When to use',
          evaluationHints: { complexityTier: 'mention' },
          score: 1,
          sortOrder: 1,
          createdAt: new Date(),
        },
      ],
      states: [
        {
          id: 1,
          companyId: 1,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          checkpointKey: 'definition',
          status: 'covered',
          scoreAwarded: 6,
          maxScore: 6,
          confidence: 0.9,
          evidenceSummary: null,
          evidenceMessageIds: null,
          rationale: null,
          followUpCount: 0,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          companyId: 1,
          interviewAttemptId: 5,
          interviewQuestionId: 10,
          checkpointKey: 'when_to_use',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1,
          confidence: 0.9,
          evidenceSummary: null,
          evidenceMessageIds: null,
          rationale: null,
          // Actually probed → stays in denominator (penalized).
          followUpCount: 1,
          needsManualReview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    expect(summary.score).toBe(6);
    expect(summary.maxScore).toBe(7);
    expect(summary.weaknesses).toEqual(['When to use']);
  });

  it('TASK-17.6: attempt 102 Q55 shallow + strong answer is NOT weak from never-asked secondary checkpoints', () => {
    // Mirrors attempt 102 / interview 31 (depth=shallow): the strong senior
    // covered the core/must-have checkpoints, while three low-weight SECONDARY
    // checkpoints were never probed and have no evidence. Pre-17.3 they sat at
    // missed=0 in the full /10 denominator and dragged Q55 to 4.76/10 «weak,
    // 0/7 covered». Post-17.3 they are excluded from the denominator; post-17.4
    // the addressed-coverage summary reports them honestly.
    const checkpoint = (
      key: string,
      title: string,
      score: number,
      sortOrder: number,
      tier: 'core_plus' | 'intermediate' | 'basic',
    ) => ({
      id: sortOrder + 1,
      interviewQuestionId: 55,
      checkpointKey: key,
      title,
      expected: title,
      evaluationHints: { complexityTier: tier },
      score,
      sortOrder,
      createdAt: new Date(),
    });

    const state = (
      key: string,
      status: 'covered' | 'partial' | 'missed',
      scoreAwarded: number,
      maxScore: number,
      followUpCount: number,
    ) => ({
      id: 0,
      companyId: 1,
      interviewAttemptId: 102,
      interviewQuestionId: 55,
      checkpointKey: key,
      status,
      scoreAwarded,
      maxScore,
      confidence: 0.9,
      evidenceSummary: null,
      evidenceMessageIds: null,
      rationale: null,
      followUpCount,
      needsManualReview: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const summary = buildQuestionSummaryFromCheckpointStates({
      companyId: 1,
      attemptId: 102,
      interviewQuestionId: 55,
      followUpCount: 0,
      checkpoints: [
        checkpoint(
          'virtualization_definition',
          'Определение виртуализации',
          1.5,
          0,
          'core_plus',
        ),
        checkpoint(
          'performance_vs_full_render',
          'Производительность vs full render',
          2.0,
          1,
          'intermediate',
        ),
        checkpoint(
          'dom_pool_mechanism',
          'Механизм пула DOM',
          1.5,
          2,
          'core_plus',
        ),
        checkpoint('when_to_use', 'Когда применять', 1.0, 3, 'basic'),
        checkpoint('common_mistakes', 'Частые ошибки', 2.0, 4, 'intermediate'),
        checkpoint('libraries_ecosystem', 'Библиотеки', 1.0, 5, 'basic'),
        checkpoint('followup_concepts', 'Смежные концепции', 1.0, 6, 'basic'),
      ],
      states: [
        state('virtualization_definition', 'covered', 1.5, 1.5, 0),
        state('performance_vs_full_render', 'covered', 2.0, 2.0, 0),
        state('dom_pool_mechanism', 'covered', 1.3, 1.5, 0),
        state('common_mistakes', 'covered', 2.0, 2.0, 0),
        // Never asked at shallow depth, no evidence → excluded (no penalty).
        state('when_to_use', 'missed', 0, 1.0, 0),
        state('libraries_ecosystem', 'missed', 0, 1.0, 0),
        state('followup_concepts', 'missed', 0, 1.0, 0),
      ],
    });

    // Denominator = the 4 addressed checkpoints (6.8/7.0 ≈ 0.97), NOT 6.8/10.
    expect(summary.score).toBe(6.8);
    expect(summary.maxScore).toBe(7);
    expect(summary.score / summary.maxScore).toBeGreaterThanOrEqual(0.8);
    expect(summary.strengths).toEqual([
      'Определение виртуализации',
      'Производительность vs full render',
      'Механизм пула DOM',
      'Частые ошибки',
    ]);
    expect(summary.weaknesses).toBeNull();
    expect(summary.summary).toContain('4/4 checkpoints addressed');
  });
});
