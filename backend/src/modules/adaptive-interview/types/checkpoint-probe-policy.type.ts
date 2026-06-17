import type { CheckpointComplexityTier } from './checkpoint-evaluation-hints.type';

export type CheckpointProbeStatus =
  | 'open'
  | 'provisional'
  | 'probed'
  | 'closed';

export type CheckpointProbePolicy = {
  /** When true, advanced+ checkpoints require a depth probe before final partial/missed. */
  requireProbeBeforeFinalPartial?: boolean;
  /** Max fraction of max_score for shallow accept without deep probe (default tier-based). */
  shallowAcceptMaxFraction?: number;
  /** Min fraction of max_score after shallow accept while probe pending (default 0.55). */
  minScoreAfterShallowAccept?: number;
  /** When false, skip residual narrowing follow-up after partial compound answer. Default true. */
  allowResidualGapProbe?: boolean;
};

/** Extra follow-up slot on a checkpoint when residual gap probe is required. */
export const RESIDUAL_GAP_PROBE_EXTRA_BUDGET = 1;

export const DEFAULT_MIN_SCORE_AFTER_SHALLOW_ACCEPT = 0.55;

export const TIER_SHALLOW_ACCEPT_FRACTION: Record<
  CheckpointComplexityTier,
  number
> = {
  mention: 0.3,
  basic: 0.55,
  core_plus: 0.6,
  intermediate: 0.5,
  advanced: DEFAULT_MIN_SCORE_AFTER_SHALLOW_ACCEPT,
  expert: DEFAULT_MIN_SCORE_AFTER_SHALLOW_ACCEPT,
};
