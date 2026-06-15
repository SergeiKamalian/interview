import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { EvaluateInterviewAttemptPayload } from './graphql/evaluate-interview-attempt.type';
import { FinalEvaluationType } from './graphql/final-evaluation.type';
import { QuestionEvaluationType } from './graphql/question-evaluation.type';
import { AiEvaluationService } from './services/ai-evaluation.service';

@Resolver()
export class AiEvaluationResolver {
  constructor(private readonly aiEvaluationService: AiEvaluationService) {}

  @Mutation(() => EvaluateInterviewAttemptPayload)
  @UseGuards(GqlAuthGuard)
  evaluateInterviewAttempt(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<EvaluateInterviewAttemptPayload> {
    return this.aiEvaluationService.evaluateAttempt(
      currentUser.companyId,
      Number(attemptId),
    );
  }

  @Query(() => [QuestionEvaluationType])
  @UseGuards(GqlAuthGuard)
  questionEvaluationsByInterview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('interviewId', { type: () => ID }) interviewId: string,
  ): Promise<QuestionEvaluationType[]> {
    return this.aiEvaluationService.listQuestionEvaluationsByInterview(
      currentUser.companyId,
      Number(interviewId),
    );
  }

  @Query(() => [QuestionEvaluationType])
  @UseGuards(GqlAuthGuard)
  questionEvaluationsByAttempt(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<QuestionEvaluationType[]> {
    return this.aiEvaluationService.listQuestionEvaluationsByAttempt(
      currentUser.companyId,
      Number(attemptId),
    );
  }

  @Query(() => FinalEvaluationType, { nullable: true })
  @UseGuards(GqlAuthGuard)
  finalEvaluationByAttempt(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<FinalEvaluationType | null> {
    return this.aiEvaluationService.getFinalEvaluationByAttempt(
      currentUser.companyId,
      Number(attemptId),
    );
  }
}
