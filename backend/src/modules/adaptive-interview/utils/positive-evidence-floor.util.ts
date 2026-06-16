export function getPositiveEvidenceScoreFloor(
  checkpointKey: string,
  latestText: string,
  fullText?: string,
): number | null {
  const candidates = [latestText, fullText ?? ''].filter((text) => text.trim());
  let best: number | null = null;

  for (const text of candidates) {
    const floor = getFloorForCheckpoint(checkpointKey, text);
    if (floor !== null && (best === null || floor > best)) {
      best = floor;
    }
  }

  return best;
}

function getFloorForCheckpoint(
  checkpointKey: string,
  candidateText: string,
): number | null {
  const text = candidateText.toLowerCase();

  switch (checkpointKey) {
    case 'scheduling':
      return schedulingFloor(text);
    case 'stack_vs_fiber':
      return stackVsFiberFloor(text);
    case 'fiber_definition':
      return fiberDefinitionFloor(text);
    case 'fiber_pointers':
      return fiberPointersFloor(text);
    case 'render_phase':
      return renderPhaseFloor(text);
    case 'commit_phase':
      return commitPhaseFloor(text);
    case 'lanes_priority':
      return lanesPriorityFloor(text);
    case 'commit_limitation':
      return commitLimitationFloor(text);
    default:
      return null;
  }
}

function schedulingFloor(text: string): number | null {
  const hasScheduler =
    /scheduler|планирован|messagechannel|postmessage|shouldyield|should\s*yield/i.test(
      text,
    );
  const hasChunking = /~?\s*5\s*ms|chunk|куск|тайм-?слайс|yield/i.test(text);
  const deniesRic =
    /(?:не|not|instead).{0,30}request\s*idle\s*callback|не\s+requestidlecallback/i.test(
      text,
    );

  if (
    /messagechannel/i.test(text) &&
    /should\s*yield|shouldyield/i.test(text) &&
    (/scheduler|планирован/i.test(text) || deniesRic)
  ) {
    return 0.85;
  }

  if (hasScheduler && (hasChunking || deniesRic)) {
    return 0.75;
  }

  if (hasScheduler && /прерыв|yield|lane/i.test(text)) {
    return 0.7;
  }

  return null;
}

function stackVsFiberFloor(text: string): number | null {
  const hasStack =
    /call\s+stack|рекурсивн|синхронн.{0,30}обход|до\s+react\s+16/i.test(text);
  const hasFiberModel =
    /связн.{0,20}список|linked\s+list|work\s+loop|fiber-узл|порциям|уступ|прерыв|инкремент/i.test(
      text,
    );
  const hasInterruptibility =
    /прерыв|не\s+блокир|main\s+thread|shouldyield|уступ/i.test(text);

  if (hasStack && hasFiberModel) {
    return 0.85;
  }

  if (hasFiberModel && hasInterruptibility) {
    return 0.75;
  }

  return null;
}

function fiberDefinitionFloor(text: string): number | null {
  const hasReconciler =
    /reconcil|согласован|reconciliation\s+engine/i.test(text) &&
    /fiber/i.test(text);
  const hasIncremental =
    /связн|прерыв|render|commit|инкремент|work\s+loop|fiber-узл/i.test(text);
  const hasModernApi =
    /createroot|starttransition|usedeferredvalue|react\s+18/i.test(text);

  if (hasReconciler && hasIncremental && hasModernApi) {
    return 0.85;
  }

  if (hasReconciler && hasIncremental) {
    return 0.75;
  }

  if (/fiber/i.test(text) && hasIncremental) {
    return 0.65;
  }

  return null;
}

function fiberPointersFloor(text: string): number | null {
  const hasChild = /\bchild\b|потомок/i.test(text);
  const hasSibling = /\bsibling\b|сосед/i.test(text);
  const hasReturn = /\breturn\b|родител/i.test(text);

  if (hasChild && hasSibling && hasReturn) {
    const describesTraversal =
      /вглубь|обход|child.*sibling|sibling.*return|тупик/i.test(text);
    const hasAlternate = /alternate|current/i.test(text);
    return describesTraversal || hasAlternate ? 1 : 0.85;
  }

  return null;
}

function renderPhaseFloor(text: string): number | null {
  const hasWip =
    /wip|work-?in-?progress|alternate|current\s+tree|чернов/i.test(text);
  const hasNoDomMutation =
    /dom.{0,30}(?:не|оста|стара)|не\s+трога|не\s+меня|не\s+мутир/i.test(text);
  const hasInterruptible =
    /прерыв|interrupt|shouldyield|work\s+loop/i.test(text);

  if (hasWip && (hasNoDomMutation || hasInterruptible)) {
    return 0.85;
  }

  if (hasWip && /render\s+phase/i.test(text)) {
    return 0.75;
  }

  return null;
}

function commitPhaseFloor(text: string): number | null {
  const hasAtomic = /атомар|atomic|синхронн.{0,20}commit/i.test(text);
  const hasEffectOrder =
    /before\s+mutation|mutation|layout|passive|uselayouteffect|useeffect/i.test(
      text,
    );

  if (hasAtomic && hasEffectOrder) {
    return 0.85;
  }

  if (/commit\s+phase/i.test(text) && (hasAtomic || hasEffectOrder)) {
    return 0.75;
  }

  return null;
}

function lanesPriorityFloor(text: string): number | null {
  const hasLanes =
    /synclane|transitionlane|\blanes?\b|lane-приоритет/i.test(text);
  const hasConcurrentApi =
    /starttransition|usedeferredvalue|createroot|transition/i.test(text);

  if (hasLanes && hasConcurrentApi) {
    return 0.85;
  }

  if (hasLanes) {
    return 0.75;
  }

  if (hasConcurrentApi && /приоритет|priority/i.test(text)) {
    return 0.65;
  }

  return null;
}

function commitLimitationFloor(text: string): number | null {
  const hasInterruptibleRender =
    /прерыв.{0,30}render|render.{0,30}прерыв|инкремент|work\s+loop/i.test(
      text,
    );
  const hasCommitConstraint =
    /commit.{0,40}(?:атомар|синхрон|не\s+прерыв|нельзя\s+прерыв)|commit.{0,20}блокир/i.test(
      text,
    );
  const hasPracticalLimit =
    /виртуализац|массов|dom-мутац|больш.{0,20}обновлен/i.test(text);

  if (hasInterruptibleRender && hasCommitConstraint) {
    return 0.75;
  }

  if (hasInterruptibleRender && hasPracticalLimit) {
    return 0.65;
  }

  if (hasCommitConstraint) {
    return 0.6;
  }

  return null;
}
