import { alignRationaleDepthWithScore } from './rationale-depth-alignment.util';
import { parseDepthFromRationale } from './checkpoint-depth.util';
import { aggregateCheckpointRedFlags } from './checkpoint-red-flags.util';

describe('alignRationaleDepthWithScore', () => {
  it('upgrades partial_knowledge to understands when score is 0.75+', () => {
    const aligned = alignRationaleDepthWithScore(
      'depth=partial_knowledge, coverage=medium, accuracy=partial: корректная идея.',
      0.85,
      1,
    );

    expect(aligned).toMatch(/depth=understands/i);
    expect(parseDepthFromRationale(aligned)).toBe('understands');
  });

  it('upgrades to knows when score is full', () => {
    const aligned = alignRationaleDepthWithScore(
      'depth=partial_knowledge, coverage=high, accuracy=partial: child sibling return.',
      1,
      1,
    );

    expect(aligned).toMatch(/depth=knows/i);
    expect(aligned).toMatch(/accuracy=full/i);
  });
});

describe('aggregateCheckpointRedFlags', () => {
  it('does not flag scheduling when rationale only notes missing requestIdleCallback', () => {
    const flags = aggregateCheckpointRedFlags([
      {
        checkpointKey: 'scheduling',
        checkpointTitle: 'Понимает планирование Fiber',
        rationale:
          'depth=understands, coverage=high, accuracy=partial: MessageChannel и shouldYield; не упомянул requestIdleCallback. Positive evidence floor applied.',
        evidenceSummary: 'MessageChannel shouldYield',
        status: 'partial',
      },
    ]);

    expect(flags).toHaveLength(0);
  });
});

describe('checkpoint depth inference', () => {
  it('does not infer false_claim from denied requestIdleCallback', () => {
    const depth = parseDepthFromRationale(
      'depth=understands, coverage=high, accuracy=partial: MessageChannel, не requestIdleCallback.',
    );

    expect(depth).toBe('understands');
  });
});
