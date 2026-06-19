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

export type CompanyInterviewSummaryItem = {
  interviewId: string;
  title: string;
  jobRole: string;
  status: string;
  level: string;
  interviewLanguage: string;
  questionCount: number;
  publicUrl: string;
  createdAt: number;
  attemptsTotal: number;
  attemptsCompleted: number;
  attemptsInProgress: number;
  attemptsAbandoned: number;
  attemptsPending: number;
  completionRate?: number | null;
  shortlistedCount: number;
  strongInviteCount: number;
  needsManualReviewCount: number;
  avgScore?: number | null;
  lastActivityAt?: number | null;
};

export type CompanyInterviewSummariesResult = {
  items: CompanyInterviewSummaryItem[];
  total: number;
  page: number;
  pageSize: number;
  facets: InterviewSummariesFacets;
};

export type InterviewSummariesFacets = {
  total: number;
  active: number;
  draft: number;
  archived: number;
  withAttempts: number;
};

export type CompanyInterviewSummariesFilters = {
  status?: 'draft' | 'active' | 'archived';
  level?: 'junior' | 'middle' | 'senior' | 'lead';
  interviewLanguage?: string;
  hasAttemptsOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  sortDirection?: string;
};
