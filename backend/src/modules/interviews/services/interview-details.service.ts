import { Injectable } from '@nestjs/common';
import { mapFinalEvaluationToGraphql } from '../../ai-evaluation/ai-evaluation.mapper';
import { HireRecommendationEnum } from '../../ai-evaluation/graphql/final-evaluation.type';
import type { AttemptStatusEnum } from '../../interview-core/types/interview.type';
import { InterviewStatusEnum } from '../../interview-core/types/interview.type';
import type { InterviewDetailsType } from '../graphql/interview-details.type';
import { InterviewDetailsRepository } from '../repositories/interview-details.repository';

@Injectable()
export class InterviewDetailsService {
  constructor(private readonly repository: InterviewDetailsRepository) {}

  async getDetails(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewDetailsType> {
    const { interview, attempts, primaryAttempt, primaryFinalEvaluation } =
      await this.repository.getInterviewDetails(companyId, interviewId);

    const publicUrl = `/i/${interview.public_token}`;

    const mappedAttempts = attempts.map((attempt) => ({
      attemptId: String(attempt.id),
      candidateId: String(attempt.candidate_id),
      candidateName: attempt.candidate_name,
      candidateEmail: attempt.candidate_email,
      status: attempt.status as AttemptStatusEnum,
      startedAt: attempt.started_at
        ? Math.floor(attempt.started_at.getTime() / 1000)
        : null,
      completedAt: attempt.completed_at
        ? Math.floor(attempt.completed_at.getTime() / 1000)
        : null,
      overallScore:
        attempt.total_score != null ? Number(attempt.total_score) : null,
      hireRecommendation: attempt.hire_recommendation
        ? (attempt.hire_recommendation as HireRecommendationEnum)
        : null,
      evaluationStatus: this.resolveAttemptEvaluationStatus(
        attempt.status,
        attempt.total_score,
      ),
    }));

    const evaluationStatus = primaryAttempt
      ? this.resolveAttemptEvaluationStatus(
          primaryAttempt.status,
          primaryAttempt.total_score,
        )
      : 'no_attempts';

    return {
      id: String(interview.id),
      title: interview.title,
      jobRole: interview.job_role,
      status: interview.status as InterviewStatusEnum,
      questionCount: interview.question_count,
      publicUrl,
      createdAt: Math.floor(interview.created_at.getTime() / 1000),
      attempts: mappedAttempts,
      primaryFinalEvaluation: primaryFinalEvaluation
        ? mapFinalEvaluationToGraphql(
            primaryFinalEvaluation,
            primaryFinalEvaluation.rawResponse?.deterministicScore,
            interview.level,
          )
        : null,
      evaluationStatus,
    };
  }

  private resolveAttemptEvaluationStatus(
    status: string,
    totalScore: string | null,
  ): string {
    if (status !== 'completed') {
      return 'evaluation_pending';
    }

    return totalScore != null ? 'ready' : 'evaluation_pending';
  }
}
