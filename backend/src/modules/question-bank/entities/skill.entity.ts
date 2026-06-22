export type SkillEntity = {
  id: number;
  companyId: number | null;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
