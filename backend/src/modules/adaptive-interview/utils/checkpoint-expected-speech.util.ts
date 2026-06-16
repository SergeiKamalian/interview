const CANDIDATE_RUBRIC_PREFIX =
  /^кандидат\s+(?:объясняет|говорит|упоминает|описывает|называет|понимает|знает|умеет|использует|демонстрирует|приводит|определяет),?\s*(?:что\s+)?/i;

const CANDIDATE_RUBRIC_INLINE =
  /\bкандидат\s+(?:объясняет|говорит|упоминает|описывает|называет|понимает|знает|умеет|использует|демонстрирует|приводит|определяет),?\s*(?:что\s+)?/gi;

/** Strip internal rubric wording from checkpoint.expected for candidate-facing speech. */
export function sanitizeCheckpointExpectedForCandidateSpeech(
  checkpointExpected: string,
): string {
  let text = checkpointExpected.trim().replace(/\.$/, '');
  text = text.replace(CANDIDATE_RUBRIC_PREFIX, '');
  text = text.replace(/^кандидат\s+/i, '');
  text = text.trim();

  if (!text) {
    return '';
  }

  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Remove third-person rubric fragments from a follow-up shown to the candidate. */
export function normalizeFollowUpQuestionForCandidate(question: string): string {
  let text = question.trim();

  text = text.replace(
    /:\s*кандидат\s+(?:объясняет|говорит|упоминает|описывает|понимает)[^?]*/gi,
    (fragment) => {
      const rubricBody = fragment.replace(/^:\s*/i, '').trim();
      const topic = sanitizeCheckpointExpectedForCandidateSpeech(rubricBody);
      return topic ? `: ${topic}` : '';
    },
  );

  text = text.replace(CANDIDATE_RUBRIC_INLINE, '');
  text = stripCandidateAnswerEchoFromFollowUp(text);
  text = text.replace(/\s{2,}/g, ' ').replace(/\s+\?/g, '?').replace(/\?\?+/g, '?');
  text = text.replace(/\s+([,.!?])/g, '$1').trim();

  return text;
}

/** Drop «про … услышал» / quoted recap of what the candidate just said. */
export function stripCandidateAnswerEchoFromFollowUp(question: string): string {
  let text = question.trim();

  text = text.replace(
    /^(понял,?\s*спасибо)\s*[—-]\s*про\s+[«"'](?:[^»"']|[»"'])*[»"']\s*услышал\.?\s*/i,
    '$1. ',
  );

  text = text.replace(
    /^(?:хорошо|ок|интересно),?\s*про\s+.+?\s*(?:услышал|понял)\.?\s*/i,
    'Хорошо. ',
  );

  text = text.replace(
    /\s*[—-]\s*про\s+[«"'](?:[^»"']|[»"'])*[»"']\s*услышал\.?\s*/gi,
    '. ',
  );

  text = text.replace(/\.\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();

  return text;
}
