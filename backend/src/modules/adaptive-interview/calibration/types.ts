export type GoldenScoreRange = {
  min: number;
  max: number;
};

export type GoldenCheckpointExpectation = {
  checkpoint_key: string;
  status?: string;
  score_awarded?: GoldenScoreRange;
  depth?: string[];
};

/**
 * TASK-17.6: optional self-contained context for non-fiber golden cases. When
 * present the harness builds the AdaptiveInterviewContextPacket straight from
 * this block (real question bank checkpoints + evaluation hints) instead of the
 * hardcoded React Fiber fixture — so we can pin "strong senior" regressions for
 * other questions (e.g. virtualization, closures) using the actual bank data.
 */
export type GoldenCaseCheckpoint = {
  checkpointKey: string;
  score: number;
  sortOrder?: number;
  title?: string;
  expected?: string;
  /** Bank evaluation_hints JSON (already camelCase, matches CheckpointEvaluationHints). */
  evaluationHints?: unknown;
};

export type GoldenCaseCheckpointState = {
  checkpointKey: string;
  status: string;
  scoreAwarded: number;
  maxScore: number;
  followUpCount: number;
  rationale?: string | null;
};

export type GoldenCaseContext = {
  questionText: string;
  maxScore: number;
  referenceAnswer?: string;
  scoringStrictness?: 'strict' | 'balanced' | 'lenient';
  latestAnswerMessageKind?:
    | 'main_answer'
    | 'follow_up_answer'
    | 'topic_opener_answer'
    | null;
  targetCheckpointKey?: string | null;
  badAnswerExamples?: string[];
  checkpoints: GoldenCaseCheckpoint[];
  checkpointStates?: GoldenCaseCheckpointState[];
};

export type GoldenCalibrationCase = {
  id: string;
  questionKey: string;
  description: string;
  turns: Array<{
    role: 'candidate';
    content: string;
    messageKind?:
      | 'main_answer'
      | 'follow_up_answer'
      | 'topic_opener_answer'
      | null;
    targetCheckpointKey?: string | null;
  }>;
  context?: GoldenCaseContext;
  aiResponse: {
    candidate_disposition: string;
    checkpoint_results: Array<{
      checkpoint_key: string;
      status: string;
      score_awarded: number;
      confidence: number;
      evidence_summary: string | null;
      rationale: string;
    }>;
  };
  expected: {
    checkpointResults: GoldenCheckpointExpectation[];
    totalScoreRatio: GoldenScoreRange;
  };
};
