import { groupQuestionsByPrimarySkill } from '@entities/question/lib/groupQuestionsBySkill';
import type { QuestionListItem } from '@entities/question/model/types';
import type { QuestionBankFilters } from '@features/question-bank/api/questionBankApi';

/** Shared question-bank query args for wizard step 1 (skills) and step 2 (picker). */
export function wizardQuestionPoolFilters(professionId: string): QuestionBankFilters {
  return {
    professionId,
    limit: 1000,
    offset: 0,
    includeForkReplacedGlobal: true,
  };
}

export type WizardSkillOption = {
  id: string;
  code: string;
  name: string;
  isCustom: boolean;
};

/** Skills derived the same way as step 2 accordion groups (topic.skill primary). */
export function deriveWizardSkillsFromPool(
  pool: QuestionListItem[],
): WizardSkillOption[] {
  return groupQuestionsByPrimarySkill(pool)
    .filter((group) => group.skill.id !== 'other')
    .map((group) => ({
      id: group.skill.id,
      code: group.skill.code,
      name: group.skill.name,
      isCustom:
        group.skill.isCustom ??
        group.items.some((item) => item.isCustom) ??
        group.items.some((item) => item.topic.skill?.isCustom),
    }));
}
