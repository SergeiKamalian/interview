export type TopicEntity = {
  id: number;
  skillId: number | null;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
