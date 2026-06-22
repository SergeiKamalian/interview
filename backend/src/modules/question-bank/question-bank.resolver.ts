import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateQuestionInput } from './dto/create-question.input';
import { CreateCompanySkillInput } from './dto/create-company-skill.input';
import { CreateCompanyTopicInput } from './dto/create-company-topic.input';
import { DraftInterviewFromJobDescriptionInput } from './dto/draft-interview-from-job-description.input';
import { QuestionBankFilterInput } from './dto/question-filter.input';
import { SuggestInterviewQuestionsInput } from './dto/suggest-interview-questions.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { UpdateCompanySkillInput } from './dto/update-company-skill.input';
import { UpdateCompanyTopicInput } from './dto/update-company-topic.input';
import { UpsertCompanyQuestionOverrideInput } from './dto/upsert-company-question-override.input';
import { CommitCompanyQuestionImportInput } from './dto/commit-company-import.input';
import { CompanyQuestionImportService } from './company-question-import.service';
import { CompanyQuestionPlaybookService } from './company-question-playbook.service';
import { CreateCompanyQuestionPlaybookInput } from './dto/create-company-question-playbook.input';
import { UpdateCompanyQuestionPlaybookInput } from './dto/update-company-question-playbook.input';
import { JobDescriptionDraftService } from './job-description-draft.service';
import { QuestionBankService } from './question-bank.service';
import { QuestionSuggestionService } from './question-suggestion.service';
import { JobDescriptionDraftPayload } from './types/job-description-draft.type';
import { CompanyQuestionOverrideType } from './types/company-question-override.type';
import { ProfessionType } from './types/profession.type';
import { QuestionBankListPayload, QuestionType } from './types/question.type';
import { SkillType } from './types/skill.type';
import { SuggestedInterviewQuestionsPayload } from './types/suggested-questions.type';
import { TopicType } from './types/topic.type';
import {
  CompanyQuestionImportCommitPayload,
} from './types/company-question-import.type';
import {
  ApplyPlaybookToInterviewDraftPayload,
  CompanyQuestionPlaybookType,
} from './types/company-question-playbook.type';

@Resolver()
export class QuestionBankResolver {
  constructor(
    private readonly questionBankService: QuestionBankService,
    private readonly questionSuggestionService: QuestionSuggestionService,
    private readonly jobDescriptionDraftService: JobDescriptionDraftService,
    private readonly companyQuestionImportService: CompanyQuestionImportService,
    private readonly companyQuestionPlaybookService: CompanyQuestionPlaybookService,
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

  @Query(() => CompanyQuestionOverrideType, { nullable: true })
  @UseGuards(GqlAuthGuard)
  companyQuestionOverride(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('sourceQuestionId', { type: () => ID }) sourceQuestionId: string,
  ): Promise<CompanyQuestionOverrideType | null> {
    return this.questionBankService.getCompanyQuestionOverride(
      currentUser.companyId,
      sourceQuestionId,
    );
  }

  @Mutation(() => CompanyQuestionOverrideType)
  @UseGuards(GqlAuthGuard)
  upsertCompanyQuestionOverride(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: UpsertCompanyQuestionOverrideInput,
  ): Promise<CompanyQuestionOverrideType> {
    return this.questionBankService.upsertCompanyQuestionOverride(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  deleteCompanyQuestionOverride(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('sourceQuestionId', { type: () => ID }) sourceQuestionId: string,
  ): Promise<boolean> {
    return this.questionBankService.deleteCompanyQuestionOverride(
      currentUser.companyId,
      sourceQuestionId,
    );
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
  forkQuestion(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('sourceQuestionId', { type: () => ID }) sourceQuestionId: string,
  ): Promise<QuestionType> {
    return this.questionBankService.forkQuestion(
      currentUser.companyId,
      sourceQuestionId,
    );
  }

  @Mutation(() => QuestionType)
  @UseGuards(GqlAuthGuard)
  archiveQuestion(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<QuestionType> {
    return this.questionBankService.archive(currentUser.companyId, id);
  }

  @Mutation(() => SkillType)
  @UseGuards(GqlAuthGuard)
  createCompanySkill(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateCompanySkillInput,
  ): Promise<SkillType> {
    return this.questionBankService.createCompanySkill(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => SkillType)
  @UseGuards(GqlAuthGuard)
  updateCompanySkill(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: UpdateCompanySkillInput,
  ): Promise<SkillType> {
    return this.questionBankService.updateCompanySkill(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => SkillType)
  @UseGuards(GqlAuthGuard)
  archiveCompanySkill(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SkillType> {
    return this.questionBankService.archiveCompanySkill(
      currentUser.companyId,
      id,
    );
  }

  @Mutation(() => TopicType)
  @UseGuards(GqlAuthGuard)
  createCompanyTopic(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateCompanyTopicInput,
  ): Promise<TopicType> {
    return this.questionBankService.createCompanyTopic(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => TopicType)
  @UseGuards(GqlAuthGuard)
  updateCompanyTopic(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: UpdateCompanyTopicInput,
  ): Promise<TopicType> {
    return this.questionBankService.updateCompanyTopic(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => TopicType)
  @UseGuards(GqlAuthGuard)
  archiveCompanyTopic(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TopicType> {
    return this.questionBankService.archiveCompanyTopic(
      currentUser.companyId,
      id,
    );
  }

  @Mutation(() => CompanyQuestionImportCommitPayload)
  @UseGuards(GqlAuthGuard)
  commitCompanyQuestionImport(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CommitCompanyQuestionImportInput,
  ): Promise<CompanyQuestionImportCommitPayload> {
    return this.companyQuestionImportService.commit(
      currentUser.companyId,
      input,
    );
  }

  @Query(() => [CompanyQuestionPlaybookType])
  @UseGuards(GqlAuthGuard)
  companyQuestionPlaybooks(
    @CurrentUser() currentUser: AuthUserContext,
  ): Promise<CompanyQuestionPlaybookType[]> {
    return this.companyQuestionPlaybookService.list(currentUser.companyId);
  }

  @Query(() => CompanyQuestionPlaybookType)
  @UseGuards(GqlAuthGuard)
  companyQuestionPlaybook(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CompanyQuestionPlaybookType> {
    return this.companyQuestionPlaybookService.getById(
      currentUser.companyId,
      id,
    );
  }

  @Mutation(() => CompanyQuestionPlaybookType)
  @UseGuards(GqlAuthGuard)
  createCompanyQuestionPlaybook(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateCompanyQuestionPlaybookInput,
  ): Promise<CompanyQuestionPlaybookType> {
    return this.companyQuestionPlaybookService.create(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => CompanyQuestionPlaybookType)
  @UseGuards(GqlAuthGuard)
  updateCompanyQuestionPlaybook(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: UpdateCompanyQuestionPlaybookInput,
  ): Promise<CompanyQuestionPlaybookType> {
    return this.companyQuestionPlaybookService.update(
      currentUser.companyId,
      input,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  archiveCompanyQuestionPlaybook(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.companyQuestionPlaybookService.archive(
      currentUser.companyId,
      id,
    );
  }

  @Mutation(() => ApplyPlaybookToInterviewDraftPayload)
  @UseGuards(GqlAuthGuard)
  applyPlaybookToInterviewDraft(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('playbookId', { type: () => ID }) playbookId: string,
    @Args('count', { nullable: true, type: () => Int }) count?: number,
  ): Promise<ApplyPlaybookToInterviewDraftPayload> {
    return this.companyQuestionPlaybookService.applyToInterviewDraft(
      currentUser.companyId,
      playbookId,
      count,
    );
  }
}
