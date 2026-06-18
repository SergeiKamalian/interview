import type {
  QuestionDifficulty,
  QuestionLevel,
  QuestionListItem,
} from '../model/types';

export type QuestionBankWeightTier = '' | 'low' | 'medium' | 'high';

export type QuestionBankClientFilters = {
  search: string;
  level: QuestionLevel | '';
  difficulty: QuestionDifficulty | '';
  weightTier: QuestionBankWeightTier;
};

export const EMPTY_QUESTION_BANK_FILTERS: QuestionBankClientFilters = {
  search: '',
  level: '',
  difficulty: '',
  weightTier: '',
};

function resolveTopicWeight(item: QuestionListItem): number {
  return item.topic.interviewWeight ?? 1;
}

function matchesWeightTier(
  item: QuestionListItem,
  weightTier: QuestionBankWeightTier,
): boolean {
  if (!weightTier) {
    return true;
  }

  const weight = resolveTopicWeight(item);

  switch (weightTier) {
    case 'low':
      return weight <= 3;
    case 'medium':
      return weight >= 4 && weight <= 6;
    case 'high':
      return weight >= 7;
    default:
      return true;
  }
}

export function matchesQuestionBankFilters(
  item: QuestionListItem,
  filters: QuestionBankClientFilters,
): boolean {
  const needle = filters.search.trim().toLowerCase();

  if (needle) {
    const matchesSearch =
      item.questionText.toLowerCase().includes(needle) ||
      item.topic.name.toLowerCase().includes(needle) ||
      (item.skills?.some((skill) => skill.name.toLowerCase().includes(needle)) ??
        false) ||
      (item.topic.skill?.name.toLowerCase().includes(needle) ?? false);

    if (!matchesSearch) {
      return false;
    }
  }

  if (filters.level && item.level !== filters.level) {
    return false;
  }

  if (filters.difficulty && item.difficulty !== filters.difficulty) {
    return false;
  }

  if (!matchesWeightTier(item, filters.weightTier)) {
    return false;
  }

  return true;
}

export function filterQuestionBankItems(
  items: QuestionListItem[],
  filters: QuestionBankClientFilters,
): QuestionListItem[] {
  return items.filter((item) => matchesQuestionBankFilters(item, filters));
}

export function hasActiveQuestionBankFilters(
  filters: QuestionBankClientFilters,
): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.level !== '' ||
    filters.difficulty !== '' ||
    filters.weightTier !== ''
  );
}
