import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { TopicSkillQuestionFilterInput } from './topic-skill-question.input';
import { TopicSkillQuestionAnalyticsType } from './topic-skill-question.type';
import { TopicSkillQuestionService } from '../services/topic-skill-question.service';

@Resolver()
export class TopicSkillQuestionResolver {
  constructor(private readonly service: TopicSkillQuestionService) {}

  @Query(() => TopicSkillQuestionAnalyticsType)
  @UseGuards(GqlAuthGuard)
  topicSkillQuestionAnalytics(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true }) filters?: TopicSkillQuestionFilterInput,
  ): Promise<TopicSkillQuestionAnalyticsType> {
    return this.service.getAnalytics(currentUser.companyId, filters ?? {});
  }
}
