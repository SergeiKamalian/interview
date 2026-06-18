import type { TopicOpenerReadiness } from '../types/candidate-turn-classifier.types';

/**
 * Deprecated intent regex — shadow divergence logging and emergency fallback only.
 * Policy path must use CandidateTurnClassifier `turn_kind`, not these patterns.
 * Enable via `CLASSIFIER_REGEX_EMERGENCY_FALLBACK=true` when AI classifier is unavailable.
 */

const SCOPE_ASK_PATTERNS: RegExp[] = [
  /что\s+именно/i,
  /что\s+конкретно/i,
  /что\s+вы\s+имеете\s+в\s+виду/i,
  /что\s+имеете\s+в\s+виду/i,
  /имеете\s+в\s+виду/i,
  /имеется\s+в\s+виду/i,
  /можете\s+конкретн/i,
  /уточните\s+(?:вопрос|что|какой)/i,
  /о\s+ч[её]м\s+именно/i,
  /к\s+чему\s+(?:вопрос|именно)/i,
  /какой\s+именно/i,
  /вы\s+про\s+.+\s+(?:или|ли)\s/i,
  /вы\s+имеете\s+в\s+виду/i,
  /вы\s+имели\s+в\s+виду/i,
  /вы\s+говорите\s+(?:о|про)/i,
  /речь\s+(?:идёт\s+)?(?:о|про)/i,
  /это\s+(?:имеется\s+в\s+виду\s+)?(?:про|о)\s+/i,
  /правильно\s+(?:я\s+)?(?:понимаю|понял)/i,
  /верно\s*,?\s*что\s+вы/i,
  /could\s+you\s+clarify/i,
  /what\s+do\s+you\s+mean/i,
  /which\s+one\s+do\s+you\s+mean/i,
  /are\s+you\s+asking\s+about/i,
  /you\s+mean\s+/i,
  /(?:коротко|кратко|сжато|по делу|подробн|детал|на пальцах)/i,
  /(?:brief|detailed|high[- ]level)/i,
  /(?:как|how)\s+(?:именно\s+)?(?:ответить|answer)/i,
  /вам\s+нужно\s+(?:чтобы\s+)?(?:я\s+)?(?:ответил|рассказал)/i,
];

const DECLINE_PATTERNS: RegExp[] = [
  /ничего\s+не\s+знаю/i,
  /не\s+знаю/i,
  /не\s+очень\s+(хорошо\s+)?понимаю/i,
  /не\s+понимаю/i,
  /плохо\s+понимаю/i,
  /слабо\s+понимаю/i,
  /не\s+разбираюсь/i,
  /плохо\s+разбираюсь/i,
  /без\s+понятия/i,
  /не\s+в\s+курсе/i,
  /затрудняюсь\s+ответить/i,
  /не\s+могу\s+ответить/i,
  /не\s+уверен(?:а)?(?:\s*,?\s*что\s+понимаю)?/i,
  /\bdon'?t\s+know\b/i,
  /\bdo\s+not\s+know\b/i,
  /\bno\s+idea\b/i,
  /\bi\s+don'?t\s+know\s+anything\b/i,
  /\bi\s+don'?t\s+really\s+understand\b/i,
  /\bnot\s+sure\s+i\s+understand\b/i,
];

const TARGETED_TOPIC_REFUSAL_PATTERNS: RegExp[] = [
  /давайте\s+дальше/i,
  /лучше\s+не\s+трогать/i,
  /эту\s+часть\s+лучше/i,
  /не\s+скажу/i,
  /честно.{0,60}(?:lanes|приоритет|concurrent)/i,
  /(?:не\s+разбирался|не\s+знаю|не\s+понимаю).{0,40}(?:lanes|приоритет|concurrent|transition|deferred)/i,
  /только\s+названия\s+слышал/i,
  /не\s+разбирался/i,
];

const SCOPED_DECLINE_PATTERNS: RegExp[] = [
  /на\s+эт[оаеу]/i,
  /вряд\s+ли\s+(?:смогу|ответ)/i,
  /не\s+смогу\s+ответить/i,
  /(?:не\s+)?могу\s+ответить\s+на\s+это/i,
  /именно\s+эт[оа]/i,
  /про\s+эт[оа]\s+(?:я\s+)?(?:не|вряд)/i,
];

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

export function legacyIsCandidateAskingForScope(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized) {
    return false;
  }

  if (
    legacyIsCandidateDecliningKnowledge(normalized) ||
    legacyIsTargetedTopicRefusal(normalized)
  ) {
    return false;
  }

  return SCOPE_ASK_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function legacyIsAnswerFormatClarification(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized || !/\?\s*$/.test(normalized)) {
    return false;
  }

  return (
    /(?:коротко|кратко|сжато|по делу|подробн|детал|на пальцах)/i.test(
      normalized,
    ) ||
    /(?:brief|detailed|high[- ]level)/i.test(normalized) ||
    /(?:как|how)\s+(?:именно\s+)?(?:ответить|answer)/i.test(normalized) ||
    /вам\s+нужно\s+(?:чтобы\s+)?(?:я\s+)?(?:ответил|рассказал)/i.test(
      normalized,
    )
  );
}

export function legacyIsCandidateDecliningKnowledge(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized) {
    return false;
  }

  return DECLINE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function legacyIsScopedTopicDecline(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized) {
    return false;
  }

  return SCOPED_DECLINE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function legacyIsTargetedTopicRefusal(answer: string): boolean {
  const normalized = answer.trim();
  if (!normalized) {
    return false;
  }

  return TARGETED_TOPIC_REFUSAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function legacyIsFullQuestionDecline(answer: string): boolean {
  if (legacyIsScopedTopicDecline(answer)) {
    return false;
  }

  return legacyIsCandidateDecliningKnowledge(answer);
}

export function legacyClassifyTopicOpenerResponse(
  answer: string,
): TopicOpenerReadiness {
  const normalized = answer.trim();
  if (!normalized) {
    return 'uncertain';
  }

  if (legacyIsFullQuestionDecline(normalized)) {
    return 'declined';
  }

  if (
    legacyIsCandidateDecliningKnowledge(normalized) ||
    UNCERTAIN_PATTERNS.some((pattern) => pattern.test(normalized))
  ) {
    return 'uncertain';
  }

  if (READY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return 'ready';
  }

  return 'ready';
}
