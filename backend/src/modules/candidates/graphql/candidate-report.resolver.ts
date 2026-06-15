import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CandidateReportType } from './candidate-report.type';
import { CandidateReportService } from '../services/candidate-report.service';

@Resolver()
export class CandidateReportResolver {
  constructor(private readonly service: CandidateReportService) {}

  @Query(() => CandidateReportType)
  @UseGuards(GqlAuthGuard)
  candidateReport(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('candidateId', { type: () => ID }) candidateId: string,
  ): Promise<CandidateReportType> {
    return this.service.getReport(currentUser.companyId, Number(candidateId));
  }
}
