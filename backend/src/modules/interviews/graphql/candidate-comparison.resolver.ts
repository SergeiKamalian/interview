import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import {
  CandidateComparisonAdviceType,
  CompareInterviewCandidatesInput,
} from './candidate-comparison.type';
import { CandidateComparisonService } from '../services/candidate-comparison.service';

@Resolver()
export class CandidateComparisonResolver {
  constructor(private readonly service: CandidateComparisonService) {}

  @Mutation(() => CandidateComparisonAdviceType)
  @UseGuards(GqlAuthGuard)
  compareInterviewCandidates(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CompareInterviewCandidatesInput,
  ): Promise<CandidateComparisonAdviceType> {
    return this.service.compareCandidates(
      currentUser.companyId,
      Number(input.interviewId),
      input.attemptIds,
    );
  }
}
