import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { AiCostFilterInput } from './ai-cost.input';
import { AiCostAnalyticsType } from './ai-cost.type';
import { AiCostService } from '../services/ai-cost.service';

@Resolver()
export class AiCostResolver {
  constructor(private readonly service: AiCostService) {}

  @Query(() => AiCostAnalyticsType)
  @UseGuards(GqlAuthGuard)
  aiCostAnalytics(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true }) filters?: AiCostFilterInput,
  ): Promise<AiCostAnalyticsType> {
    return this.service.getAnalytics(currentUser.companyId, filters ?? {});
  }
}
