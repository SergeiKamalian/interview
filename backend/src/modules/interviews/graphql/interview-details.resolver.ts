import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { InterviewAttemptsFilterInput } from './interview-attempts-page.input';
import {
  InterviewAttemptsPageType,
  InterviewDetailsType,
} from './interview-details.type';
import { InterviewAttemptsPageService } from '../services/interview-attempts-page.service';
import { InterviewDetailsService } from '../services/interview-details.service';

@Resolver()
export class InterviewDetailsResolver {
  constructor(
    private readonly service: InterviewDetailsService,
    private readonly attemptsPageService: InterviewAttemptsPageService,
  ) {}

  @Query(() => InterviewDetailsType)
  @UseGuards(GqlAuthGuard)
  interviewDetails(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('interviewId', { type: () => ID }) interviewId: string,
  ): Promise<InterviewDetailsType> {
    return this.service.getDetails(currentUser.companyId, Number(interviewId));
  }

  @Query(() => InterviewAttemptsPageType)
  @UseGuards(GqlAuthGuard)
  interviewAttemptsPage(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('interviewId', { type: () => ID }) interviewId: string,
    @Args('filters', { nullable: true }) filters?: InterviewAttemptsFilterInput,
  ): Promise<InterviewAttemptsPageType> {
    return this.attemptsPageService.listAttemptsPage(
      currentUser.companyId,
      Number(interviewId),
      filters ?? { page: 1, pageSize: 20, sort: 'score', sortDirection: 'desc' },
    );
  }
}
