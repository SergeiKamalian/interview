import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateInterviewInput } from './dto/create-interview.input';
import { InterviewCoreService } from './interview-core.service';
import { InterviewPublicService } from './interview-public.service';
import {
  InterviewType,
  StartInterviewPreviewPayload,
} from './types/interview.type';

@Resolver()
export class InterviewCoreResolver {
  constructor(
    private readonly interviewCoreService: InterviewCoreService,
    private readonly interviewPublicService: InterviewPublicService,
  ) {}

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

  @Mutation(() => InterviewType)
  @UseGuards(GqlAuthGuard)
  pauseInterview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InterviewType> {
    return this.interviewCoreService.pauseInterview(currentUser.companyId, id);
  }

  @Mutation(() => InterviewType)
  @UseGuards(GqlAuthGuard)
  resumeInterview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InterviewType> {
    return this.interviewCoreService.resumeInterview(currentUser.companyId, id);
  }

  @Mutation(() => InterviewType)
  @UseGuards(GqlAuthGuard)
  archiveInterview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InterviewType> {
    return this.interviewCoreService.archiveInterview(
      currentUser.companyId,
      id,
    );
  }

  @Mutation(() => StartInterviewPreviewPayload)
  @UseGuards(GqlAuthGuard)
  startInterviewPreview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('interviewId', { type: () => ID }) interviewId: string,
  ): Promise<StartInterviewPreviewPayload> {
    return this.interviewPublicService.startInterviewPreview(
      currentUser.companyId,
      interviewId,
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
