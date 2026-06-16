import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { AdaptiveCheckpointReviewType } from './adaptive-checkpoint-review.type';
import { AdaptiveCheckpointReviewService } from '../services/adaptive-checkpoint-review.service';

@Resolver()
export class AdaptiveCheckpointReviewResolver {
  constructor(private readonly service: AdaptiveCheckpointReviewService) {}

  @Query(() => AdaptiveCheckpointReviewType)
  @UseGuards(GqlAuthGuard)
  adaptiveCheckpointReviewByAttempt(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<AdaptiveCheckpointReviewType> {
    return this.service.getByAttempt(currentUser.companyId, Number(attemptId));
  }
}
