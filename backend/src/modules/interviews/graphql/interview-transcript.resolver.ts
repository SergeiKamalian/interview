import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { InterviewTranscriptType } from './interview-transcript.type';
import { InterviewTranscriptService } from '../services/interview-transcript.service';

@Resolver()
export class InterviewTranscriptResolver {
  constructor(private readonly service: InterviewTranscriptService) {}

  @Query(() => InterviewTranscriptType)
  @UseGuards(GqlAuthGuard)
  interviewTranscript(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<InterviewTranscriptType> {
    return this.service.getTranscript(currentUser.companyId, Number(attemptId));
  }
}
