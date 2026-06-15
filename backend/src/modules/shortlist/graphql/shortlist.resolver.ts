import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import type { AuthUserContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { ShortlistActionPayloadType } from './shortlist.type';
import { ShortlistService } from '../services/shortlist.service';

@Resolver()
export class ShortlistResolver {
  constructor(private readonly service: ShortlistService) {}

  @Mutation(() => ShortlistActionPayloadType)
  @UseGuards(GqlAuthGuard)
  addCandidateToShortlist(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('candidateId', { type: () => ID }) candidateId: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<ShortlistActionPayloadType> {
    return this.service.addToShortlist({
      companyId: currentUser.companyId,
      candidateId: Number(candidateId),
      userId: currentUser.id,
      reason,
    });
  }

  @Mutation(() => ShortlistActionPayloadType)
  @UseGuards(GqlAuthGuard)
  removeCandidateFromShortlist(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('candidateId', { type: () => ID }) candidateId: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<ShortlistActionPayloadType> {
    return this.service.removeFromShortlist({
      companyId: currentUser.companyId,
      candidateId: Number(candidateId),
      userId: currentUser.id,
      reason,
    });
  }

  @Mutation(() => ShortlistActionPayloadType)
  @UseGuards(GqlAuthGuard)
  addCandidateRecruiterNote(
    @CurrentUser() currentUser: AuthUserContext,
    @Args('candidateId', { type: () => ID }) candidateId: string,
    @Args('reason') reason: string,
  ): Promise<ShortlistActionPayloadType> {
    return this.service.addRecruiterNote({
      companyId: currentUser.companyId,
      candidateId: Number(candidateId),
      userId: currentUser.id,
      reason,
    });
  }
}
