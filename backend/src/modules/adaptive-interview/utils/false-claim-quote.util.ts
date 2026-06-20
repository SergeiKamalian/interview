import { textContainsPhrase } from './text-evidence-overlap.util';

export function extractFalseClaimQuote(
  text: string | null | undefined,
): string | null {
  if (!text?.trim()) {
    return null;
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const candidate =
    sentences.find((sentence) => sentence.length >= 24) ?? sentences[0] ?? text;

  return candidate.length > 160 ? `${candidate.slice(0, 160)}…` : candidate;
}

export function extractMatchedFalseClaimQuote(
  text: string | null | undefined,
  falseClaims: string[] | undefined,
): string | null {
  if (!text?.trim() || !falseClaims?.length) {
    return null;
  }

  const matchedClaim = falseClaims.find((claim) =>
    textContainsPhrase(text, claim),
  );
  if (!matchedClaim) {
    return extractFalseClaimQuote(text);
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const sentenceWithClaim =
    sentences.find((sentence) => textContainsPhrase(sentence, matchedClaim)) ??
    sentences.find((sentence) => sentence.length >= 24) ??
    text;

  return sentenceWithClaim.length > 160
    ? `${sentenceWithClaim.slice(0, 160)}…`
    : sentenceWithClaim;
}

/**
 * TASK-17.5: like {@link extractMatchedFalseClaimQuote} but WITHOUT the
 * first-sentence fallback. Returns the candidate sentence that literally
 * contains a configured false claim, or `null` when none matches. Use this when
 * the quote must be real evidence (e.g. overwriting evidence_summary), so a
 * correct answer is never "quoted" with an irrelevant first sentence.
 */
export function extractMatchedFalseClaimQuoteStrict(
  text: string | null | undefined,
  falseClaims: string[] | undefined,
): string | null {
  if (!text?.trim() || !falseClaims?.length) {
    return null;
  }

  const matchedClaim = falseClaims.find((claim) =>
    textContainsPhrase(text, claim),
  );
  if (!matchedClaim) {
    return null;
  }

  const sentenceWithClaim =
    text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .find((sentence) => textContainsPhrase(sentence, matchedClaim)) ?? text;

  return sentenceWithClaim.length > 160
    ? `${sentenceWithClaim.slice(0, 160)}…`
    : sentenceWithClaim;
}

export function hasFalseClaimSignalInLatestAnswer(
  text: string | null | undefined,
): boolean {
  return Boolean(extractFalseClaimQuote(text));
}
