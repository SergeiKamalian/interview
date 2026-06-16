import {
  isCandidateDecliningKnowledge,
  isFullQuestionDecline,
} from './candidate-decline.util';

export type TopicOpenerReadiness = 'ready' | 'uncertain' | 'declined';

const UNCERTAIN_PATTERNS: RegExp[] = [
  /не\s+сталкивал/i,
  /не\s+работал/i,
  /не\s+использовал/i,
  /только\s+слышал/i,
  /только\s+теори/i,
  /в\s+общих\s+чертах/i,
  /поверхностно/i,
  /слабо/i,
  /немного\s+знаю/i,
  /мало\s+знаю/i,
  /базово/i,
  /чуть[- ]?чуть/i,
  /маловато/i,
  /не\s+очень/i,
  /может\s+быть\s+смогу/i,
  /попробую/i,
  /(мало|немного|чуть).{0,24}(работал|знаю|понимаю|сталкивал)/i,
];

const READY_PATTERNS: RegExp[] = [
  /\bда\b/i,
  /знаком/i,
  /использовал/i,
  /применял/i,
  /разбираюсь/i,
  /понимаю/i,
  /сталкивал/i,
  /на\s+практике/i,
  /в\s+проектах/i,
  /работал/i,
];

const REVEAL_FALLBACKS: Record<TopicOpenerReadiness, readonly string[]> = {
  ready: [
    'Отлично. Тогда расскажите своими словами — с чего бы вы начали?',
    'Хорошо. Как вы это понимаете — попробуйте объяснить?',
  ],
  uncertain: [
    'Ок, давайте попробуем. С чего бы вы начали объяснение?',
    'Хорошо, без проблем — попробуйте на том уровне, на котором вам комфортно.',
  ],
  declined: [
    'Понял. Попробуйте в общих чертах — или просто скажите, если не знаете.',
    'Ок, ничего страшного. Если получится — расскажите, если нет — так и скажите.',
  ],
};

/** Classify readiness from the topic-opener answer (fallback when LLM unavailable). */
export function classifyTopicOpenerResponse(answer: string): TopicOpenerReadiness {
  const normalized = answer.trim();
  if (!normalized) {
    return 'uncertain';
  }

  if (isFullQuestionDecline(normalized)) {
    return 'declined';
  }

  if (
    isCandidateDecliningKnowledge(normalized) ||
    UNCERTAIN_PATTERNS.some((pattern) => pattern.test(normalized))
  ) {
    return 'uncertain';
  }

  if (READY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return 'ready';
  }

  return 'ready';
}

export function buildMainQuestionRevealFallback(input: {
  openerAnswer: string;
  seed: number;
}): string {
  const readiness = classifyTopicOpenerResponse(input.openerAnswer);
  const templates = REVEAL_FALLBACKS[readiness];

  return templates[Math.abs(input.seed) % templates.length]!;
}

const TOPIC_OPENER_FALLBACKS_FIRST = [
  (topic: string) =>
    `Давайте поговорим про ${topic}. Вы с этим уже сталкивались на практике?`,
  (topic: string) =>
    `Начнём с темы ${topic}. Насколько она вам знакома?`,
  (topic: string) =>
    `Хочу затронуть ${topic}. Что вам здесь уже знакомо?`,
] as const;

const TOPIC_OPENER_FALLBACKS_NEXT = [
  (topic: string) =>
    `Перейдём к теме ${topic}. Вы с этим уже работали?`,
  (topic: string) =>
    `Следующая тема — ${topic}. Расскажите кратко, насколько она вам близка.`,
  (topic: string) =>
    `Давайте поговорим про ${topic}. Сталкивались на практике?`,
] as const;

/** Short topic label from bank question — first sentence or trimmed text. */
export function extractTopicLabel(questionText: string): string {
  const trimmed = questionText.trim();
  const firstSentence = trimmed.split(/[.?!]/)[0]?.trim();
  if (firstSentence && firstSentence.length <= 120) {
    return firstSentence;
  }

  return trimmed.length > 100 ? `${trimmed.slice(0, 97)}…` : trimmed;
}

export function buildTopicOpenerFallback(input: {
  questionText: string;
  isFirstQuestion: boolean;
  seed: number;
}): string {
  const topic = extractTopicLabel(input.questionText);
  const templates = input.isFirstQuestion
    ? TOPIC_OPENER_FALLBACKS_FIRST
    : TOPIC_OPENER_FALLBACKS_NEXT;
  const template = templates[Math.abs(input.seed) % templates.length]!;

  return template(topic);
}
