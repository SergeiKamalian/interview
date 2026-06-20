import { BadRequestException } from '@nestjs/common';
import { AttemptShareService } from './attempt-share.service';
import type { AttemptShareRepository } from '../repositories/attempt-share.repository';
import type { FinalEvaluationRepository } from '../../ai-evaluation/repositories/final-evaluation.repository';

describe('AttemptShareService', () => {
  function createService() {
    const findAttemptContext = jest.fn().mockResolvedValue({
      attemptId: 42,
      companyId: 1,
      interviewId: 10,
      status: 'completed',
      isPreview: false,
      completedAt: new Date('2026-06-20T12:00:00Z'),
      candidateName: 'Alice',
      interviewTitle: 'Backend interview',
      jobRole: 'Backend engineer',
      interviewLevel: 'middle',
    });
    const findActiveTokenByAttempt = jest.fn().mockResolvedValue(null);
    const revokeActiveTokens = jest.fn().mockResolvedValue(1);
    const createToken = jest.fn().mockResolvedValue({
      id: 1,
      companyId: 1,
      interviewAttemptId: 42,
      token: 'abc123token',
      expiresAt: new Date('2026-07-20T12:00:00Z'),
      revokedAt: null,
      createdBy: 5,
      createdAt: new Date('2026-06-21T10:00:00Z'),
    });
    const findAttemptContextByToken = jest.fn();
    const findByAttemptId = jest.fn().mockResolvedValue({
      totalScore: 7.5,
      hireRecommendation: 'invite',
      achievedLevel: 'middle',
      summary: 'Strong backend fundamentals.',
      strengths: ['API design'],
      weaknesses: ['Caching'],
      risks: ['Limited leadership examples'],
      needsManualReview: false,
    });

    const shareRepository = {
      findAttemptContext,
      findActiveTokenByAttempt,
      revokeActiveTokens,
      createToken,
      findAttemptContextByToken,
    } as unknown as AttemptShareRepository;

    const finalEvaluationRepository = {
      findByAttemptId,
    } as unknown as FinalEvaluationRepository;

    return {
      service: new AttemptShareService(
        shareRepository,
        finalEvaluationRepository,
      ),
      findAttemptContext,
      revokeActiveTokens,
      createToken,
      findAttemptContextByToken,
      findByAttemptId,
    };
  }

  it('creates a share link and revokes previous tokens', async () => {
    const { service, revokeActiveTokens, createToken } = createService();

    const result = await service.createShareLink({
      companyId: 1,
      userId: 5,
      attemptId: 42,
      expiresInDays: 30,
    });

    expect(revokeActiveTokens).toHaveBeenCalledWith(1, 42);
    expect(createToken).toHaveBeenCalledWith({
      companyId: 1,
      attemptId: 42,
      createdBy: 5,
      expiresAt: expect.any(Date),
    });
    expect(result.sharePath).toBe('/share/abc123token');
    expect(result.attemptId).toBe('42');
  });

  it('rejects invalid expiry days', async () => {
    const { service } = createService();

    await expect(
      service.createShareLink({
        companyId: 1,
        userId: 5,
        attemptId: 42,
        expiresInDays: 14,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns public summary for a valid token', async () => {
    const { service, findAttemptContextByToken, findByAttemptId } =
      createService();

    findAttemptContextByToken.mockResolvedValue({
      attemptId: 42,
      companyId: 1,
      interviewId: 10,
      status: 'completed',
      isPreview: false,
      completedAt: new Date('2026-06-20T12:00:00Z'),
      candidateName: 'Alice',
      interviewTitle: 'Backend interview',
      jobRole: 'Backend engineer',
      interviewLevel: 'middle',
      tokenRecord: {
        id: 1,
        companyId: 1,
        interviewAttemptId: 42,
        token: 'abc123token',
        expiresAt: null,
        revokedAt: null,
        createdBy: 5,
        createdAt: new Date('2026-06-21T10:00:00Z'),
      },
    });

    const summary = await service.getPublicSummary('abc123token');

    expect(findByAttemptId).toHaveBeenCalledWith(1, 42);
    expect(summary.candidateName).toBe('Alice');
    expect(summary.totalScore).toBe(7.5);
    expect(summary.strengths).toEqual(['API design']);
  });
});
