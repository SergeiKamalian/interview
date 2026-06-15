import { Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { FinalEvaluationEntity } from '../../ai-evaluation/entities/final-evaluation.entity';
import { FinalEvaluationRepository } from '../../ai-evaluation/repositories/final-evaluation.repository';
import type { InterviewStatus } from '../../interview-core/types/interview-status.enum';

interface InterviewRow extends RowDataPacket {
  id: number;
  company_id: number;
  title: string;
  job_role: string;
  status: InterviewStatus;
  question_count: number;
  public_token: string;
  created_at: Date;
}

interface AttemptRow extends RowDataPacket {
  id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  status: string;
  started_at: Date | null;
  completed_at: Date | null;
  total_score: string | null;
  hire_recommendation: string | null;
}

@Injectable()
export class InterviewDetailsRepository {
  constructor(
    private readonly database: DatabaseService,
    private readonly finalEvaluationRepository: FinalEvaluationRepository,
  ) {}

  async findInterviewForCompany(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewRow | null> {
    const rows = await this.database.query<InterviewRow[]>(
      `SELECT id, company_id, title, job_role, status, question_count, public_token, created_at
       FROM interviews
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [interviewId, companyId],
    );

    return rows[0] ?? null;
  }

  async listAttemptsForInterview(
    companyId: number,
    interviewId: number,
  ): Promise<AttemptRow[]> {
    return this.database.query<AttemptRow[]>(
      `SELECT ia.id,
              ia.candidate_id,
              c.full_name AS candidate_name,
              c.email AS candidate_email,
              ia.status,
              ia.started_at,
              ia.completed_at,
              fe.total_score,
              fe.hire_recommendation
       FROM interview_attempts ia
       INNER JOIN candidates c ON c.id = ia.candidate_id
       LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
       WHERE ia.company_id = ? AND ia.interview_id = ?
       ORDER BY ia.created_at DESC`,
      [companyId, interviewId],
    );
  }

  async getInterviewDetails(companyId: number, interviewId: number) {
    const interview = await this.findInterviewForCompany(companyId, interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const attempts = await this.listAttemptsForInterview(companyId, interviewId);
    const primaryAttempt =
      attempts.find((a) => a.status === 'completed') ?? attempts[0] ?? null;

    let primaryFinalEvaluation: FinalEvaluationEntity | null = null;
    if (primaryAttempt) {
      primaryFinalEvaluation = await this.finalEvaluationRepository.findByAttemptId(
        companyId,
        primaryAttempt.id,
      );
    }

    return { interview, attempts, primaryAttempt, primaryFinalEvaluation };
  }
}
