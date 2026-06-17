import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import { matchesCheckpointFalseClaims } from './bad-answer-signature.util';
import { countMatchedConcepts } from './text-evidence-overlap.util';
import { getLegacyContradictionScoreCap } from './legacy-contradiction-cap.util';

export function getPositiveEvidenceScoreFloor(
  hints: CheckpointEvaluationHints | null | undefined,
  latestCandidateText: string,
  fullCandidateText: string,
  maxScore: number,
): number | null {
  if (!hints?.mustConcepts?.length || maxScore <= 0) {
    return null;
  }

  const minMatched = hints.minMatchedConcepts ?? 1;
  const fraction = hints.positiveFloorScore ?? 0.75;
  const candidates = [latestCandidateText, fullCandidateText].filter((text) =>
    text.trim(),
  );

  let best: number | null = null;
  for (const text of candidates) {
    const matched = countMatchedConcepts(text, hints.mustConcepts);
    if (matched < minMatched) {
      continue;
    }

    const floor = Number((maxScore * fraction).toFixed(2));
    best = best === null ? floor : Math.max(best, floor);
  }

  return best;
}

export function getContradictionScoreCapFromHints(
  hints: CheckpointEvaluationHints | null | undefined,
  candidateText: string,
  maxScore: number,
): number | null {
  if (!hints?.falseClaims?.length || !candidateText.trim()) {
    return null;
  }

  if (!matchesCheckpointFalseClaims(candidateText, hints.falseClaims)) {
    return null;
  }

  const fraction = hints.falseClaimCapFraction ?? 0.5;
  return Number((maxScore * fraction).toFixed(2));
}

export function getContradictionScoreCap(
  checkpoint: {
    checkpointKey: string;
    evaluationHints?: CheckpointEvaluationHints | null;
  },
  candidateText: string,
  maxScore: number,
): number | null {
  const fromHints = getContradictionScoreCapFromHints(
    checkpoint.evaluationHints,
    candidateText,
    maxScore,
  );
  if (fromHints !== null) {
    return fromHints;
  }

  return getLegacyContradictionScoreCap(
    checkpoint.checkpointKey,
    candidateText,
    maxScore,
  );
}
