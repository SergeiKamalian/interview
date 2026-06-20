import type { QuestionLevel } from '@shared/api/graphql/generated/graphql';
import type { QuestionListItem } from '../model/types';

const LEVEL_ORDER: QuestionLevel[] = ['junior', 'middle', 'senior', 'lead'];

export function buildLevelSortOrder(targetLevel: QuestionLevel): QuestionLevel[] {
  const targetIndex = LEVEL_ORDER.indexOf(targetLevel);
  if (targetIndex === -1) {
    return [...LEVEL_ORDER];
  }

  const order: QuestionLevel[] = [targetLevel];
  for (let index = targetIndex - 1; index >= 0; index -= 1) {
    order.push(LEVEL_ORDER[index]);
  }
  for (let index = targetIndex + 1; index < LEVEL_ORDER.length; index += 1) {
    order.push(LEVEL_ORDER[index]);
  }
  return order;
}

export function sortQuestionsByTargetLevel(
  items: QuestionListItem[],
  targetLevel: QuestionLevel,
): QuestionListItem[] {
  const levelOrder = buildLevelSortOrder(targetLevel);

  return [...items].sort((left, right) => {
    const leftRank = levelOrder.indexOf(left.level);
    const rightRank = levelOrder.indexOf(right.level);
    const leftOrder = leftRank === -1 ? levelOrder.length : leftRank;
    const rightOrder = rightRank === -1 ? levelOrder.length : rightRank;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.topic.name.localeCompare(right.topic.name, 'ru');
  });
}
