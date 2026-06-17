import {
  overlapsReferenceExamples,
  textContainsPhrase,
} from './text-evidence-overlap.util';

const DISTINCTIVE_BAD_ANSWER_PATTERNS: RegExp[] = [
  /fiber.{0,60}(?:просто|это\s+просто).{0,40}virtual\s+dom/i,
  /virtual\s+dom.{0,40}(?:просто|быстрее\s+обновляет)/i,
  /concurrent\s+mode.{0,50}(?:полностью|вообще|всегда).{0,30}(?:убирает|не\s+лаг|без\s+лаг)/i,
  /(?:20\s*000|20000|тысяч).{0,50}(?:без|не\s+нужн|не\s+нужна).{0,30}virtual/i,
  /render\s+phase.{0,30}(?:и|,)?.{0,15}commit\s+phase.{0,40}(?:одно\s+и\s+то\s+же|одинаков|то\s+же\s+самое)/i,
  /(?:сразу|во\s+время\s+reconcil).{0,50}(?:пишет|записывает|меняет).{0,30}dom/i,
  /reconcilechildfibers.{0,40}(?:сразу|одновременно).{0,30}dom/i,
  /обернуть.{0,50}(?:все|кажд|люб).{0,40}setstate.{0,40}starttransition/i,
  /(?:value|значени).{0,30}инпут.{0,40}starttransition/i,
  /flushsync.{0,40}(?:везде|everywhere|для\s+быстр)/i,
];

const SOUND_EVIDENCE_POSITIVE =
  /(?:корректно|верно|правильно|точно|правильн|согласуется|соответствует|без\s+материальн)/i;
const SOUND_EVIDENCE_NEGATIVE =
  /(?:incorrect|wrong|contradict|неверн|ошиб|противореч|неправильн|ложн|false_claim|не\s+соответствует)/i;

export function matchesDistinctiveBadAnswerClaim(text: string): boolean {
  const normalized = text.toLowerCase();
  return DISTINCTIVE_BAD_ANSWER_PATTERNS.some((pattern) =>
    pattern.test(normalized),
  );
}

export function overlapsQuestionBadAnswerExamples(
  candidateText: string,
  badExamples: string[],
): boolean {
  return overlapsReferenceExamples(candidateText, badExamples);
}

export function overlapsQuestionGoodAnswerExamples(
  candidateText: string,
  goodExamples: string[],
): boolean {
  return overlapsReferenceExamples(candidateText, goodExamples);
}

export function matchesCheckpointFalseClaims(
  candidateText: string,
  falseClaims: string[],
): boolean {
  return falseClaims.some((claim) => {
    if (/request\s*idle\s*callback|requestidlecallback/i.test(claim)) {
      if (
        /(?:не|not|instead\s+of|а\s+не)\s+.{0,30}request\s*idle\s*callback/i.test(
          candidateText,
        )
      ) {
        return false;
      }
      return /request\s*idle\s*callback|requestidlecallback/i.test(
        candidateText,
      );
    }

    return textContainsPhrase(candidateText, claim);
  });
}

export function rationaleIndicatesSoundEvidence(
  rationale: string | null | undefined,
): boolean {
  const value = rationale ?? '';
  if (!value.trim()) {
    return false;
  }

  if (/accuracy\s*=\s*full/i.test(value)) {
    return !SOUND_EVIDENCE_NEGATIVE.test(value);
  }

  if (
    /accuracy\s*=\s*partial/i.test(value) &&
    /depth\s*=\s*(?:understands|knows|partial_knowledge)/i.test(value)
  ) {
    return (
      SOUND_EVIDENCE_POSITIVE.test(value) &&
      !SOUND_EVIDENCE_NEGATIVE.test(value)
    );
  }

  return false;
}
