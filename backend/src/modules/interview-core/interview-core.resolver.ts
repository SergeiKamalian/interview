import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateInterviewInput } from './dto/create-interview.input';
import { InterviewCoreService } from './interview-core.service';
import { InterviewType } from './types/interview.type';

@Resolver()
export class InterviewCoreResolver {
  constructor(private readonly interviewCoreService: InterviewCoreService) {}

  @Mutation(() => InterviewType)
  @UseGuards(GqlAuthGuard)
  createInterview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateInterviewInput,
  ): Promise<InterviewType> {
    return this.interviewCoreService.createInterview(
      currentUser.companyId,
      currentUser.id,
      input,
    );
  }

  @Mutation(() => InterviewType)
  @UseGuards(GqlAuthGuard)
  publishInterview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InterviewType> {
    return this.interviewCoreService.publishInterview(
      currentUser.companyId,
      id,
    );
  }

  @Query(() => InterviewType)
  @UseGuards(GqlAuthGuard)
  interview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InterviewType> {
    return this.interviewCoreService.getInterview(currentUser.companyId, id);
  }
}
