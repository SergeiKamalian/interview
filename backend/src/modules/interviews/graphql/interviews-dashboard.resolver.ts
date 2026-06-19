import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CompanyInterviewsFilterInput } from './company-interviews.input';
import { CompanyInterviewsPayloadType } from './company-interviews.type';
import { CompanyInterviewSummariesFilterInput } from './company-interview-summaries.input';
import { CompanyInterviewSummariesPayloadType } from './company-interview-summaries.type';
import { InterviewsDashboardService } from '../services/interviews-dashboard.service';

@Resolver()
export class InterviewsDashboardResolver {
  constructor(private readonly service: InterviewsDashboardService) {}

  @Query(() => CompanyInterviewSummariesPayloadType)
  @UseGuards(GqlAuthGuard)
  companyInterviewSummaries(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true })
    filters?: CompanyInterviewSummariesFilterInput,
  ): Promise<CompanyInterviewSummariesPayloadType> {
    return this.service.listCompanyInterviewSummaries(
      currentUser.companyId,
      filters ?? {
        page: 1,
        pageSize: 10,
        sort: 'last_activity_at',
        sortDirection: 'desc',
      },
    );
  }

  @Query(() => CompanyInterviewsPayloadType)
  @UseGuards(GqlAuthGuard)
  companyInterviews(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true }) filters?: CompanyInterviewsFilterInput,
  ): Promise<CompanyInterviewsPayloadType> {
    return this.service.listCompanyInterviews(
      currentUser.companyId,
      filters ?? { page: 1, pageSize: 20, sort: 'created_at', sortDirection: 'desc' },
    );
  }
}
