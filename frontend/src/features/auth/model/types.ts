export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
};

export type AuthCompany = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type AuthPayload = {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
  company: AuthCompany;
};

export type MePayload = {
  user: AuthUser;
  company: AuthCompany;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
};
