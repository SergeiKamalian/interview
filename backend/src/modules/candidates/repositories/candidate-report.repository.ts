import { Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { FinalEvaluationEntity } from '../../ai-evaluation/entities/final-evaluation.entity';
import { FinalEvaluationRepository } from '../../ai-evaluation/repositories/final-evaluation.repository';

interface CandidateRow extends RowDataPacket {
  id: number;
  company_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
}

interface HistoryRow extends RowDataPacket {
  attempt_id: number;
  interview_id: number;
  interview_title: string;
  job_role: string;
  status: string;
  completed_at: Date | null;
  total_score: string | null;
}

interface ShortlistRow extends RowDataPacket {
  status: string;
  reason: string | null;
}

@Injectable()
export class CandidateReportRepository {
  constructor(
    private readonly database: DatabaseService,
    private readonly finalEvaluationRepository: FinalEvaluationRepository,
  ) {}

  async getReport(companyId: number, candidateId: number) {
    const candidateRows = await this.database.query<CandidateRow[]>(
      `SELECT id, company_id, full_name, email, phone, linkedin_url, github_url
       FROM candidates
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [candidateId, companyId],
    );

    const candidate = candidateRows[0];
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const history = await this.database.query<HistoryRow[]>(
      `SELECT ia.id AS attempt_id,
              ia.interview_id,
              i.title AS interview_title,
              i.job_role,
              ia.status,
              ia.completed_at,
              fe.total_score
       FROM interview_attempts ia
       INNER JOIN interviews i ON i.id = ia.interview_id
       LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
       WHERE ia.candidate_id = ? AND ia.company_id = ?
       ORDER BY ia.created_at DESC`,
      [candidateId, companyId],
    );

    const shortlistRows = await this.database.query<ShortlistRow[]>(
      `SELECT status, reason
       FROM candidate_shortlist
       WHERE candidate_id = ? AND company_id = ?
       LIMIT 1`,
      [candidateId, companyId],
    );

    const latestCompleted = history.find((item) => item.status === 'completed');
    let latestFinalEvaluation: FinalEvaluationEntity | null = null;
    if (latestCompleted) {
      latestFinalEvaluation = await this.finalEvaluationRepository.findByAttemptId(
        companyId,
        latestCompleted.attempt_id,
      );
    }

    return {
      candidate,
      history,
      shortlist: shortlistRows[0] ?? null,
      latestFinalEvaluation,
    };
  }
}
