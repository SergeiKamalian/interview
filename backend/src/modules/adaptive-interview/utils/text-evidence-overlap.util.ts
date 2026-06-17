const STOP_WORDS = new Set([
  'and',
  'are',
  'the',
  'this',
  'that',
  'with',
  'from',
  'into',
  'about',
  'как',
  'что',
  'это',
  'для',
  'при',
  'или',
  'если',
  'тоже',
  'ещё',
  'еще',
  'все',
  'всё',
  'можно',
  'нужно',
  'просто',
  'только',
]);

export function normalizeEvidenceText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function significantEvidenceTokens(
  text: string,
  minLength = 4,
): string[] {
  return normalizeEvidenceText(text)
    .split(' ')
    .filter((token) => token.length >= minLength && !STOP_WORDS.has(token));
}

export function textContainsPhrase(
  candidateText: string,
  phrase: string,
): boolean {
  const candidateNorm = normalizeEvidenceText(candidateText);
  if (!candidateNorm) {
    return false;
  }

  for (const variant of conceptVariants(phrase)) {
    const phraseNorm = normalizeEvidenceText(variant);
    if (!phraseNorm) {
      continue;
    }

    if (phraseNorm.length >= 8) {
      if (candidateNorm.includes(phraseNorm)) {
        return true;
      }
      continue;
    }

    const phraseTokens = significantEvidenceTokens(variant, 3);
    if (phraseTokens.length === 0) {
      continue;
    }

    if (phraseTokens.every((token) => candidateNorm.includes(token))) {
      return true;
    }
  }

  return false;
}

function conceptVariants(concept: string): string[] {
  const variants = new Set<string>([concept]);
  const spaced = concept.replace(/([a-z])([A-Z])/g, '$1 $2');
  variants.add(spaced);
  variants.add(spaced.replace(/_/g, ' '));
  return [...variants];
}

export function overlapsReferenceExamples(
  candidateText: string,
  examples: string[],
): boolean {
  if (!candidateText.trim() || examples.length === 0) {
    return false;
  }

  const candidateNorm = normalizeEvidenceText(candidateText);
  const candidateTokens = significantEvidenceTokens(candidateText, 3);

  return examples.some((example) => {
    const exampleNorm = normalizeEvidenceText(example);
    if (!exampleNorm) {
      return false;
    }

    if (exampleNorm.length >= 40) {
      const probeLength = Math.min(80, exampleNorm.length);
      const probe = exampleNorm.slice(0, probeLength);
      if (candidateNorm.includes(probe)) {
        return true;
      }
    }

    const exampleTokens = significantEvidenceTokens(example, 4);
    if (exampleTokens.length >= 3) {
      for (let size = 4; size >= 3; size -= 1) {
        for (let index = 0; index <= exampleTokens.length - size; index += 1) {
          const phrase = exampleTokens.slice(index, index + size).join(' ');
          if (phrase.length >= 12 && candidateNorm.includes(phrase)) {
            return true;
          }
        }
      }
    }

    if (exampleTokens.length < 5) {
      return false;
    }

    const candidateTokenSet = new Set(candidateTokens);
    const overlapCount = exampleTokens.filter((token) =>
      candidateTokenSet.has(token),
    ).length;
    const overlapRatio = overlapCount / exampleTokens.length;

    return overlapRatio >= 0.45 && overlapCount >= 4;
  });
}

export function countMatchedConcepts(
  candidateText: string,
  concepts: string[],
): number {
  if (!candidateText.trim() || concepts.length === 0) {
    return 0;
  }

  return concepts.filter((concept) => textContainsPhrase(candidateText, concept))
    .length;
}
