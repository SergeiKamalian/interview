import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import {
  CompanyInterviewTemplatesFilterInput,
  CreateInterviewTemplateInput,
} from './graphql/interview-template.input';
import {
  CompanyInterviewTemplatesPayloadType,
  InterviewTemplateType,
} from './graphql/interview-template.type';
import { InterviewTemplatesService } from './interview-templates.service';
import { InterviewType } from '../interview-core/types/interview.type';

@Resolver()
export class InterviewTemplatesResolver {
  constructor(private readonly service: InterviewTemplatesService) {}

  @Query(() => CompanyInterviewTemplatesPayloadType)
  @UseGuards(GqlAuthGuard)
  companyInterviewTemplates(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true })
    filters?: CompanyInterviewTemplatesFilterInput,
  ): Promise<CompanyInterviewTemplatesPayloadType> {
    return this.service.listCompanyTemplates(
      currentUser.companyId,
      filters ?? { page: 1, pageSize: 20 },
    );
  }

  @Mutation(() => InterviewTemplateType)
  @UseGuards(GqlAuthGuard)
  createInterviewTemplate(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateInterviewTemplateInput,
  ): Promise<InterviewTemplateType> {
    return this.service.createTemplate(
      currentUser.companyId,
      currentUser.id,
      input,
    );
  }

  @Mutation(() => InterviewType)
  @UseGuards(GqlAuthGuard)
  createInterviewFromTemplate(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('templateId', { type: () => ID }) templateId: string,
  ): Promise<InterviewType> {
    return this.service.createInterviewFromTemplate(
      currentUser.companyId,
      currentUser.id,
      templateId,
    );
  }

  @Mutation(() => InterviewTemplateType)
  @UseGuards(GqlAuthGuard)
  createInterviewTemplateFromInterview(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('interviewId', { type: () => ID }) interviewId: string,
    @Args('title', { nullable: true }) title?: string,
  ): Promise<InterviewTemplateType> {
    return this.service.createTemplateFromInterview(
      currentUser.companyId,
      currentUser.id,
      interviewId,
      title,
    );
  }
}
