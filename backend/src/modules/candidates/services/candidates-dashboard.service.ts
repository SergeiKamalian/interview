import { Injectable } from '@nestjs/common';
import type { CompanyCandidatesFilterInput } from '../graphql/candidates-dashboard.input';
import type { CompanyCandidatesPayloadType } from '../graphql/candidates-dashboard.type';
import { CandidatesDashboardRepository } from '../repositories/candidates-dashboard.repository';

@Injectable()
export class CandidatesDashboardService {
  constructor(private readonly repository: CandidatesDashboardRepository) {}

  async listCompanyCandidates(
    companyId: number,
    filters: CompanyCandidatesFilterInput,
  ): Promise<CompanyCandidatesPayloadType> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const { items, total } = await this.repository.listForCompany(companyId, {
      ...filters,
      page,
      pageSize,
    });

    return {
      items: items.map((item) => ({
        candidateId: String(item.candidate_id),
        fullName: item.full_name,
        email: item.email,
        interviewsCount: Number(item.interviews_count),
        avgScore: item.avg_score != null ? Number(item.avg_score) : null,
        lastInterviewDate: item.last_interview_date
          ? Math.floor(item.last_interview_date.getTime() / 1000)
          : null,
        shortlistStatus: item.shortlist_status,
      })),
      total,
      page,
      pageSize,
    };
  }
}
