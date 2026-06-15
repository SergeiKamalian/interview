import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CheckpointResultsByAttemptType } from './checkpoint-results-detail.type';
import { CheckpointResultsService } from '../services/checkpoint-results.service';

@Resolver()
export class CheckpointResultsResolver {
  constructor(private readonly service: CheckpointResultsService) {}

  @Query(() => CheckpointResultsByAttemptType)
  @UseGuards(GqlAuthGuard)
  checkpointResultsByAttempt(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<CheckpointResultsByAttemptType> {
    return this.service.getByAttempt(currentUser.companyId, Number(attemptId));
  }
}
