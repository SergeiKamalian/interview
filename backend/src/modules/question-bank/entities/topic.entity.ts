import type { SkillEntity } from './skill.entity';

export type TopicEntity = {
  id: number;
  companyId: number | null;
  skillId: number | null;
  code: string;
  name: string;
  interviewWeight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  skill?: SkillEntity | null;
};
