import { getRequiredConceptGroupsScoreFloor } from './hint-driven-evidence.util';

describe('getRequiredConceptGroupsScoreFloor', () => {
  it('returns proportional floor for paraphrased pointer groups', () => {
    const floor = getRequiredConceptGroupsScoreFloor(
      {
        requiredConceptGroups: [
          ['child', 'первый ребенок'],
          ['sibling', 'соседний'],
          ['return', 'родител'],
        ],
        positiveFloorScore: 0.85,
      },
      'ссылки на родителя, первого ребенка и соседний узел',
      1,
    );

    expect(floor).toBeGreaterThanOrEqual(0.65);
  });
});
