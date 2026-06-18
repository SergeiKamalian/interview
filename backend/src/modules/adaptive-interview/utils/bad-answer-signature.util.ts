import {
  overlapsReferenceExamples,
  textContainsPhrase,
} from './text-evidence-overlap.util';

const SOUND_EVIDENCE_POSITIVE =
  /(?:корректно|верно|правильно|точно|правильн|согласуется|соответствует|без\s+материальн)/i;
const SOUND_EVIDENCE_NEGATIVE =
  /(?:incorrect|wrong|contradict|неверн|ошиб|противореч|неправильн|ложн|false_claim|не\s+соответствует)/i;

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
