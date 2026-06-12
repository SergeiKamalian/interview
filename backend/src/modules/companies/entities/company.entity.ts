export type CompanyEntity = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyMembershipRole = 'owner' | 'member';
