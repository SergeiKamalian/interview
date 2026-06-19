import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CompanyDashboardOverviewType } from './dashboard-overview.type';
import { DashboardOverviewService } from '../services/dashboard-overview.service';

@Resolver()
export class DashboardOverviewResolver {
  constructor(private readonly service: DashboardOverviewService) {}

  @Query(() => CompanyDashboardOverviewType)
  @UseGuards(GqlAuthGuard)
  companyDashboardOverview(
    @CurrentUser() currentUser: AuthUserContext,
  ): Promise<CompanyDashboardOverviewType> {
    return this.service.getOverview(currentUser.companyId);
  }
}
