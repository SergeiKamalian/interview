export type CheckpointGuardAdjustmentReason =
  | 'semantic_contradiction_cap'
  | 'rationale_contradiction_cap'
  | 'bad_example_overlap_cap'
  | 'status_score_alignment';

export type CheckpointGuardAdjustment = {
  checkpointKey: string;
  aiStatus: string;
  aiScore: number;
  guardedStatus: string;
  guardedScore: number;
  reason: CheckpointGuardAdjustmentReason;
  promptVersion: string;
};
