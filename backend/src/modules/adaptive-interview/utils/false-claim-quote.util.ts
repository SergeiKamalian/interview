export function extractFalseClaimQuote(
  text: string | null | undefined,
  _checkpointKey?: string,
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

export function hasFalseClaimSignalInLatestAnswer(
  text: string | null | undefined,
): boolean {
  return Boolean(extractFalseClaimQuote(text));
}
