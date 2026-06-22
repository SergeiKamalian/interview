import type { Topic } from '@features/question-bank/api/questionBankApi';

/**
 * Pick topic for a new/edited company question by stack (skill).
 * Prefers company-owned topic on the same skill, then any topic on skill.
 */
export function pickTopicIdForSkill(
  skillId: string,
  topics: Topic[],
): string | null {
  const forSkill = topics.filter((topic) => topic.skill?.id === skillId);
  const companyTopic = forSkill.find((topic) => topic.isCustom);
  if (companyTopic) {
    return companyTopic.id;
  }
  if (forSkill.length > 0) {
    return forSkill[0]?.id ?? null;
  }
  return null;
}

export function buildDefaultCompanyTopicCode(skillCode: string): string {
  const base = `${skillCode}_company_questions`.replace(/[^a-z0-9_]/g, '_');
  return base.slice(0, 64);
}
