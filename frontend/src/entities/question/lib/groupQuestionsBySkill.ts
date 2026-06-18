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
