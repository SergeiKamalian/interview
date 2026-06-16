import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BeginInterviewAttemptInput } from './dto/begin-interview-attempt.input';
import { StartPublicInterviewInput } from './dto/start-public-interview.input';
import { SubmitInterviewAnswerInput } from './dto/submit-interview-answer.input';
import { InterviewPublicService } from './interview-public.service';
import {
  InterviewSessionType,
  PublicInterviewType,
  StartPublicInterviewPayload,
  SubmitInterviewAnswerPayload,
} from './types/interview.type';

@Resolver()
export class InterviewPublicResolver {
  constructor(
    private readonly interviewPublicService: InterviewPublicService,
  ) {}

  @Query(() => PublicInterviewType)
  publicInterview(
    @Args('publicToken') publicToken: string,
  ): Promise<PublicInterviewType> {
    return this.interviewPublicService.getPublicInterview(publicToken);
  }

  @Mutation(() => StartPublicInterviewPayload)
  startPublicInterview(
    @Args('input') input: StartPublicInterviewInput,
  ): Promise<StartPublicInterviewPayload> {
    return this.interviewPublicService.startPublicInterview(input);
  }

  @Mutation(() => InterviewSessionType)
  beginInterviewAttempt(
    @Args('input') input: BeginInterviewAttemptInput,
  ): Promise<InterviewSessionType> {
    return this.interviewPublicService.beginInterviewAttempt(input);
  }

  @Query(() => InterviewSessionType)
  interviewSession(
    @Args('publicToken') publicToken: string,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<InterviewSessionType> {
    return this.interviewPublicService.getSession(publicToken, attemptId);
  }

  @Mutation(() => SubmitInterviewAnswerPayload)
  submitInterviewAnswer(
    @Args('input') input: SubmitInterviewAnswerInput,
  ): Promise<SubmitInterviewAnswerPayload> {
    return this.interviewPublicService.submitAnswer(
      input.publicToken,
      input.attemptId,
      input.answer,
      input.mediaAssetId ?? null,
    );
  }

  @Mutation(() => InterviewSessionType)
  completeInterviewAttempt(
    @Args('publicToken') publicToken: string,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<InterviewSessionType> {
    return this.interviewPublicService.completeAttempt(publicToken, attemptId);
  }
}
