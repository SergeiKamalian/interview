import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CompanyInterviewsFilterInput } from './company-interviews.input';
import { CompanyInterviewsPayloadType } from './company-interviews.type';
import { InterviewsDashboardService } from '../services/interviews-dashboard.service';

@Resolver()
export class InterviewsDashboardResolver {
  constructor(private readonly service: InterviewsDashboardService) {}

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
