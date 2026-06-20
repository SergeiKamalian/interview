import { Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { FinalEvaluationEntity } from '../../ai-evaluation/entities/final-evaluation.entity';
import { FinalEvaluationRepository } from '../../ai-evaluation/repositories/final-evaluation.repository';
import type { InterviewStatus } from '../../interview-core/types/interview-status.enum';
import type { QuestionLevel } from '../../question-bank/types/question-level.enum';

interface InterviewRow extends RowDataPacket {
  id: number;
  company_id: number;
  title: string;
  job_role: string;
  profession_id: number | null;
  profession_name: string | null;
  level: QuestionLevel;
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
  achieved_level: string | null;
  achieved_level_method: string | null;
  needs_manual_review: number | null;
  shortlist_status: string;
  review_status: string | null;
  ai_assessment_verdict: string | null;
  company_decision: string | null;
  reviewed_at: Date | null;
  has_team_notes: number;
}

interface InterviewQuestionRow extends RowDataPacket {
  id: number;
  sort_order: number;
  question_text: string;
  level: QuestionLevel;
  difficulty: string;
  topic_name: string | null;
  max_score: string;
}

interface InterviewSkillRow extends RowDataPacket {
  name: string;
}

interface InterviewDetailsData {
  interview: InterviewRow;
  attempts: AttemptRow[];
  questions: InterviewQuestionRow[];
  skills: string[];
  primaryAttempt: AttemptRow | null;
  primaryFinalEvaluation: FinalEvaluationEntity | null;
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
      `SELECT i.id,
              i.company_id,
              i.title,
              i.job_role,
              i.profession_id,
              p.name AS profession_name,
              i.level,
              i.status,
              i.question_count,
              i.public_token,
              i.created_at
       FROM interviews i
       LEFT JOIN professions p ON p.id = i.profession_id
       WHERE i.id = ? AND i.company_id = ?
       LIMIT 1`,
      [interviewId, companyId],
    );

    return rows[0] ?? null;
  }

  async listQuestionsForInterview(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewQuestionRow[]> {
    return this.database.query<InterviewQuestionRow[]>(
      `SELECT iq.id,
              iq.sort_order,
              iq.question_text,
              iq.level,
              iq.difficulty,
              iq.topic_name,
              iq.max_score
       FROM interview_questions iq
       INNER JOIN interviews i ON i.id = iq.interview_id
       WHERE iq.interview_id = ? AND i.company_id = ?
       ORDER BY iq.sort_order ASC`,
      [interviewId, companyId],
    );
  }

  async listSkillsForInterview(
    companyId: number,
    interviewId: number,
  ): Promise<string[]> {
    const rows = await this.database.query<InterviewSkillRow[]>(
      `SELECT DISTINCT s.name
       FROM interview_questions iq
       INNER JOIN interviews i ON i.id = iq.interview_id
       INNER JOIN question_skills qs ON qs.question_id = iq.source_question_id
       INNER JOIN skills s ON s.id = qs.skill_id
       WHERE iq.interview_id = ? AND i.company_id = ?
       ORDER BY s.name ASC`,
      [interviewId, companyId],
    );

    return rows.map((row) => row.name);
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
              fe.hire_recommendation,
              fe.achieved_level,
              fe.achieved_level_method,
              fe.needs_manual_review,
              COALESCE(cs.status, 'none') AS shortlist_status,
              iar.review_status,
              iar.ai_assessment_verdict,
              iar.company_decision,
              iar.reviewed_at,
              EXISTS(
                SELECT 1
                FROM interview_attempt_review_notes n
                WHERE n.company_id = ia.company_id
                  AND n.interview_attempt_id = ia.id
              ) AS has_team_notes
       FROM interview_attempts ia
       INNER JOIN candidates c ON c.id = ia.candidate_id
       LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id
       LEFT JOIN candidate_shortlist cs ON cs.candidate_id = c.id AND cs.company_id = ia.company_id
       LEFT JOIN interview_attempt_reviews iar
         ON iar.interview_attempt_id = ia.id AND iar.company_id = ia.company_id
       WHERE ia.company_id = ? AND ia.interview_id = ? AND ia.is_preview = 0
       ORDER BY ia.created_at DESC`,
      [companyId, interviewId],
    );
  }

  async getInterviewDetails(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewDetailsData> {
    const interview = await this.findInterviewForCompany(
      companyId,
      interviewId,
    );
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const [attempts, questions, skills] = await Promise.all([
      this.listAttemptsForInterview(companyId, interviewId),
      this.listQuestionsForInterview(companyId, interviewId),
      this.listSkillsForInterview(companyId, interviewId),
    ]);
    const primaryAttempt =
      attempts.find((a) => a.status === 'completed') ?? attempts[0] ?? null;

    let primaryFinalEvaluation: FinalEvaluationEntity | null = null;
    if (primaryAttempt) {
      primaryFinalEvaluation =
        await this.finalEvaluationRepository.findByAttemptId(
          companyId,
          primaryAttempt.id,
        );
    }

    return {
      interview,
      attempts,
      questions,
      skills,
      primaryAttempt,
      primaryFinalEvaluation,
    };
  }
}
