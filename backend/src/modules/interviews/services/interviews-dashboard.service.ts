import { Injectable } from '@nestjs/common';
import type { CompanyInterviewsFilterInput } from '../graphql/company-interviews.input';
import type { CompanyInterviewsPayloadType } from '../graphql/company-interviews.type';
import { InterviewsDashboardRepository } from '../repositories/interviews-dashboard.repository';

@Injectable()
export class InterviewsDashboardService {
  constructor(private readonly repository: InterviewsDashboardRepository) {}

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
