import { Injectable } from '@nestjs/common';
import type { InterviewAttemptsFilterInput } from '../graphql/interview-attempts-page.input';
import type { InterviewAttemptsPageType } from '../graphql/interview-details.type';
import { InterviewAttemptsPageRepository } from '../repositories/interview-attempts-page.repository';
import { mapInterviewAttemptRowToSummary } from '../utils/map-interview-attempt-summary.util';

@Injectable()
export class InterviewAttemptsPageService {
  constructor(private readonly repository: InterviewAttemptsPageRepository) {}

  async listAttemptsPage(
    companyId: number,
    interviewId: number,
    filters: InterviewAttemptsFilterInput,
  ): Promise<InterviewAttemptsPageType> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const { items, total } = await this.repository.listForInterview(
      companyId,
      interviewId,
      {
        ...filters,
        page,
        pageSize,
      },
    );

    return {
      items: items.map(mapInterviewAttemptRowToSummary),
      total,
      page,
      pageSize,
    };
  }
}
