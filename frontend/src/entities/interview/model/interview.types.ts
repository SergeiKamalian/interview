export type CompanyInterviewListItem = {
  attemptId: string;
  interviewId: string;
  interviewTitle: string;
  jobRole: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  startedAt?: number | null;
  completedAt?: number | null;
  overallScore?: number | null;
};

export type CompanyInterviewsResult = {
  items: CompanyInterviewListItem[];
  total: number;
  page: number;
  pageSize: number;
};

import type { AttemptStatus } from '@shared/api/graphql/generated/graphql';

export type CompanyInterviewsFilters = {
  status?: AttemptStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  sortDirection?: string;
};
