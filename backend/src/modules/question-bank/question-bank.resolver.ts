import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateQuestionInput } from './dto/create-question.input';
import { DraftInterviewFromJobDescriptionInput } from './dto/draft-interview-from-job-description.input';
import { QuestionBankFilterInput } from './dto/question-filter.input';
import { SuggestInterviewQuestionsInput } from './dto/suggest-interview-questions.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { JobDescriptionDraftService } from './job-description-draft.service';
import { QuestionBankService } from './question-bank.service';
import { QuestionSuggestionService } from './question-suggestion.service';
import { JobDescriptionDraftPayload } from './types/job-description-draft.type';
import { ProfessionType } from './types/profession.type';
import { QuestionBankListPayload, QuestionType } from './types/question.type';
import { SkillType } from './types/skill.type';
import { SuggestedInterviewQuestionsPayload } from './types/suggested-questions.type';
import { TopicType } from './types/topic.type';

@Resolver()
export class QuestionBankResolver {
  constructor(
    private readonly questionBankService: QuestionBankService,
    private readonly questionSuggestionService: QuestionSuggestionService,
    private readonly jobDescriptionDraftService: JobDescriptionDraftService,
  ) {}

  @Query(() => QuestionBankListPayload)
  @UseGuards(GqlAuthGuard)
  questionBank(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('filters', { nullable: true }) filters?: QuestionBankFilterInput,
  ): Promise<QuestionBankListPayload> {
    return this.questionBankService.list(
      currentUser.companyId,
      filters ?? new QuestionBankFilterInput(),
    );
  }

  @Query(() => [ProfessionType])
  @UseGuards(GqlAuthGuard)
  professions(): Promise<ProfessionType[]> {
    return this.questionBankService.listProfessions();
  }

  @Query(() => [SkillType])
  @UseGuards(GqlAuthGuard)
  skills(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('professionId', { nullable: true }) professionId?: string,
  ): Promise<SkillType[]> {
    return this.questionBankService.listSkills(
      currentUser.companyId,
      professionId,
    );
  }

  @Query(() => [TopicType])
  @UseGuards(GqlAuthGuard)
  topics(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('skillId', { nullable: true }) skillId?: string,
    @Args('professionId', { nullable: true }) professionId?: string,
  ): Promise<TopicType[]> {
    return this.questionBankService.listTopics(
      currentUser.companyId,
      skillId,
      professionId,
    );
  }

  @Query(() => QuestionType)
  @UseGuards(GqlAuthGuard)
  question(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<QuestionType> {
    return this.questionBankService.getById(currentUser.companyId, Number(id));
  }

  @Mutation(() => SuggestedInterviewQuestionsPayload)
  @UseGuards(GqlAuthGuard)
  suggestInterviewQuestions(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: SuggestInterviewQuestionsInput,
  ): Promise<SuggestedInterviewQuestionsPayload> {
    return this.questionSuggestionService.suggest(currentUser.companyId, input);
  }

  @Mutation(() => JobDescriptionDraftPayload)
  @UseGuards(GqlAuthGuard)
  draftInterviewFromJobDescription(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: DraftInterviewFromJobDescriptionInput,
  ): Promise<JobDescriptionDraftPayload> {
    return this.jobDescriptionDraftService.draftFromJobDescription(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => QuestionType)
  @UseGuards(GqlAuthGuard)
  createQuestion(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateQuestionInput,
  ): Promise<QuestionType> {
    return this.questionBankService.create(currentUser.companyId, input);
  }

  @Mutation(() => QuestionType)
  @UseGuards(GqlAuthGuard)
  updateQuestion(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: UpdateQuestionInput,
  ): Promise<QuestionType> {
    return this.questionBankService.update(currentUser.companyId, input);
  }

  @Mutation(() => QuestionType)
  @UseGuards(GqlAuthGuard)
  archiveQuestion(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<QuestionType> {
    return this.questionBankService.archive(currentUser.companyId, id);
  }
}
