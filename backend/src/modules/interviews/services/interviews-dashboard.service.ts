import { Injectable } from '@nestjs/common';
import type { CompanyInterviewSummariesFilterInput } from '../graphql/company-interview-summaries.input';
import type { CompanyInterviewSummariesPayloadType } from '../graphql/company-interview-summaries.type';
import type { CompanyInterviewsFilterInput } from '../graphql/company-interviews.input';
import type { CompanyInterviewsPayloadType } from '../graphql/company-interviews.type';
import { InterviewsDashboardRepository } from '../repositories/interviews-dashboard.repository';
import { InterviewStatusEnum } from '../../interview-core/types/interview.type';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';

@Injectable()
export class InterviewsDashboardService {
  constructor(private readonly repository: InterviewsDashboardRepository) {}

  async listCompanyInterviewSummaries(
    companyId: number,
    filters: CompanyInterviewSummariesFilterInput,
  ): Promise<CompanyInterviewSummariesPayloadType> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 100);
    const [{ items, total }, facets] = await Promise.all([
      this.repository.listInterviewSummariesForCompany(companyId, {
        ...filters,
        page,
        pageSize,
      }),
      this.repository.getInterviewSummaryFacets(companyId),
    ]);

    return {
      items: items.map((item) => ({
        interviewId: String(item.interviewId),
        title: item.title,
        jobRole: item.jobRole,
        status: item.status as InterviewStatusEnum,
        level: item.level as QuestionLevelEnum,
        interviewLanguage: item.interviewLanguage,
        questionCount: item.questionCount,
        publicUrl: `/i/${item.publicToken}`,
        createdAt: Math.floor(item.createdAt.getTime() / 1000),
        attemptsTotal: item.attemptsTotal,
        attemptsCompleted: item.attemptsCompleted,
        attemptsInProgress: item.attemptsInProgress,
        attemptsAbandoned: item.attemptsAbandoned,
        attemptsPending: item.attemptsPending,
        completionRate: item.completionRate,
        shortlistedCount: item.shortlistedCount,
        strongInviteCount: item.strongInviteCount,
        needsManualReviewCount: item.needsManualReviewCount,
        avgScore: item.avgScore,
        lastActivityAt: item.lastActivityAt
          ? Math.floor(item.lastActivityAt.getTime() / 1000)
          : null,
      })),
      total,
      page,
      pageSize,
      facets: {
        total: facets.total,
        active: facets.active,
        draft: facets.draft,
        archived: facets.archived,
        withAttempts: facets.withAttempts,
      },
    };
  }

  async listCompanyInterviews(
    companyId: number,
    filters: CompanyInterviewsFilterInput,
  ): Promise<CompanyInterviewsPayloadType> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const { items, total } = await this.repository.listForCompany(companyId, {
      ...filters,
      page,
      pageSize,
    });

    return {
      items: items.map((item) => ({
        attemptId: String(item.attemptId),
        interviewId: String(item.interviewId),
        interviewTitle: item.interviewTitle,
        jobRole: item.jobRole,
        candidateName: item.candidateName,
        candidateEmail: item.candidateEmail,
        status: item.status as CompanyInterviewsPayloadType['items'][number]['status'],
        startedAt: item.startedAt ? Math.floor(item.startedAt.getTime() / 1000) : null,
        completedAt: item.completedAt
          ? Math.floor(item.completedAt.getTime() / 1000)
          : null,
        overallScore: item.overallScore,
      })),
      total,
      page,
      pageSize,
    };
  }
}
