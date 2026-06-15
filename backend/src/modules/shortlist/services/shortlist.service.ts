import { Injectable } from '@nestjs/common';
import {
  ShortlistActionPayloadType,
  ShortlistStatusEnum,
} from '../graphql/shortlist.type';
import { ShortlistRepository } from '../repositories/shortlist.repository';

@Injectable()
export class ShortlistService {
  constructor(private readonly repository: ShortlistRepository) {}

  async addToShortlist(input: {
    companyId: number;
    candidateId: number;
    userId: number;
    reason?: string | null;
  }): Promise<ShortlistActionPayloadType> {
    await this.repository.assertCandidateInCompany(input.companyId, input.candidateId);
    await this.repository.upsertShortlist({
      companyId: input.companyId,
      candidateId: input.candidateId,
      status: 'shortlisted',
      reason: input.reason ?? null,
      createdBy: input.userId,
    });
    await this.repository.appendEvent({
      companyId: input.companyId,
      candidateId: input.candidateId,
      action: 'added',
      reason: input.reason ?? null,
      createdBy: input.userId,
    });

    return {
      candidateId: String(input.candidateId),
      status: ShortlistStatusEnum.shortlisted,
      reason: input.reason ?? null,
    };
  }

  async removeFromShortlist(input: {
    companyId: number;
    candidateId: number;
    userId: number;
    reason?: string | null;
  }): Promise<ShortlistActionPayloadType> {
    await this.repository.assertCandidateInCompany(input.companyId, input.candidateId);
    await this.repository.upsertShortlist({
      companyId: input.companyId,
      candidateId: input.candidateId,
      status: 'removed',
      reason: input.reason ?? null,
      createdBy: input.userId,
    });
    await this.repository.appendEvent({
      companyId: input.companyId,
      candidateId: input.candidateId,
      action: 'removed',
      reason: input.reason ?? null,
      createdBy: input.userId,
    });

    return {
      candidateId: String(input.candidateId),
      status: ShortlistStatusEnum.removed,
      reason: input.reason ?? null,
    };
  }

  async addRecruiterNote(input: {
    companyId: number;
    candidateId: number;
    userId: number;
    reason: string;
  }): Promise<ShortlistActionPayloadType> {
    await this.repository.assertCandidateInCompany(input.companyId, input.candidateId);
    await this.repository.appendEvent({
      companyId: input.companyId,
      candidateId: input.candidateId,
      action: 'note_added',
      reason: input.reason,
      createdBy: input.userId,
    });

    return {
      candidateId: String(input.candidateId),
      status: ShortlistStatusEnum.shortlisted,
      reason: input.reason,
    };
  }
}
