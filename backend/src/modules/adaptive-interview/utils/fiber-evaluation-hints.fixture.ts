import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';

export const FIBER_EVALUATION_HINTS: Record<string, CheckpointEvaluationHints> =
  {
    fiber_definition: {
      complexityTier: 'basic',
      probePolicy: {
        requireProbeBeforeFinalPartial: false,
        minScoreAfterShallowAccept: 0.55,
      },
      mustConcepts: [
        'reconciliation',
        'reconciler',
        'fiber',
        'связный список',
        'fiber-узл',
        'render phase',
        'commit phase',
        'прерыва',
        'work loop',
        'createRoot',
        'startTransition',
        'useDeferredValue',
        'React 18',
      ],
      falseClaims: ['Fiber — это Virtual DOM', 'Virtual DOM быстрее обновляет'],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.85,
    },
    stack_vs_fiber: {
      complexityTier: 'intermediate',
      probePolicy: {
        requireProbeBeforeFinalPartial: true,
        minScoreAfterShallowAccept: 0.55,
      },
      impliesCheckpointFloors: [
        { checkpointKey: 'fiber_definition', floorFraction: 0.55 },
      ],
      mustConcepts: [
        'call stack',
        'стек',
        'рекурсив',
        'синхрон',
        'связный список',
        'work loop',
        'fiber-узл',
        'прерыва',
        'yield',
        'main thread',
        'shouldYield',
      ],
      probeConceptGroups: [
        {
          match: ['стек', 'call stack', 'синхрон', 'рекурсив', 'React 16'],
          ask: 'чем stack reconciler отличается от Fiber',
        },
      ],
      falseClaims: ['Fiber сделал рендер полностью асинхронным'],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.85,
    },
    fiber_pointers: {
      complexityTier: 'intermediate',
      probePolicy: {
        requireProbeBeforeFinalPartial: true,
        minScoreAfterShallowAccept: 0.55,
      },
      probeConceptGroups: [
        {
          match: ['child', 'потомок', 'sibling', 'return', 'alternate'],
          ask: 'child, sibling, return и alternate/current в fiber-узле',
        },
      ],
      mustConcepts: [
        'child',
        'sibling',
        'return',
        'alternate',
        'current',
        'потомок',
        'обход',
      ],
      falseClaims: ['parent и next', 'лежат в Redux'],
      neutralMetaphors: ['карточка', 'рабочий узел', 'рабочая единица'],
      requiredConceptGroups: [
        ['child', 'потомок', 'первый ребенок', 'first child', 'ребенок'],
        ['sibling', 'сосед', 'neighbor', 'соседний'],
        ['return', 'родител', 'parent'],
      ],
      minMatchedConcepts: 3,
      positiveFloorScore: 0.85,
    },
    render_phase: {
      mustConcepts: [
        'wip',
        'work-in-progress',
        'alternate',
        'current tree',
        'чернов',
        'DOM не',
        'не трога',
        'прерыва',
        'render phase',
      ],
      probeConceptGroups: [
        {
          match: ['render phase', 'DOM не', 'не трога', 'прерыва'],
          ask: 'render phase и почему DOM не трогается',
        },
        {
          match: ['wip', 'work-in-progress', 'alternate', 'current tree', 'чернов'],
          ask: 'WIP tree и alternate/current',
        },
      ],
      falseClaims: ['render пишет в DOM'],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.85,
    },
    commit_phase: {
      mustConcepts: [
        'commit phase',
        'commit',
        'атомар',
        'синхрон',
        'before mutation',
        'mutation',
        'layout',
        'passive',
        'useLayoutEffect',
        'useEffect',
      ],
      falseClaims: ['commit можно прервать'],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.85,
    },
    scheduling: {
      complexityTier: 'advanced',
      probePolicy: {
        requireProbeBeforeFinalPartial: true,
        shallowAcceptMaxFraction: 0.5,
        minScoreAfterShallowAccept: 0.55,
      },
      impliesCheckpointFloors: [
        { checkpointKey: 'lanes_priority', floorFraction: 0.5 },
        { checkpointKey: 'fiber_definition', floorFraction: 0.45 },
      ],
      mustConcepts: [
        'scheduler',
        'планирован',
        'MessageChannel',
        'shouldYield',
        '5ms',
        'yield',
      ],
      probeConceptGroups: [
        { match: ['scheduler', 'планирован'], ask: 'scheduler' },
        {
          match: ['MessageChannel', 'postMessage'],
          ask: 'MessageChannel и postMessage',
        },
        {
          match: ['shouldYield', 'should yield', '5ms', 'yield'],
          ask: 'shouldYield и time slicing (~5ms)',
        },
      ],
      falseClaims: [
        'Fiber планирует через requestIdleCallback',
        'планирование через requestIdleCallback',
        'scheduler использует requestIdleCallback',
        'requestIdleCallback для планирования',
      ],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.85,
    },
    lanes_priority: {
      mustConcepts: [
        'SyncLane',
        'TransitionLane',
        'lane',
        'lanes',
        'startTransition',
        'useDeferredValue',
        'createRoot',
        'transition',
        'приоритет',
      ],
      falseClaims: ['lanes в Redux'],
      minMatchedConcepts: 1,
      positiveFloorScore: 0.85,
    },
    commit_limitation: {
      mustConcepts: [
        'прерыва',
        'render',
        'commit',
        'атомар',
        'синхрон',
        'виртуализац',
        'массов',
        'DOM-мутац',
      ],
      falseClaims: ['concurrent mode полностью убирает лаги'],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.75,
      falseClaimCapFraction: 0,
    },
  };

export function fiberCheckpoint(
  checkpointKey: keyof typeof FIBER_EVALUATION_HINTS,
  overrides: {
    title?: string;
    expected?: string;
    score?: number;
    sortOrder?: number;
  } = {},
) {
  return {
    checkpointKey,
    title: overrides.title ?? checkpointKey,
    expected: overrides.expected ?? checkpointKey,
    score: overrides.score ?? 1,
    sortOrder: overrides.sortOrder ?? 0,
    evaluationHints: FIBER_EVALUATION_HINTS[checkpointKey],
  };
}
