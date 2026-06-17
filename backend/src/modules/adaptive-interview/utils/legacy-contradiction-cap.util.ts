function partialScoreForMax(maxScore: number): number {
  return Number((maxScore * 0.5).toFixed(2));
}

function hasPositiveRequestIdleCallbackClaim(candidateText: string): boolean {
  if (
    /(?:не|not|instead\s+of|а\s+не)\s+.{0,30}request\s*idle\s*callback/i.test(
      candidateText,
    )
  ) {
    return false;
  }

  return /request\s*idle\s*callback|requestidlecallback/i.test(candidateText);
}

export function getLegacyContradictionScoreCap(
  checkpointKey: string,
  candidateText: string,
  maxScore: number,
): number | null {
  const has = (patterns: RegExp[]) =>
    patterns.some((pattern) => pattern.test(candidateText));

  if (
    checkpointKey === 'type_safety' &&
    has([
      /строк.{0,80}(?:выход|верн).{0,40}числ/i,
      /string.{0,80}(?:return|верн|выход).{0,40}number/i,
      /не\s+связывает\s+вход\s+и\s+выход/i,
      /вернуть\s+уже\s+другой\s+t/i,
      /любой\s+тип\s+результата\s+независимо\s+от\s+вход/i,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'type_parameter' &&
    has([/generic.{0,40}(?:как|вроде)\s+any/i, /почти\s+как\s+any/i])
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'constraints' &&
    has([
      /сам\s+(?:узна[её]т|пойм[её]т)\s+все\s+поля/i,
      /можно\s+обращаться\s+к\s+любому\s+полю/i,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'run_timing' &&
    has([/до\s+рендер/i, /before\s+render/i, /заранее\s+подготовить\s+dom/i])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'dependency_array' &&
    has([
      /зависимост.{0,80}заново\s+отрис/i,
      /эффект\s+запускает\s+(?:этот\s+)?ререндер/i,
      /react\s+понимал\s+когда\s+надо\s+заново\s+отрис/i,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'cleanup' &&
    has([
      /сразу.{0,80}(?:clearinterval|unsubscribe|отпис)/i,
      /react\s+.*сам\s+.*чист/i,
      /cleanup\s+не\s+.*обязательно/i,
      /return\s+cleanup\s+.*не\s+нуж/i,
    ])
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'side_effects' &&
    has([/вместо\s+usestate/i, /нужен.{0,80}перерис/i])
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'scheduling' &&
    hasPositiveRequestIdleCallbackClaim(candidateText)
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'stack_vs_fiber' &&
    has([
      /через\s+promises?/i,
      /полностью\s+асинхронн/i,
      /клики\s+всегда\s+проходят/i,
      /redux/i,
    ])
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'fiber_pointers' &&
    has([
      /\bparent\b.*\bnext\b/i,
      /лежат\s+в\s+redux/i,
      /virtual\s+dom.{0,40}(?:fiber|узл)/i,
      /хранит.{0,40}virtual\s+dom/i,
    ])
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'commit_phase' &&
    has([
      /useeffect.{0,40}commit/i,
      /useeffect.{0,40}до\s+paint/i,
      /тоже\s+в\s+commit.{0,40}до\s+paint/i,
      /fiber.{0,40}разбивает.{0,40}commit/i,
      /commit.{0,40}куск/i,
      /commit.{0,40}5\s*ms/i,
      /commit.{0,60}(?:может|можно)\s+прерыв/i,
      /(?:может|можно)\s+прервать.{0,40}commit/i,
      /requestidlecallback/i,
    ])
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'lanes_priority' &&
    has([
      /lanes?.{0,40}redux/i,
      /redux.{0,40}lanes?/i,
      /requestidlecallback/i,
    ])
  ) {
    return partialScoreForMax(maxScore);
  }

  if (
    checkpointKey === 'commit_limitation' &&
    has([
      /concurrent.{0,40}не\s+лаг/i,
      /вообще\s+не\s+лаг/i,
      /не\s+лагает.{0,40}тысяч/i,
      /10000|10\s*000/,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'render_phase' &&
    has([
      /requestidlecallback/i,
      /concurrent.{0,40}не\s+лаг/i,
    ])
  ) {
    return partialScoreForMax(maxScore);
  }

  return null;
}
