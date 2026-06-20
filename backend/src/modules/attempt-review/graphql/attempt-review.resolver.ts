import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { AttemptReviewDecisionHistoryFilterInput } from './attempt-review-decision-history.input';
import {
  AttemptReviewDecisionHistoryPayloadType,
  AttemptReviewNoteType,
  AttemptReviewPayloadType,
  AttemptShareLinkType,
  CreateAttemptReviewNoteInput,
  CreateAttemptShareLinkInput,
  SetAttemptAiVerdictInput,
  SetAttemptCompanyDecisionInput,
  UpdateAttemptReviewNoteInput,
} from './attempt-review.type';
import { AttemptReviewService } from '../services/attempt-review.service';
import { AttemptShareService } from '../services/attempt-share.service';

@Resolver()
export class AttemptReviewResolver {
  constructor(
    private readonly service: AttemptReviewService,
    private readonly shareService: AttemptShareService,
  ) {}

  @Query(() => [AttemptReviewNoteType])
  @UseGuards(GqlAuthGuard)
  attemptReviewNotes(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<AttemptReviewNoteType[]> {
    return this.service.listNotes(currentUser.companyId, Number(attemptId));
  }

  @Mutation(() => AttemptReviewPayloadType)
  @UseGuards(GqlAuthGuard)
  markAttemptReviewStarted(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<AttemptReviewPayloadType> {
    return this.service.markReviewStarted({
      companyId: currentUser.companyId,
      attemptId: Number(attemptId),
      userId: currentUser.id,
    });
  }

  @Mutation(() => AttemptReviewPayloadType)
  @UseGuards(GqlAuthGuard)
  setAttemptAiVerdict(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: SetAttemptAiVerdictInput,
  ): Promise<AttemptReviewPayloadType> {
    return this.service.setAiVerdict(
      currentUser.companyId,
      currentUser.id,
      input,
    );
  }

  @Mutation(() => AttemptReviewPayloadType)
  @UseGuards(GqlAuthGuard)
  setAttemptCompanyDecision(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: SetAttemptCompanyDecisionInput,
  ): Promise<AttemptReviewPayloadType> {
    return this.service.setCompanyDecision(
      currentUser.companyId,
      currentUser.id,
      input,
    );
  }

  @Mutation(() => AttemptReviewNoteType)
  @UseGuards(GqlAuthGuard)
  createAttemptReviewNote(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateAttemptReviewNoteInput,
  ): Promise<AttemptReviewNoteType> {
    return this.service.createNote(
      currentUser.companyId,
      currentUser.id,
      input,
    );
  }

  @Mutation(() => AttemptReviewNoteType)
  @UseGuards(GqlAuthGuard)
  updateAttemptReviewNote(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: UpdateAttemptReviewNoteInput,
  ): Promise<AttemptReviewNoteType> {
    return this.service.updateNote(
      currentUser.companyId,
      currentUser.id,
      input,
    );
  }

  @Query(() => AttemptShareLinkType, { nullable: true })
  @UseGuards(GqlAuthGuard)
  attemptShareLink(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<AttemptShareLinkType | null> {
    return this.shareService.getActiveShareLink(
      currentUser.companyId,
      Number(attemptId),
    );
  }

  @Query(() => AttemptReviewDecisionHistoryPayloadType)
  @UseGuards(GqlAuthGuard)
  attemptReviewDecisionHistory(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
    @Args('filters', { nullable: true })
    filters?: AttemptReviewDecisionHistoryFilterInput,
  ): Promise<AttemptReviewDecisionHistoryPayloadType> {
    return this.service.listDecisionAuditHistory(
      currentUser.companyId,
      attemptId,
      filters ?? { page: 1, pageSize: 20 },
    );
  }

  @Mutation(() => AttemptShareLinkType)
  @UseGuards(GqlAuthGuard)
  createAttemptShareLink(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('input') input: CreateAttemptShareLinkInput,
  ): Promise<AttemptShareLinkType> {
    return this.shareService.createShareLink({
      companyId: currentUser.companyId,
      userId: currentUser.id,
      attemptId: Number(input.attemptId),
      expiresInDays: input.expiresInDays,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  revokeAttemptShareLink(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<boolean> {
    return this.shareService.revokeShareLink(
      currentUser.companyId,
      Number(attemptId),
    );
  }
}
