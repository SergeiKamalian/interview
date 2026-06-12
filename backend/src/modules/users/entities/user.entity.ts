export type UserEntity = {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPasswordEntity = UserEntity & {
  passwordHash: string;
};
