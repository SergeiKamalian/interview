import {
  parseDepthFromRationale,
  type CheckpointDepthLevel,
} from './checkpoint-depth.util';
import { extractFalseClaimQuote } from './false-claim-quote.util';

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

  if (depth === 'false_claim' || hasFalseClaimSignal(rationale)) {
    const quote =
      extractFalseClaimQuote(checkpoint.evidenceSummary, checkpoint.checkpointKey) ??
      (depth === 'false_claim' ? checkpoint.evidenceSummary : null);

    return {
      checkpointKey: checkpoint.checkpointKey,
      checkpointTitle: checkpoint.checkpointTitle,
      summary: extractFalseClaimSummary(rationale, checkpoint.checkpointTitle),
      candidateQuote: quote,
      severity: resolveSeverity(depth, rationale),
    };
  }

  return null;
}

function hasFalseClaimSignal(rationale: string): boolean {
  return [
    /depth\s*=\s*false_claim/i,
    /material false claim/i,
    /уверенн.{0,20}(?:ошиб|неверн)/i,
    /overlaps bad answer example/i,
    /Score capped:.*(?:contradict|overlap|material)/i,
  ].some((pattern) => pattern.test(rationale));
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
  if (depth === 'false_claim') {
    return 'medium';
  }

  return 'low';
}
