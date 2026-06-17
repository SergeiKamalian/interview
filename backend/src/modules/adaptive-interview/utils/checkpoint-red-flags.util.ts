import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';
import {
  parseDepthFromRationale,
  type CheckpointDepthLevel,
} from './checkpoint-depth.util';
import { matchesCheckpointFalseClaims } from './bad-answer-signature.util';
import { extractMatchedFalseClaimQuote } from './false-claim-quote.util';

export type CheckpointRedFlagSeverity = 'low' | 'medium' | 'high';

export type CheckpointRedFlag = {
  checkpointKey: string;
  checkpointTitle: string;
  summary: string;
  candidateQuote: string | null;
  severity: CheckpointRedFlagSeverity;
};

type RedFlagInput = {
  checkpointKey: string;
  checkpointTitle: string;
  rationale: string | null;
  evidenceSummary: string | null;
  status: string;
  evaluationHints?: CheckpointEvaluationHints | null;
};

export function aggregateCheckpointRedFlags(
  checkpoints: RedFlagInput[],
): CheckpointRedFlag[] {
  return checkpoints
    .map((checkpoint) => buildRedFlag(checkpoint))
    .filter((flag): flag is CheckpointRedFlag => flag !== null);
}

function buildRedFlag(checkpoint: RedFlagInput): CheckpointRedFlag | null {
  const depth = parseDepthFromRationale(checkpoint.rationale);
  const rationale = checkpoint.rationale ?? '';

  if (hasBadExampleSimilarityOnly(rationale)) {
    return null;
  }

  const evidenceText =
    checkpoint.evidenceSummary?.trim() ||
    extractEvidenceFromRationale(rationale) ||
    '';

  const semanticFalseClaim =
    depth === 'false_claim' ||
    (checkpoint.evaluationHints?.falseClaims?.length
      ? matchesCheckpointFalseClaims(
          evidenceText,
          checkpoint.evaluationHints.falseClaims,
        )
      : hasSemanticFalseClaimSignal(rationale));

  if (!semanticFalseClaim) {
    return null;
  }

  if (
    checkpoint.evaluationHints?.falseClaims?.length &&
    evidenceText &&
    !matchesCheckpointFalseClaims(
      evidenceText,
      checkpoint.evaluationHints.falseClaims,
    ) &&
    depth !== 'false_claim'
  ) {
    return null;
  }

  const quote =
    extractMatchedFalseClaimQuote(
      evidenceText,
      checkpoint.evaluationHints?.falseClaims,
    ) ?? (depth === 'false_claim' ? checkpoint.evidenceSummary : null);

  return {
    checkpointKey: checkpoint.checkpointKey,
    checkpointTitle: checkpoint.checkpointTitle,
    summary: extractFalseClaimSummary(rationale, checkpoint.checkpointTitle),
    candidateQuote: quote,
    severity: resolveSeverity(depth, rationale),
  };
}

function hasBadExampleSimilarityOnly(rationale: string): boolean {
  return (
    /similarity\s*=\s*bad_example/i.test(rationale) &&
    !/depth\s*=\s*false_claim/i.test(rationale) &&
    !/accuracy\s*=\s*wrong/i.test(rationale)
  );
}

function hasSemanticFalseClaimSignal(rationale: string): boolean {
  return [
    /depth\s*=\s*false_claim/i,
    /material false claim/i,
    /semantic guard capped/i,
    /Score capped:.*contradict/i,
  ].some((pattern) => pattern.test(rationale));
}

function extractEvidenceFromRationale(rationale: string): string | null {
  const quoted = rationale.match(/[«"]([^»"]{12,})[»"]/);
  return quoted?.[1]?.trim() ?? null;
}

function extractFalseClaimSummary(
  rationale: string,
  checkpointTitle: string,
): string {
  const trimmed = rationale.trim();
  if (trimmed.length > 0 && trimmed.length <= 180) {
    return trimmed;
  }

  return `${checkpointTitle}: обнаружено уверенное неверное утверждение`;
}

function resolveSeverity(
  depth: CheckpointDepthLevel,
  rationale: string,
): CheckpointRedFlagSeverity {
  if (depth === 'false_claim' || /accuracy\s*=\s*wrong/i.test(rationale)) {
    return 'medium';
  }

  return 'low';
}
