import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CompanyCandidatesFilterInput } from './candidates-dashboard.input';
import { CompanyCandidatesPayloadType } from './candidates-dashboard.type';
import { CandidatesDashboardService } from '../services/candidates-dashboard.service';

@Resolver()
export class CandidatesDashboardResolver {
  constructor(private readonly service: CandidatesDashboardService) {}

  @Query(() => CompanyCandidatesPayloadType)
  @UseGuards(GqlAuthGuard)
  companyCandidates(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true }) filters?: CompanyCandidatesFilterInput,
  ): Promise<CompanyCandidatesPayloadType> {
    return this.service.listCompanyCandidates(
      currentUser.companyId,
      filters ?? { page: 1, pageSize: 20, sort: 'avg_score', sortDirection: 'desc' },
    );
  }
}
