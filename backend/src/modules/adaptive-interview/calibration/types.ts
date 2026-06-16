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

export type GoldenCalibrationCase = {
  id: string;
  questionKey: string;
  description: string;
  turns: Array<{ role: 'candidate'; content: string }>;
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
