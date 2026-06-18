import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import { matchesCheckpointFalseClaims } from './bad-answer-signature.util';
import { countMatchedConcepts, textContainsPhrase } from './text-evidence-overlap.util';
import { getLegacyContradictionScoreCap } from './legacy-contradiction-cap.util';

/** True when cumulative text for this checkpoint mentions its mustConcepts or concept groups. */
export function hasDirectCheckpointEvidence(
  hints: CheckpointEvaluationHints | null | undefined,
  checkpointEvidenceText: string,
): boolean {
  const text = checkpointEvidenceText.trim();
  if (!text) {
    return false;
  }

  const mustConcepts = hints?.mustConcepts ?? [];
  if (mustConcepts.length > 0) {
    const minMatched = hints?.minMatchedConcepts ?? 1;
    if (countMatchedConcepts(text, mustConcepts) >= minMatched) {
      return true;
    }
  }

  const groups = hints?.requiredConceptGroups ?? [];
  for (const group of groups) {
    if (group.some((concept) => textContainsPhrase(text, concept))) {
      return true;
    }
  }

  if (mustConcepts.length === 0 && groups.length === 0) {
    return true;
  }

  return false;
}

export function getPositiveEvidenceScoreFloor(
  hints: CheckpointEvaluationHints | null | undefined,
  latestCandidateText: string,
  fullCandidateText: string,
  maxScore: number,
): number | null {
  if (maxScore <= 0) {
    return null;
  }

  const evidenceText = fullCandidateText.trim() || latestCandidateText.trim();
  const groupFloor = getRequiredConceptGroupsScoreFloor(
    hints,
    evidenceText,
    maxScore,
  );

  if (!hints?.mustConcepts?.length) {
    return groupFloor;
  }

  const minMatched = hints.minMatchedConcepts ?? 1;
  const fraction = hints.positiveFloorScore ?? 0.75;
  const candidates = [latestCandidateText, fullCandidateText].filter((text) =>
    text.trim(),
  );

  let best: number | null = groupFloor;
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

export function getRequiredConceptGroupsScoreFloor(
  hints: CheckpointEvaluationHints | null | undefined,
  candidateText: string,
  maxScore: number,
): number | null {
  const groups = hints?.requiredConceptGroups;
  if (!groups?.length || maxScore <= 0 || !candidateText.trim()) {
    return null;
  }

  let matchedGroups = 0;
  for (const group of groups) {
    if (group.some((concept) => textContainsPhrase(candidateText, concept))) {
      matchedGroups += 1;
    }
  }

  if (matchedGroups === 0) {
    return null;
  }

  const coverageRatio = matchedGroups / groups.length;
  const proportional = Number((maxScore * coverageRatio).toFixed(2));
  if (matchedGroups >= groups.length) {
    const fullFraction = hints?.positiveFloorScore ?? 0.85;
    return Number((maxScore * fullFraction).toFixed(2));
  }

  const moderateFraction = Math.max(
    coverageRatio,
    (hints?.positiveFloorScore ?? 0.75) * coverageRatio,
  );
  return Number(
    Math.max(proportional, maxScore * moderateFraction).toFixed(2),
  );
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
