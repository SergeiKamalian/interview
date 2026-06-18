import type { CheckpointEvaluationHints } from '../types/checkpoint-evaluation-hints.type';

export const HOOKS_EVALUATION_HINTS: Record<string, CheckpointEvaluationHints> =
  {
    use_effect: {
      complexityTier: 'core_plus',
      mustConcepts: [
        'useEffect',
        'effect',
        'cleanup',
        'dependencies',
        'dependency array',
        'side effect',
        'mount',
        'unmount',
      ],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.75,
      confusionPairs: [
        {
          checkpointKey: 'use_effect',
          oftenConfusedWith: ['use_state'],
          anchorTermsExpected: [
            'useEffect',
            'effect',
            'cleanup',
            'dependencies',
            'dependency',
          ],
          anchorTermsWrongTopic: ['useState', 'setState', 'state hook'],
        },
      ],
    },
    use_state: {
      complexityTier: 'basic',
      mustConcepts: [
        'useState',
        'setState',
        'state',
        're-render',
        'перерисов',
        'hook',
      ],
      minMatchedConcepts: 2,
      positiveFloorScore: 0.75,
    },
  };

export function hooksCheckpoint(
  checkpointKey: keyof typeof HOOKS_EVALUATION_HINTS,
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
    evaluationHints: HOOKS_EVALUATION_HINTS[checkpointKey],
  };
}
