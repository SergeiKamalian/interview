import {
  parseDepthFromRationale,
  type CheckpointDepthLevel,
} from './checkpoint-depth.util';

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
    return {
      checkpointKey: checkpoint.checkpointKey,
      checkpointTitle: checkpoint.checkpointTitle,
      summary: extractFalseClaimSummary(rationale, checkpoint.checkpointTitle),
      candidateQuote: checkpoint.evidenceSummary,
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
    /requestidlecallback/i,
    /virtual\s+dom.{0,40}(?:fiber|хран)/i,
    /score capped/i,
    /semantic guard capped/i,
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
  if (
    depth === 'false_claim' &&
    /requestidlecallback|virtual\s+dom|redux/i.test(rationale)
  ) {
    return 'high';
  }

  if (depth === 'false_claim') {
    return 'medium';
  }

  return 'low';
}
