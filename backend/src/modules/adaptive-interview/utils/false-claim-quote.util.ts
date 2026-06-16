const FALSE_CLAIM_PATTERNS: Record<string, RegExp[]> = {
  scheduling: [
    /requestidlecallback/i,
  ],
  commit_phase: [
    /commit.{0,60}(?:может|можно)\s+прерыв/i,
    /(?:может|можно)\s+прервать.{0,40}commit/i,
    /requestidlecallback/i,
    /useeffect.{0,40}(?:до|before)\s*paint/i,
    /uselayouteffect.{0,40}(?:после|after)\s*(?:paint|отрис)/i,
    /обычн.{0,20}useeffect.{0,40}синхронно/i,
  ],
  commit_limitation: [
    /commit.{0,60}(?:может|можно)\s+прерв/i,
    /ничего\s+страшного.{0,40}прерв/i,
  ],
  fiber_pointers: [
    /virtual\s+dom.{0,40}(?:fiber|узл|хран)/i,
    /хранит.{0,40}(?:fiber|virtual\s+dom)/i,
  ],
};

function isDenialOfRequestIdleCallback(sentence: string): boolean {
  return /(?:не|not|instead\s+of|а\s+не)\s+.{0,30}request\s*idle\s*callback/i.test(
    sentence,
  );
}

export function extractFalseClaimQuote(
  text: string | null | undefined,
  checkpointKey: string,
): string | null {
  if (!text?.trim()) {
    return null;
  }

  const patterns = FALSE_CLAIM_PATTERNS[checkpointKey];
  if (!patterns?.length) {
    return null;
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    if (isDenialOfRequestIdleCallback(sentence)) {
      continue;
    }

    if (patterns.some((pattern) => pattern.test(sentence))) {
      return sentence.length > 160 ? `${sentence.slice(0, 160)}…` : sentence;
    }
  }

  return null;
}

export function hasFalseClaimSignalInLatestAnswer(
  text: string | null | undefined,
  checkpointKey: string,
): boolean {
  return extractFalseClaimQuote(text, checkpointKey) !== null;
}
