export type CandidateEntity = {
  id: number;
  companyId: number;
  interviewId: number;
  fullName: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};
