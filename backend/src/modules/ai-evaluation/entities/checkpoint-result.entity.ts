export type CheckpointResultEntity = {
  id: number;
  questionEvaluationId: number;
  checkpointKey: string;
  matched: boolean;
  scoreAwarded: number;
  evidenceQuote: string | null;
  createdAt: Date;
};

export type UpsertCheckpointResultData = {
  checkpointKey: string;
  matched: boolean;
  scoreAwarded: number;
  evidenceQuote: string | null;
};
