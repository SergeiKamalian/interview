import { AttemptReviewService } from './attempt-review.service';
import type { AttemptReviewNotesRepository } from '../repositories/attempt-review-notes.repository';
import type { AttemptReviewRepository } from '../repositories/attempt-review.repository';

describe('AttemptReviewService', () => {
  function createService() {
    const markReviewStarted = jest.fn().mockResolvedValue({
      reviewStatus: 'in_review',
      aiAssessmentVerdict: 'pending',
      companyDecision: 'pending',
      reviewedAt: null,
    });
    const setAiVerdict = jest.fn().mockResolvedValue({
      reviewStatus: 'reviewed',
      aiAssessmentVerdict: 'agree',
      companyDecision: 'pending',
      reviewedAt: new Date('2026-06-21T10:00:00Z'),
    });
    const setCompanyDecision = jest.fn().mockResolvedValue({
      reviewStatus: 'reviewed',
      aiAssessmentVerdict: 'pending',
      companyDecision: 'shortlist',
      reviewedAt: new Date('2026-06-21T10:05:00Z'),
    });
    const listForAttempt = jest.fn().mockResolvedValue([
      {
        id: 1,
        attemptId: 102,
        body: 'First note',
        authorId: 7,
        authorName: 'Alice',
        createdAt: new Date('2026-06-21T09:00:00Z'),
        updatedAt: new Date('2026-06-21T09:00:00Z'),
      },
    ]);
    const create = jest.fn().mockResolvedValue({
      id: 2,
      attemptId: 102,
      body: 'Second note',
      authorId: 7,
      authorName: 'Alice',
      createdAt: new Date('2026-06-21T09:30:00Z'),
      updatedAt: new Date('2026-06-21T09:30:00Z'),
    });
    const update = jest.fn().mockResolvedValue({
      id: 1,
      attemptId: 102,
      body: 'Updated note',
      authorId: 7,
      authorName: 'Alice',
      createdAt: new Date('2026-06-21T09:00:00Z'),
      updatedAt: new Date('2026-06-21T10:00:00Z'),
    });

    const repository = {
      markReviewStarted,
      setAiVerdict,
      setCompanyDecision,
      listDecisionAuditEvents: jest.fn().mockResolvedValue({
        total: 2,
        items: [
          {
            eventId: 'review:1',
            source: 'attempt_review',
            action: 'ai_verdict_set',
            previousValue: 'pending',
            newValue: 'agree',
            reason: null,
            actorEmail: 'hr@example.com',
            actorName: 'HR User',
            occurredAt: 1718964000,
          },
          {
            eventId: 'shortlist:3',
            source: 'shortlist',
            action: 'added',
            previousValue: null,
            newValue: null,
            reason: null,
            actorEmail: 'hr@example.com',
            actorName: 'HR User',
            occurredAt: 1718963700,
          },
        ],
      }),
    } as unknown as AttemptReviewRepository;
    const notesRepository = {
      listForAttempt,
      create,
      update,
    } as unknown as AttemptReviewNotesRepository;

    return {
      service: new AttemptReviewService(repository, notesRepository),
      markReviewStarted,
      setAiVerdict,
      setCompanyDecision,
      listForAttempt,
      create,
      update,
      repository,
    };
  }

  it('marks review started for tenant attempt', async () => {
    const { service, markReviewStarted } = createService();

    const result = await service.markReviewStarted({
      companyId: 1,
      attemptId: 102,
      userId: 7,
    });

    expect(markReviewStarted).toHaveBeenCalledWith({
      companyId: 1,
      attemptId: 102,
      userId: 7,
    });
    expect(result).toEqual({
      attemptId: '102',
      reviewStatus: 'in_review',
      aiAssessmentVerdict: 'pending',
      companyDecision: 'pending',
      reviewedAt: null,
    });
  });

  it('sets AI verdict and maps reviewedAt epoch seconds', async () => {
    const { service, setAiVerdict } = createService();

    const result = await service.setAiVerdict(1, 7, {
      attemptId: '105',
      verdict: 'agree' as never,
      reason: 'Looks solid',
    });

    expect(setAiVerdict).toHaveBeenCalledWith({
      companyId: 1,
      attemptId: 105,
      userId: 7,
      verdict: 'agree',
      reason: 'Looks solid',
    });
    expect(result.reviewStatus).toBe('reviewed');
    expect(result.aiAssessmentVerdict).toBe('agree');
    expect(result.reviewedAt).toBe(
      Math.floor(new Date('2026-06-21T10:00:00Z').getTime() / 1000),
    );
  });

  it('sets company decision', async () => {
    const { service, setCompanyDecision } = createService();

    const result = await service.setCompanyDecision(1, 7, {
      attemptId: '108',
      decision: 'reject' as never,
    });

    expect(setCompanyDecision).toHaveBeenCalledWith({
      companyId: 1,
      attemptId: 108,
      userId: 7,
      decision: 'reject',
      reason: undefined,
    });
    expect(result.companyDecision).toBe('shortlist');
  });

  it('lists notes for attempt', async () => {
    const { service, listForAttempt } = createService();

    const result = await service.listNotes(1, 102);

    expect(listForAttempt).toHaveBeenCalledWith(1, 102);
    expect(result).toEqual([
      {
        id: '1',
        attemptId: '102',
        body: 'First note',
        authorId: '7',
        authorName: 'Alice',
        createdAt: Math.floor(new Date('2026-06-21T09:00:00Z').getTime() / 1000),
        updatedAt: Math.floor(new Date('2026-06-21T09:00:00Z').getTime() / 1000),
      },
    ]);
  });

  it('creates note', async () => {
    const { service, create } = createService();

    const result = await service.createNote(1, 7, {
      attemptId: '102',
      body: 'Second note',
    });

    expect(create).toHaveBeenCalledWith({
      companyId: 1,
      attemptId: 102,
      userId: 7,
      body: 'Second note',
    });
    expect(result.body).toBe('Second note');
  });

  it('updates note', async () => {
    const { service, update } = createService();

    const result = await service.updateNote(1, 7, {
      noteId: '1',
      body: 'Updated note',
    });

    expect(update).toHaveBeenCalledWith({
      companyId: 1,
      noteId: 1,
      userId: 7,
      body: 'Updated note',
    });
    expect(result.body).toBe('Updated note');
  });

  it('lists decision audit history with mapped sources', async () => {
    const { service, repository } = createService();

    const result = await service.listDecisionAuditHistory(1, '108', {
      page: 1,
      pageSize: 20,
    });

    expect(repository.listDecisionAuditEvents).toHaveBeenCalledWith({
      companyId: 1,
      attemptId: 108,
      page: 1,
      pageSize: 20,
    });
    expect(result.total).toBe(2);
    expect(result.items[0].source).toBe('attempt_review');
    expect(result.items[1].source).toBe('shortlist');
  });
});
