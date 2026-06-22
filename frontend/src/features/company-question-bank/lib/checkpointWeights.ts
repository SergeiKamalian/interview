export const CHECKPOINT_WEIGHT_TARGET = 10;
export const CHECKPOINT_WEIGHT_TOLERANCE = 0.01;

export function sumCheckpointWeights(
  checkpoints: ReadonlyArray<{ score: number }>,
): number {
  return checkpoints.reduce((sum, checkpoint) => sum + checkpoint.score, 0);
}

export function isCheckpointWeightValid(total: number): boolean {
  return (
    Math.abs(total - CHECKPOINT_WEIGHT_TARGET) <= CHECKPOINT_WEIGHT_TOLERANCE
  );
}

export function formatCheckpointWeightTotal(total: number): string {
  return total.toFixed(2);
}
