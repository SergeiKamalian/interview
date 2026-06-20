import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CompanyReviewQueueService } from '../services/company-review-queue.service';
import { CompanyReviewQueueFilterInput } from './company-review-queue.input';
import { CompanyReviewQueuePayloadType } from './company-review-queue.type';

@Resolver()
export class CompanyReviewQueueResolver {
  constructor(private readonly service: CompanyReviewQueueService) {}

  @Query(() => CompanyReviewQueuePayloadType)
  @UseGuards(GqlAuthGuard)
  companyReviewQueue(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true })
    filters?: CompanyReviewQueueFilterInput,
  ): Promise<CompanyReviewQueuePayloadType> {
    return this.service.listReviewQueue(
      currentUser.companyId,
      filters ?? {
        page: 1,
        pageSize: 20,
        sort: 'completed_at',
        sortDirection: 'desc',
      },
    );
  }
}
