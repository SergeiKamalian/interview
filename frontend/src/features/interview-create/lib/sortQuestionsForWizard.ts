import type { QuestionListItem } from '@entities/question/model/types';

/** Company-owned first, then higher companyPriority (backend uses DESC). */
export function sortQuestionsCompanyFirst(
  items: QuestionListItem[],
): QuestionListItem[] {
  return [...items].sort((left, right) => {
    if (left.isCustom !== right.isCustom) {
      return left.isCustom ? -1 : 1;
    }
    if (left.companyPriority !== right.companyPriority) {
      return right.companyPriority - left.companyPriority;
    }
    return left.questionText.localeCompare(right.questionText, 'ru');
  });
}
