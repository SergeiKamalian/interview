import { Injectable } from '@nestjs/common';
import { mapFinalEvaluationToGraphql } from '../../ai-evaluation/ai-evaluation.mapper';
import type { AttemptStatusEnum } from '../../interview-core/types/interview.type';
import type { CandidateReportType } from '../graphql/candidate-report.type';
import { CandidateReportRepository } from '../repositories/candidate-report.repository';

@Injectable()
export class CandidateReportService {
  constructor(private readonly repository: CandidateReportRepository) {}

  async getReport(
    companyId: number,
    candidateId: number,
  ): Promise<CandidateReportType> {
    const {
      candidate,
      history,
      shortlist,
      latestFinalEvaluation,
      latestTargetLevel,
    } = await this.repository.getReport(companyId, candidateId);

    return {
      candidateId: String(candidate.id),
      fullName: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      linkedinUrl: candidate.linkedin_url,
      githubUrl: candidate.github_url,
      shortlistStatus: shortlist?.status ?? 'none',
      shortlistReason: shortlist?.reason ?? null,
      interviewHistory: history.map((item) => ({
        attemptId: String(item.attempt_id),
        interviewId: String(item.interview_id),
        interviewTitle: item.interview_title,
        jobRole: item.job_role,
        status: item.status as AttemptStatusEnum,
        completedAt: item.completed_at
          ? Math.floor(item.completed_at.getTime() / 1000)
          : null,
        totalScore: item.total_score != null ? Number(item.total_score) : null,
      })),
      latestFinalEvaluation: latestFinalEvaluation
        ? mapFinalEvaluationToGraphql(
            latestFinalEvaluation,
            latestFinalEvaluation.rawResponse?.deterministicScore,
            latestTargetLevel,
          )
        : null,
    };
  }
}
