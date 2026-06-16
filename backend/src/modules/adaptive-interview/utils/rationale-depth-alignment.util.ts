export function alignRationaleDepthWithScore(
  rationale: string | null | undefined,
  scoreAwarded: number,
  maxScore: number,
): string {
  const base = (rationale ?? '').trim();
  if (!base || maxScore <= 0) {
    return base;
  }

  if (/depth\s*=\s*false_claim/i.test(base) || /accuracy\s*=\s*wrong/i.test(base)) {
    return base;
  }

  const ratio = scoreAwarded / maxScore;
  if (ratio < 0.55) {
    return base;
  }

  const depth =
    ratio >= 1 ? 'knows' : ratio >= 0.75 ? 'understands' : 'partial_knowledge';
  const accuracy =
    ratio >= 1 ? 'full' : ratio >= 0.75 ? 'partial' : 'partial';

  let aligned = base
    .replace(/depth\s*=\s*[\w_]+/gi, `depth=${depth}`)
    .replace(/accuracy\s*=\s*[\w_]+/gi, `accuracy=${accuracy}`);

  if (!/depth\s*=/i.test(aligned)) {
    aligned = `depth=${depth}, accuracy=${accuracy}: ${aligned}`;
  } else if (!/accuracy\s*=/i.test(aligned)) {
    aligned = aligned.replace(
      /depth\s*=\s*[\w_]+/i,
      `depth=${depth}, accuracy=${accuracy}`,
    );
  }

  return aligned
    .replace(/\s*depth=false_claim[^.]*\.?/gi, '')
    .replace(/\s*Score capped:[^.]*\.?/gi, '')
    .replace(/\s*Semantic guard capped[^.]*\.?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
