import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import { TalentPoolCandidateType } from './talent-pool.type';
import { TalentPoolService } from '../services/talent-pool.service';

@Resolver()
export class TalentPoolResolver {
  constructor(private readonly service: TalentPoolService) {}

  @Query(() => [TalentPoolCandidateType])
  @UseGuards(GqlAuthGuard)
  matchingCandidatesForLevel(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('level', { type: () => QuestionLevelEnum }) level: QuestionLevelEnum,
    @Args('professionId', { type: () => ID }) professionId: string,
    @Args('skillIds', { type: () => [ID], nullable: true })
    skillIds?: string[] | null,
  ): Promise<TalentPoolCandidateType[]> {
    const numericSkillIds = (skillIds ?? [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));

    return this.service.findMatchingForLevel(
      currentUser.companyId,
      level,
      Number(professionId),
      numericSkillIds,
    );
  }
}
