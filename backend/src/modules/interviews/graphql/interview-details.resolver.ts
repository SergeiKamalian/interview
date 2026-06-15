import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { InterviewDetailsType } from './interview-details.type';
import { InterviewDetailsService } from '../services/interview-details.service';

@Resolver()
export class InterviewDetailsResolver {
  constructor(private readonly service: InterviewDetailsService) {}

  @Query(() => InterviewDetailsType)
  @UseGuards(GqlAuthGuard)
  interviewDetails(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('interviewId', { type: () => ID }) interviewId: string,
  ): Promise<InterviewDetailsType> {
    return this.service.getDetails(currentUser.companyId, Number(interviewId));
  }
}
