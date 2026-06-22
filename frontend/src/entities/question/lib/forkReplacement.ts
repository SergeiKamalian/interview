import type { QuestionListItem } from '@entities/question/model/types';

export type ForkReplacementIndex = {
  /** Global question ids replaced by a published company fork. */
  replacedGlobalIds: Set<string>;
  /** global id → company fork id */
  forkByGlobalId: Map<string, string>;
};

export function buildForkReplacementIndex(
  items: ReadonlyArray<
    Pick<
      QuestionListItem,
      'id' | 'isCustom' | 'sourceQuestionId' | 'status'
    >
  >,
): ForkReplacementIndex {
  const replacedGlobalIds = new Set<string>();
  const forkByGlobalId = new Map<string, string>();

  for (const item of items) {
    if (
      !item.isCustom ||
      !item.sourceQuestionId ||
      item.status !== 'published'
    ) {
      continue;
    }
    replacedGlobalIds.add(item.sourceQuestionId);
    forkByGlobalId.set(item.sourceQuestionId, item.id);
  }

  return { replacedGlobalIds, forkByGlobalId };
}

export function isGlobalReplacedByCompanyFork(
  item: Pick<QuestionListItem, 'id' | 'isCustom'>,
  index: ForkReplacementIndex,
): boolean {
  return !item.isCustom && index.replacedGlobalIds.has(item.id);
}
