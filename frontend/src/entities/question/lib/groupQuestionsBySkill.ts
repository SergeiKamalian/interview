import type { QuestionListItem, QuestionLookup } from '../model/types';

const SKILL_DISPLAY_ORDER = [
  'react',
  'angular',
  'vue',
  'nextjs',
  'nuxt',
  'nodejs',
  'nestjs',
  'expressjs',
  'redux',
  'docker',
  'css',
  'html-css',
  'html',
  'typescript',
  'git',
  'sql',
  'patterns',
  'principles',
  'architecture',
  'javascript',
] as const;

const FALLBACK_SKILL: QuestionLookup = {
  id: 'other',
  code: 'other',
  name: 'Прочее',
};

function skillSortIndex(code: string): number {
  const index = SKILL_DISPLAY_ORDER.indexOf(
    code as (typeof SKILL_DISPLAY_ORDER)[number],
  );

  return index === -1 ? SKILL_DISPLAY_ORDER.length + 1 : index;
}

export function getQuestionPrimarySkill(
  question: QuestionListItem,
): QuestionLookup {
  if (question.topic.skill) {
    return question.topic.skill;
  }

  const skills = question.skills ?? [];

  if (skills.length === 0) {
    return FALLBACK_SKILL;
  }

  return [...skills].sort(
    (left, right) => skillSortIndex(left.code) - skillSortIndex(right.code),
  )[0];
}

export type QuestionSkillGroup = {
  skill: QuestionLookup;
  items: QuestionListItem[];
};

export function groupQuestionsByPrimarySkill(
  items: QuestionListItem[],
): QuestionSkillGroup[] {
  const groups = new Map<string, QuestionSkillGroup>();

  for (const item of items) {
    const skill = getQuestionPrimarySkill(item);
    const existing = groups.get(skill.code);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(skill.code, { skill, items: [item] });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((left, right) =>
        left.topic.name.localeCompare(right.topic.name, 'ru'),
      ),
    }))
    .sort((left, right) => {
      const orderDiff =
        skillSortIndex(left.skill.code) - skillSortIndex(right.skill.code);

      if (orderDiff !== 0) {
        return orderDiff;
      }

      return left.skill.name.localeCompare(right.skill.name, 'ru');
    });
}

type CustomSkillRef = {
  id: string;
  code: string;
  name: string;
  isCustom: boolean;
};

/** Пустые company-стеки видны в банке до первого вопроса. */
export function mergeEmptyCustomSkillGroups(
  groups: QuestionSkillGroup[],
  customSkills: CustomSkillRef[],
): QuestionSkillGroup[] {
  const existingIds = new Set(groups.map((group) => group.skill.id));
  const existingCodes = new Set(groups.map((group) => group.skill.code));

  const emptyGroups = customSkills
    .filter(
      (skill) =>
        skill.isCustom &&
        !existingIds.has(skill.id) &&
        !existingCodes.has(skill.code),
    )
    .map((skill) => ({
      skill: {
        id: skill.id,
        code: skill.code,
        name: skill.name,
        isCustom: true,
      },
      items: [] as QuestionListItem[],
    }));

  return [...emptyGroups, ...groups].sort((left, right) => {
    if (left.items.length === 0 && right.items.length > 0) {
      return -1;
    }

    if (left.items.length > 0 && right.items.length === 0) {
      return 1;
    }

    const leftCustom = left.skill.isCustom ? 0 : 1;
    const rightCustom = right.skill.isCustom ? 0 : 1;

    if (leftCustom !== rightCustom) {
      return leftCustom - rightCustom;
    }

    const orderDiff =
      skillSortIndex(left.skill.code) - skillSortIndex(right.skill.code);

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return left.skill.name.localeCompare(right.skill.name, 'ru');
  });
}
