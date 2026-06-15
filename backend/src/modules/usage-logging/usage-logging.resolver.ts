import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AiUsageLogService } from './ai-usage-log.service';
import { AiUsageCostSummaryType } from './graphql/ai-usage-log.type';

@Resolver()
export class UsageLoggingResolver {
  constructor(private readonly aiUsageLogService: AiUsageLogService) {}

  @Query(() => AiUsageCostSummaryType)
  @UseGuards(GqlAuthGuard)
  aiUsageCostSummary(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('days', { defaultValue: 30 }) days: number,
  ): Promise<AiUsageCostSummaryType> {
    const since = new Date();
    since.setDate(since.getDate() - Math.max(days, 1));

    return this.aiUsageLogService.summarizeSince(currentUser.companyId, since);
  }
}
