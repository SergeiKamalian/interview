import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateQuestionInput } from './dto/create-question.input';
import { QuestionBankFilterInput } from './dto/question-filter.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankListPayload, QuestionType } from './types/question.type';

@Resolver()
export class QuestionBankResolver {
  constructor(private readonly questionBankService: QuestionBankService) {}

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

  @Query(() => QuestionType)
  @UseGuards(GqlAuthGuard)
  question(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<QuestionType> {
    return this.questionBankService.getById(currentUser.companyId, Number(id));
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
