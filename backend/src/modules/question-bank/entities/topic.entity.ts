export type TopicEntity = {
  id: number;
  skillId: number | null;
  code: string;
  name: string;
  interviewWeight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
