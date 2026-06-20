import { CompanyReviewQueueService } from './company-review-queue.service';
import type {
  CompanyReviewQueueRepository,
  CompanyReviewQueueRow,
} from '../repositories/company-review-queue.repository';

function buildRow(
  overrides: Partial<CompanyReviewQueueRow> = {},
): CompanyReviewQueueRow {
  return {
    attempt_id: 101,
    candidate_id: 55,
    candidate_name: 'Ivan Petrov',
    candidate_email: 'ivan@example.com',
    interview_id: 31,
    interview_title: 'Frontend interview',
    job_role: 'Frontend Developer',
    completed_at: new Date('2026-06-20T12:00:00Z'),
    final_evaluation_id: 88,
    total_score: '8.40',
    hire_recommendation: 'invite',
    achieved_level: 'middle',
    achieved_level_method: 'evidence',
    needs_manual_review: 1,
    shortlist_status: 'shortlisted',
    review_status: null,
    ai_assessment_verdict: null,
    company_decision: null,
    reviewed_at: null,
    ...overrides,
  } as CompanyReviewQueueRow;
}

describe('CompanyReviewQueueService', () => {
  function createService(rows: CompanyReviewQueueRow[]) {
    const listForCompany = jest.fn().mockResolvedValue({
      items: rows,
      total: rows.length,
    });
    const repository = {
      listForCompany,
    } as unknown as CompanyReviewQueueRepository;

    return {
      service: new CompanyReviewQueueService(repository),
      listForCompany,
    };
  }

  it('forwards tenant company id and normalized pagination filters', async () => {
    const { service, listForCompany } = createService([]);

    await service.listReviewQueue(42, {
      page: 0,
      pageSize: 500,
      sort: 'completed_at',
      sortDirection: 'desc',
    });

    expect(listForCompany).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ page: 1, pageSize: 100 }),
    );
  });

  it('maps rows to GraphQL shape with ready evaluation status', async () => {
    const { service } = createService([buildRow()]);

    const result = await service.listReviewQueue(42, {
      page: 1,
      pageSize: 20,
      sort: 'completed_at',
      sortDirection: 'desc',
    });

    expect(result).toEqual({
      items: [
        {
          attemptId: '101',
          candidateId: '55',
          candidateName: 'Ivan Petrov',
          candidateEmail: 'ivan@example.com',
          interviewId: '31',
          interviewTitle: 'Frontend interview',
          jobRole: 'Frontend Developer',
          completedAt: Math.floor(
            new Date('2026-06-20T12:00:00Z').getTime() / 1000,
          ),
          evaluationStatus: 'ready',
          totalScore: 8.4,
          hireRecommendation: 'invite',
          achievedLevel: 'middle',
          achievedLevelMethod: 'evidence',
          needsManualReview: true,
          shortlistStatus: 'shortlisted',
          reviewStatus: 'pending',
          aiAssessmentVerdict: 'pending',
          companyDecision: 'pending',
          reviewedAt: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
  });

  it('marks completed attempts without final evaluation as pending', async () => {
    const { service } = createService([
      buildRow({
        final_evaluation_id: null,
        total_score: null,
        hire_recommendation: null,
        achieved_level: null,
        achieved_level_method: null,
        needs_manual_review: null,
        completed_at: null,
      }),
    ]);

    const [item] = (
      await service.listReviewQueue(42, {
        page: 1,
        pageSize: 20,
        sort: 'completed_at',
        sortDirection: 'desc',
      })
    ).items;

    expect(item.evaluationStatus).toBe('evaluation_pending');
    expect(item.totalScore).toBeNull();
    expect(item.hireRecommendation).toBeNull();
    expect(item.achievedLevel).toBeNull();
    expect(item.needsManualReview).toBe(false);
    expect(item.completedAt).toBeNull();
  });
});
