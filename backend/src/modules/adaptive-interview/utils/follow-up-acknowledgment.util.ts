const FOLLOW_UP_ACKNOWLEDGMENTS = [
  'Хорошо.',
  'Ок.',
  'Ясно.',
  'Принял.',
  'Спасибо.',
  'Давайте уточним.',
  'Интересно.',
  'Понял.',
  'Хорошо, давайте копнём глубже.',
  'Ок, один момент.',
] as const;

const FOLLOW_UP_QUESTION_STEMS = [
  'Можете подробнее рассказать —',
  'Расскажите подробнее —',
  'Можете объяснить —',
  'Уточните, пожалуйста —',
  'Можете раскрыть —',
] as const;

function normalizeAcknowledgment(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function extractLeadingAcknowledgment(followUpQuestion: string): string | null {
  const trimmed = followUpQuestion.trim();
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  if (!match?.[1]) {
    return null;
  }

  const lead = match[1].trim();
  if (lead.length > 48) {
    return null;
  }

  return normalizeAcknowledgment(lead);
}

export function pickFollowUpAcknowledgment(
  seed: number,
  previousFollowUpQuestions: string[] = [],
): string {
  const used = new Set(
    previousFollowUpQuestions
      .map(extractLeadingAcknowledgment)
      .filter((item): item is string => item != null),
  );

  const withoutPonyalSpasibo = FOLLOW_UP_ACKNOWLEDGMENTS.filter(
    (item) => normalizeAcknowledgment(item) !== 'понял, спасибо',
  );

  const pool = withoutPonyalSpasibo.filter(
    (item) => !used.has(normalizeAcknowledgment(item)),
  );

  const candidates = pool.length > 0 ? pool : withoutPonyalSpasibo;

  return candidates[Math.abs(seed) % candidates.length]!;
}

export function pickFollowUpQuestionStem(seed: number): string {
  return FOLLOW_UP_QUESTION_STEMS[
    Math.abs(seed) % FOLLOW_UP_QUESTION_STEMS.length
  ]!;
}
