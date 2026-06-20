import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FinalEvaluationRepository } from '../../ai-evaluation/repositories/final-evaluation.repository';
import type { AttemptShareLinkType } from '../graphql/attempt-review.type';
import { AttemptShareRepository } from '../repositories/attempt-share.repository';

export type PublicAttemptShareSummary = {
  candidateName: string;
  interviewTitle: string;
  jobRole: string;
  interviewLevel: string;
  completedAt: number | null;
  totalScore: number | null;
  hireRecommendation: string | null;
  achievedLevel: string | null;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  needsManualReview: boolean;
};

const ALLOWED_EXPIRY_DAYS = new Set([7, 30]);

@Injectable()
export class AttemptShareService {
  constructor(
    private readonly shareRepository: AttemptShareRepository,
    private readonly finalEvaluationRepository: FinalEvaluationRepository,
  ) {}

  async getActiveShareLink(
    companyId: number,
    attemptId: number,
  ): Promise<AttemptShareLinkType | null> {
    await this.assertShareableAttempt(companyId, attemptId);

    const token = await this.shareRepository.findActiveTokenByAttempt(
      companyId,
      attemptId,
    );

    if (!token) {
      return null;
    }

    return this.toShareLinkPayload(String(attemptId), token.token, token.expiresAt);
  }

  async createShareLink(input: {
    companyId: number;
    userId: number;
    attemptId: number;
    expiresInDays?: number | null;
  }): Promise<AttemptShareLinkType> {
    await this.assertShareableAttempt(input.companyId, input.attemptId);

    const expiresAt = this.resolveExpiresAt(input.expiresInDays);

    await this.shareRepository.revokeActiveTokens(
      input.companyId,
      input.attemptId,
    );

    const token = await this.shareRepository.createToken({
      companyId: input.companyId,
      attemptId: input.attemptId,
      createdBy: input.userId,
      expiresAt,
    });

    return this.toShareLinkPayload(
      String(input.attemptId),
      token.token,
      token.expiresAt,
    );
  }

  async revokeShareLink(companyId: number, attemptId: number): Promise<boolean> {
    await this.assertShareableAttempt(companyId, attemptId);

    const affected = await this.shareRepository.revokeActiveTokens(
      companyId,
      attemptId,
    );

    return affected > 0;
  }

  async getPublicSummary(token: string): Promise<PublicAttemptShareSummary> {
    const context = await this.shareRepository.findAttemptContextByToken(token);

    if (!context) {
      throw new NotFoundException('Share link not found');
    }

    const evaluation = await this.finalEvaluationRepository.findByAttemptId(
      context.companyId,
      context.attemptId,
    );

    return {
      candidateName: context.candidateName,
      interviewTitle: context.interviewTitle,
      jobRole: context.jobRole,
      interviewLevel: context.interviewLevel,
      completedAt: context.completedAt
        ? Math.floor(context.completedAt.getTime() / 1000)
        : null,
      totalScore: evaluation ? evaluation.totalScore : null,
      hireRecommendation: evaluation?.hireRecommendation ?? null,
      achievedLevel: evaluation?.achievedLevel ?? null,
      summary: evaluation?.summary ?? null,
      strengths: evaluation?.strengths ?? [],
      weaknesses: evaluation?.weaknesses ?? [],
      risks: evaluation?.risks ?? [],
      needsManualReview: evaluation?.needsManualReview ?? false,
    };
  }

  private async assertShareableAttempt(companyId: number, attemptId: number) {
    const context = await this.shareRepository.findAttemptContext(
      companyId,
      attemptId,
    );

    if (!context) {
      throw new NotFoundException('Interview attempt not found');
    }

    if (context.isPreview) {
      throw new BadRequestException('Preview attempts cannot be shared');
    }

    if (context.status !== 'completed') {
      throw new BadRequestException('Only completed attempts can be shared');
    }
  }

  private resolveExpiresAt(expiresInDays?: number | null): Date | null {
    if (expiresInDays === null || expiresInDays === undefined) {
      return null;
    }

    if (!ALLOWED_EXPIRY_DAYS.has(expiresInDays)) {
      throw new BadRequestException('expiresInDays must be 7 or 30');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return expiresAt;
  }

  private toShareLinkPayload(
    attemptId: string,
    token: string,
    expiresAt: Date | null,
  ): AttemptShareLinkType {
    return {
      attemptId,
      token,
      sharePath: `/share/${token}`,
      expiresAt: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : null,
    };
  }
}
