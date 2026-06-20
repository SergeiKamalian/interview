import { Injectable } from '@nestjs/common';
import type {
  AchievedLevelMethodEnum,
  HireRecommendationEnum,
} from '../../ai-evaluation/graphql/final-evaluation.type';
import type { QuestionLevelEnum } from '../../question-bank/types/question.type';
import type { CompanyReviewQueueFilterInput } from '../graphql/company-review-queue.input';
import type { CompanyReviewQueuePayloadType } from '../graphql/company-review-queue.type';
import {
  AiAssessmentVerdictEnum,
  AttemptReviewStatusEnum,
  CompanyAttemptDecisionEnum,
} from '../../attempt-review/graphql/attempt-review.type';
import { CompanyReviewQueueRepository } from '../repositories/company-review-queue.repository';

@Injectable()
export class CompanyReviewQueueService {
  constructor(private readonly repository: CompanyReviewQueueRepository) {}

  async listReviewQueue(
    companyId: number,
    filters: CompanyReviewQueueFilterInput,
  ): Promise<CompanyReviewQueuePayloadType> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const { items, total } = await this.repository.listForCompany(companyId, {
      ...filters,
      page,
      pageSize,
    });

    return {
      items: items.map((item) => ({
        attemptId: String(item.attempt_id),
        candidateId: String(item.candidate_id),
        candidateName: item.candidate_name,
        candidateEmail: item.candidate_email,
        interviewId: String(item.interview_id),
        interviewTitle: item.interview_title,
        jobRole: item.job_role,
        completedAt: item.completed_at
          ? Math.floor(item.completed_at.getTime() / 1000)
          : null,
        evaluationStatus:
          item.final_evaluation_id != null ? 'ready' : 'evaluation_pending',
        totalScore: item.total_score != null ? Number(item.total_score) : null,
        hireRecommendation: item.hire_recommendation
          ? (item.hire_recommendation as HireRecommendationEnum)
          : null,
        achievedLevel: item.achieved_level
          ? (item.achieved_level as QuestionLevelEnum)
          : null,
        achievedLevelMethod: item.achieved_level_method
          ? (item.achieved_level_method as AchievedLevelMethodEnum)
          : null,
        needsManualReview: item.needs_manual_review === 1,
        shortlistStatus: item.shortlist_status,
        reviewStatus: (item.review_status ??
          'pending') as AttemptReviewStatusEnum,
        aiAssessmentVerdict: (item.ai_assessment_verdict ??
          'pending') as AiAssessmentVerdictEnum,
        companyDecision: (item.company_decision ??
          'pending') as CompanyAttemptDecisionEnum,
        reviewedAt: item.reviewed_at
          ? Math.floor(item.reviewed_at.getTime() / 1000)
          : null,
      })),
      total,
      page,
      pageSize,
    };
  }
}
