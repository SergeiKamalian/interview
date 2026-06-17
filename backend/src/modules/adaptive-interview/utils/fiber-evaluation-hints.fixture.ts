import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';

export const FIBER_EVALUATION_HINTS: Record<string, CheckpointEvaluationHints> =
  {
    fiber_definition: {
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
      falseClaims: ['Fiber сделал рендер полностью асинхронным'],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.85,
    },
    fiber_pointers: {
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
      mustConcepts: [
        'scheduler',
        'планирован',
        'MessageChannel',
        'shouldYield',
        '5ms',
        'yield',
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
