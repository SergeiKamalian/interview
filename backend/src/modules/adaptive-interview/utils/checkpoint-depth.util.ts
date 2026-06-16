export type CheckpointDepthLevel =
  | 'mention_only'
  | 'heard_of'
  | 'partial_knowledge'
  | 'understands'
  | 'knows'
  | 'false_claim'
  | 'none';

export type CoverageLevel = 'none' | 'low' | 'medium' | 'high';
export type AccuracyLevel = 'none' | 'wrong' | 'partial' | 'full';

const DEPTH_PATTERN =
  /depth\s*=\s*(mention_only|heard_of|partial_knowledge|understands|knows|false_claim)/i;

const COVERAGE_PATTERN = /coverage\s*=\s*(none|low|medium|high)/i;
const ACCURACY_PATTERN = /accuracy\s*=\s*(none|wrong|partial|full)/i;

export function parseDepthFromRationale(
  rationale: string | null | undefined,
): CheckpointDepthLevel {
  if (!rationale) {
    return 'none';
  }

  const match = rationale.match(DEPTH_PATTERN);
  if (!match?.[1]) {
    return inferDepthFromRationale(rationale);
  }

  return match[1].toLowerCase() as CheckpointDepthLevel;
}

export function parseCoverageFromRationale(
  rationale: string | null | undefined,
): CoverageLevel {
  if (!rationale) {
    return 'none';
  }

  const match = rationale.match(COVERAGE_PATTERN);
  if (match?.[1]) {
    return match[1].toLowerCase() as CoverageLevel;
  }

  return inferCoverageFromDepth(parseDepthFromRationale(rationale));
}

export function parseAccuracyFromRationale(
  rationale: string | null | undefined,
): AccuracyLevel {
  if (!rationale) {
    return 'none';
  }

  const match = rationale.match(ACCURACY_PATTERN);
  if (match?.[1]) {
    return match[1].toLowerCase() as AccuracyLevel;
  }

  return inferAccuracyFromDepth(parseDepthFromRationale(rationale));
}

export function depthLabelRu(depth: CheckpointDepthLevel): string {
  const labels: Record<CheckpointDepthLevel, string> = {
    mention_only: 'Упомянул',
    heard_of: 'Слышал',
    partial_knowledge: 'Знает поверхностно',
    understands: 'Понимает',
    knows: 'Знает',
    false_claim: 'Ошибается уверенно',
    none: 'Не оценено',
  };

  return labels[depth];
}

function inferDepthFromRationale(rationale: string): CheckpointDepthLevel {
  const text = rationale.toLowerCase();

  if (/false_claim|ложн|неверн|ошиб|противореч|requestidlecallback/i.test(text)) {
    return 'false_claim';
  }

  if (/mention_only|только\s+упомян|keyword|buzzword|без\s+объясн/i.test(text)) {
    return 'mention_only';
  }

  if (/heard_of|слышал|не\s+помн/i.test(text)) {
    return 'heard_of';
  }

  if (/understands|понимает|связн/i.test(text)) {
    return 'understands';
  }

  if (/knows|точн|детал/i.test(text)) {
    return 'knows';
  }

  if (/partial|неполн|поверхност/i.test(text)) {
    return 'partial_knowledge';
  }

  return 'none';
}

function inferCoverageFromDepth(depth: CheckpointDepthLevel): CoverageLevel {
  switch (depth) {
    case 'mention_only':
    case 'heard_of':
      return 'low';
    case 'partial_knowledge':
      return 'medium';
    case 'understands':
    case 'knows':
    case 'false_claim':
      return 'high';
    default:
      return 'none';
  }
}

function inferAccuracyFromDepth(depth: CheckpointDepthLevel): AccuracyLevel {
  switch (depth) {
    case 'false_claim':
      return 'wrong';
    case 'mention_only':
    case 'heard_of':
      return 'none';
    case 'partial_knowledge':
      return 'partial';
    case 'understands':
    case 'knows':
      return 'full';
    default:
      return 'none';
  }
}

export function coveragePercent(level: CoverageLevel): number {
  const map: Record<CoverageLevel, number> = {
    none: 0,
    low: 25,
    medium: 55,
    high: 85,
  };

  return map[level];
}

export function accuracyPercent(level: AccuracyLevel): number {
  const map: Record<AccuracyLevel, number> = {
    none: 0,
    wrong: 15,
    partial: 50,
    full: 100,
  };

  return map[level];
}
