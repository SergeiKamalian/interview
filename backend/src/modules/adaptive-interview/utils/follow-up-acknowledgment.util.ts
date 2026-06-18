export type FollowUpAnswerTone = 'good' | 'partial' | 'weak';

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

const PROBE_GOOD_ACKNOWLEDGMENTS = [
  'Да, в целом верно.',
  'Хорошо, общая картина ясна.',
  'Да, направление правильное.',
  'Ок, основную идею вы схватили.',
  'Да, это верно в общих чертах.',
  'Хорошо, базово вы понимаете.',
  'Да, да — в целом всё так.',
] as const;

const PROBE_PARTIAL_ACKNOWLEDGMENTS = [
  'Ну, частично верно.',
  'В целом ок, но не всё.',
  'Есть верное, но кое-что упустили.',
  'Неплохо, но давайте докопаемся.',
  'Часть верная, часть нет.',
  'Ок, но есть нюансы.',
] as const;

const PROBE_WEAK_ACKNOWLEDGMENTS = [
  'Ну, не совсем так.',
  'Тут есть неточности.',
  'Не совсем то, что нужно.',
  'Есть путаница в деталях.',
  'Не совсем правильно, если честно.',
] as const;

const RESIDUAL_ACKNOWLEDGMENTS = [
  'Ок, это верно.',
  'Да, эту часть вы описали.',
  'Хорошо, это схвачено.',
  'Да, тут вы правы.',
  'Ок, с этим согласен.',
] as const;

const FOLLOW_UP_QUESTION_STEMS = [
  'Можете подробнее рассказать —',
  'Расскажите подробнее —',
  'Можете объяснить —',
  'Уточните, пожалуйста —',
  'Можете раскрыть —',
] as const;

const PROBE_QUESTION_STEMS = [
  'Уточните, пожалуйста —',
  'Расскажите подробнее —',
  'Можете объяснить —',
  'Как именно работает —',
  'Что скажете про —',
] as const;

const ROBOTIC_OPENER_PATTERNS: RegExp[] = [
  /^хорошо\.?\s*вы верно описали общую идею/i,
  /^ок,?\s*это верно/i,
  /^да,?\s*в целом верно/i,
  /^ну,?\s*не совсем так/i,
  /^не совсем правильно/i,
];

function normalizeAcknowledgment(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function extractLeadingAcknowledgment(followUpQuestion: string): string | null {
  const trimmed = followUpQuestion.trim();

  for (const pattern of ROBOTIC_OPENER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[0]) {
      return normalizeAcknowledgment(match[0]);
    }
  }

  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  if (!match?.[1]) {
    return null;
  }

  const lead = match[1].trim();
  if (lead.length > 64) {
    return null;
  }

  return normalizeAcknowledgment(lead);
}

function collectUsedOpeners(previousFollowUpQuestions: string[]): Set<string> {
  const used = new Set<string>();

  for (const question of previousFollowUpQuestions) {
    const opener = extractLeadingAcknowledgment(question);
    if (opener) {
      used.add(opener);
    }
  }

  return used;
}

function pickFromPool<T extends string>(
  pool: readonly T[],
  seed: number,
  used: Set<string>,
): T {
  const available = pool.filter(
    (item) => !used.has(normalizeAcknowledgment(item)),
  );
  const candidates = available.length > 0 ? available : [...pool];
  return candidates[Math.abs(seed) % candidates.length];
}

export function inferFollowUpAnswerTone(input: {
  scoreAwarded?: number;
  maxScore?: number;
  rationale?: string | null;
}): FollowUpAnswerTone {
  const rationale = input.rationale ?? '';
  const ratio =
    input.maxScore && input.maxScore > 0
      ? (input.scoreAwarded ?? 0) / input.maxScore
      : 0;

  if (
    /depth=(?:false_claim|heard_of)/i.test(rationale) ||
    /accuracy=wrong/i.test(rationale)
  ) {
    return 'weak';
  }

  if (ratio >= 0.35 || /depth=(?:understands|knows)/i.test(rationale)) {
    return 'good';
  }

  if (ratio >= 0.12 || /depth=partial_knowledge/i.test(rationale)) {
    return 'partial';
  }

  return 'weak';
}

export function pickFollowUpAcknowledgment(
  seed: number,
  previousFollowUpQuestions: string[] = [],
): string {
  const used = collectUsedOpeners(previousFollowUpQuestions);

  const withoutPonyalSpasibo = FOLLOW_UP_ACKNOWLEDGMENTS.filter(
    (item) => normalizeAcknowledgment(item) !== 'понял, спасибо',
  );

  return pickFromPool(withoutPonyalSpasibo, seed, used);
}

export function pickProbeAcknowledgment(
  tone: FollowUpAnswerTone,
  seed: number,
  previousFollowUpQuestions: string[] = [],
): string {
  const used = collectUsedOpeners(previousFollowUpQuestions);
  const pool =
    tone === 'good'
      ? PROBE_GOOD_ACKNOWLEDGMENTS
      : tone === 'partial'
        ? PROBE_PARTIAL_ACKNOWLEDGMENTS
        : PROBE_WEAK_ACKNOWLEDGMENTS;

  return pickFromPool(pool, seed, used);
}

export function pickResidualAcknowledgment(
  seed: number,
  previousFollowUpQuestions: string[] = [],
): string {
  const used = collectUsedOpeners(previousFollowUpQuestions);
  return pickFromPool(RESIDUAL_ACKNOWLEDGMENTS, seed, used);
}

export function pickFollowUpQuestionStem(seed: number): string {
  return FOLLOW_UP_QUESTION_STEMS[
    Math.abs(seed) % FOLLOW_UP_QUESTION_STEMS.length
  ];
}

export function pickProbeQuestionStem(
  seed: number,
  previousFollowUpQuestions: string[] = [],
): string {
  const usedStems = new Set(
    previousFollowUpQuestions
      .map((question) => {
        for (const stem of PROBE_QUESTION_STEMS) {
          if (question.includes(stem)) {
            return normalizeAcknowledgment(stem);
          }
        }
        return null;
      })
      .filter((item): item is string => item != null),
  );

  return pickFromPool(PROBE_QUESTION_STEMS, seed, usedStems);
}
