import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type { DbQueryParam } from '../../common/database/database.types';
import type { QuestionWithDetailsEntity } from '../question-bank/entities/question.entity';
import type { QuestionLevel } from '../question-bank/types/question-level.enum';
import type { CandidateEntity } from './entities/candidate.entity';
import type {
  AttemptStatus,
  InterviewAttemptEntity,
} from './entities/interview-attempt.entity';
import type { InterviewEntity } from './entities/interview.entity';
import type {
  InterviewMessageEntity,
  MessageRole,
} from './entities/interview-message.entity';
import type { MessageKind } from './types/message-kind.type';
import type { InterviewQuestionCheckpointEntity } from './entities/interview-question-checkpoint.entity';
import type { InterviewQuestionEntity } from './entities/interview-question.entity';
import type { InterviewStatus } from './types/interview-status.enum';
import { INTERVIEW_PUBLISHED_STATUS } from './interview-core.schema';

interface InterviewRow extends RowDataPacket {
  id: number;
  company_id: number;
  created_by_user_id: number | null;
  title: string;
  job_role: string;
  profession_id: number | null;
  level: QuestionLevel;
  interview_language: string;
  question_count: number;
  job_description: string | null;
  public_token: string;
  status: InterviewStatus;
  is_video_enabled: number;
  interviewer_name: string | null;
  welcome_message_template: string | null;
  created_at: Date;
  updated_at: Date;
}

interface InterviewQuestionRow extends RowDataPacket {
  id: number;
  interview_id: number;
  source_question_id: number | null;
  sort_order: number;
  question_text: string;
  short_answer: string;
  ideal_answer: string;
  max_score: string;
  level: QuestionLevel;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  topic_name: string | null;
  created_at: Date;
}

interface CandidateRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: Date;
  updated_at: Date;
}

interface AttemptRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_id: number;
  candidate_id: number;
  status: AttemptStatus;
  is_shortlisted: number;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface MessageRow extends RowDataPacket {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  interview_question_id: number | null;
  role: MessageRole;
  message_kind: MessageKind | null;
  parent_message_id: number | null;
  target_checkpoint_key: string | null;
  content: string;
  sequence_order: number;
  created_at: Date;
}

interface InterviewQuestionCheckpointRow extends RowDataPacket {
  id: number;
  interview_question_id: number;
  checkpoint_key: string;
  title: string;
  expected: string;
  score: string;
  sort_order: number;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface AttemptCompanyRow extends RowDataPacket {
  company_id: number;
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

export type CreateInterviewData = {
  companyId: number;
  createdByUserId: number;
  title: string;
  jobRole: string;
  level: QuestionLevel;
  interviewLanguage: string;
  questionCount: number;
  jobDescription: string | null;
  professionId: number | null;
  publicToken: string;
  isVideoEnabled: boolean;
  interviewerName?: string | null;
  welcomeMessageTemplate?: string | null;
  questions: QuestionWithDetailsEntity[];
  topicNames: Map<number, string>;
};

@Injectable()
export class InterviewCoreRepository {
  constructor(private readonly database: DatabaseService) {}

  async createInterview(
    data: CreateInterviewData,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewEntity> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO interviews (
         company_id, created_by_user_id, title, job_role, profession_id,
         level, interview_language, question_count, job_description,
         public_token, status, is_video_enabled, interviewer_name, welcome_message_template
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
      [
        data.companyId,
        data.createdByUserId,
        data.title,
        data.jobRole,
        data.professionId,
        data.level,
        data.interviewLanguage,
        data.questionCount,
        data.jobDescription,
        data.publicToken,
        data.isVideoEnabled ? 1 : 0,
        data.interviewerName ?? null,
        data.welcomeMessageTemplate ?? null,
      ],
    );

    const interviewId = Number(result.insertId);

    for (let index = 0; index < data.questions.length; index += 1) {
      const question = data.questions[index];
      const topicName = data.topicNames.get(question.topicId) ?? null;

      const questionResult = await query<ResultSetHeader>(
        `INSERT INTO interview_questions (
           interview_id, source_question_id, sort_order, question_text,
           short_answer, ideal_answer, max_score, level, difficulty, topic_name
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          interviewId,
          question.id,
          index,
          question.questionText,
          question.shortAnswer,
          question.idealAnswer,
          question.maxScore,
          question.level,
          question.difficulty,
          topicName,
        ],
      );

      const interviewQuestionId = Number(questionResult.insertId);

      for (const checkpoint of question.checkpoints) {
        await query<ResultSetHeader>(
          `INSERT INTO interview_question_checkpoints (
             interview_question_id, checkpoint_key, title, expected, score, sort_order
           ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            interviewQuestionId,
            checkpoint.checkpointKey,
            checkpoint.title,
            checkpoint.expected,
            checkpoint.score,
            checkpoint.sortOrder,
          ],
        );
      }
    }

    const rows = await query<InterviewRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role, profession_id,
              level, interview_language, question_count, job_description,
              public_token, status, is_video_enabled, interviewer_name,
              welcome_message_template, created_at, updated_at
       FROM interviews
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [interviewId, data.companyId],
    );
    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load interview after insert');
    }

    return this.mapInterview(row);
  }

  async publishInterview(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewEntity | null> {
    await this.database.query<ResultSetHeader>(
      `UPDATE interviews SET status = ? WHERE id = ? AND company_id = ?`,
      [INTERVIEW_PUBLISHED_STATUS, interviewId, companyId],
    );

    return this.findByIdForCompany(companyId, interviewId);
  }

  async findByIdForCompany(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewEntity | null> {
    const rows = await this.database.query<InterviewRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role, profession_id,
              level, interview_language, question_count, job_description,
              public_token, status, is_video_enabled, interviewer_name,
              welcome_message_template, created_at, updated_at
       FROM interviews
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [interviewId, companyId],
    );

    const row = rows[0];
    return row ? this.mapInterview(row) : null;
  }

  async findByPublicToken(
    publicToken: string,
    status: InterviewStatus = INTERVIEW_PUBLISHED_STATUS,
  ): Promise<InterviewEntity | null> {
    const rows = await this.database.query<InterviewRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role, profession_id,
              level, interview_language, question_count, job_description,
              public_token, status, is_video_enabled, interviewer_name,
              welcome_message_template, created_at, updated_at
       FROM interviews
       WHERE public_token = ? AND status = ?
       LIMIT 1`,
      [publicToken, status],
    );

    const row = rows[0];
    return row ? this.mapInterview(row) : null;
  }

  async listQuestionsForInterview(
    interviewId: number,
  ): Promise<InterviewQuestionEntity[]> {
    const rows = await this.database.query<InterviewQuestionRow[]>(
      `SELECT id, interview_id, source_question_id, sort_order, question_text,
              short_answer, ideal_answer, max_score, level, difficulty, topic_name, created_at
       FROM interview_questions
       WHERE interview_id = ?
       ORDER BY sort_order ASC`,
      [interviewId],
    );

    return rows.map((row) => this.mapInterviewQuestion(row));
  }

  async findInterviewQuestionById(
    interviewQuestionId: number,
  ): Promise<InterviewQuestionEntity | null> {
    const rows = await this.database.query<InterviewQuestionRow[]>(
      `SELECT id, interview_id, source_question_id, sort_order, question_text,
              short_answer, ideal_answer, max_score, level, difficulty, topic_name, created_at
       FROM interview_questions
       WHERE id = ?
       LIMIT 1`,
      [interviewQuestionId],
    );

    const row = rows[0];
    return row ? this.mapInterviewQuestion(row) : null;
  }

  async findCheckpointsByInterviewQuestionId(
    interviewQuestionId: number,
  ): Promise<InterviewQuestionCheckpointEntity[]> {
    const rows = await this.database.query<InterviewQuestionCheckpointRow[]>(
      `SELECT id, interview_question_id, checkpoint_key, title, expected, score, sort_order, created_at
       FROM interview_question_checkpoints
       WHERE interview_question_id = ?
       ORDER BY sort_order ASC`,
      [interviewQuestionId],
    );

    return rows.map((row) => this.mapInterviewQuestionCheckpoint(row));
  }

  async findOrCreateCandidate(
    input: {
      companyId: number;
      interviewId: number;
      fullName: string;
      email: string;
      phone: string | null;
      linkedinUrl: string | null;
      githubUrl: string | null;
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<CandidateEntity> {
    const existing = await query<CandidateRow[]>(
      `SELECT id, company_id, interview_id, full_name, email, phone,
              linkedin_url, github_url, created_at, updated_at
       FROM candidates
       WHERE interview_id = ? AND email = ?
       LIMIT 1`,
      [input.interviewId, input.email],
    );

    if (existing[0]) {
      return this.mapCandidate(existing[0]);
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO candidates (
         company_id, interview_id, full_name, email, phone, linkedin_url, github_url
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.interviewId,
        input.fullName,
        input.email,
        input.phone,
        input.linkedinUrl,
        input.githubUrl,
      ],
    );

    const rows = await query<CandidateRow[]>(
      `SELECT id, company_id, interview_id, full_name, email, phone,
              linkedin_url, github_url, created_at, updated_at
       FROM candidates WHERE id = ? LIMIT 1`,
      [Number(result.insertId)],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load candidate after insert');
    }

    return this.mapCandidate(row);
  }

  async findActiveAttempt(
    interviewId: number,
    candidateId: number,
  ): Promise<InterviewAttemptEntity | null> {
    const rows = await this.database.query<AttemptRow[]>(
      `SELECT id, company_id, interview_id, candidate_id, status, is_shortlisted,
              started_at, completed_at, created_at, updated_at
       FROM interview_attempts
       WHERE interview_id = ? AND candidate_id = ? AND status IN ('pending', 'in_progress')
       LIMIT 1`,
      [interviewId, candidateId],
    );

    const row = rows[0];
    return row ? this.mapAttempt(row) : null;
  }

  async createAttempt(
    input: {
      companyId: number;
      interviewId: number;
      candidateId: number;
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewAttemptEntity> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO interview_attempts (
         company_id, interview_id, candidate_id, status, started_at
       ) VALUES (?, ?, ?, 'pending', NULL)`,
      [input.companyId, input.interviewId, input.candidateId],
    );

    const rows = await query<AttemptRow[]>(
      `SELECT id, company_id, interview_id, candidate_id, status, is_shortlisted,
              started_at, completed_at, created_at, updated_at
       FROM interview_attempts WHERE id = ? LIMIT 1`,
      [Number(result.insertId)],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load attempt after insert');
    }

    return this.mapAttempt(row);
  }

  async beginAttempt(
    attemptId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewAttemptEntity | null> {
    const result = await query<ResultSetHeader>(
      `UPDATE interview_attempts
       SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`,
      [attemptId],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const rows = await query<AttemptRow[]>(
      `SELECT id, company_id, interview_id, candidate_id, status, is_shortlisted,
              started_at, completed_at, created_at, updated_at
       FROM interview_attempts WHERE id = ? LIMIT 1`,
      [attemptId],
    );

    const row = rows[0];
    return row ? this.mapAttempt(row) : null;
  }

  async findCandidateByAttemptId(
    attemptId: number,
  ): Promise<CandidateEntity | null> {
    const rows = await this.database.query<CandidateRow[]>(
      `SELECT c.id, c.company_id, c.interview_id, c.full_name, c.email, c.phone,
              c.linkedin_url, c.github_url, c.created_at, c.updated_at
       FROM candidates c
       INNER JOIN interview_attempts a ON a.candidate_id = c.id
       WHERE a.id = ?
       LIMIT 1`,
      [attemptId],
    );

    const row = rows[0];
    return row ? this.mapCandidate(row) : null;
  }

  async findInterviewByAttemptId(
    attemptId: number,
    publicToken: string,
  ): Promise<InterviewEntity | null> {
    const rows = await this.database.query<InterviewRow[]>(
      `SELECT i.id, i.company_id, i.created_by_user_id, i.title, i.job_role, i.profession_id,
              i.level, i.interview_language, i.question_count, i.job_description,
              i.public_token, i.status, i.is_video_enabled, i.interviewer_name,
              i.welcome_message_template, i.created_at, i.updated_at
       FROM interviews i
       INNER JOIN interview_attempts a ON a.interview_id = i.id
       WHERE a.id = ? AND i.public_token = ?
       LIMIT 1`,
      [attemptId, publicToken.trim()],
    );

    const row = rows[0];
    return row ? this.mapInterview(row) : null;
  }

  async findAttemptByIdForCompany(
    attemptId: number,
    companyId: number,
  ): Promise<InterviewAttemptEntity | null> {
    const rows = await this.database.query<AttemptRow[]>(
      `SELECT id, company_id, interview_id, candidate_id, status, is_shortlisted,
              started_at, completed_at, created_at, updated_at
       FROM interview_attempts
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [attemptId, companyId],
    );

    const row = rows[0];
    return row ? this.mapAttempt(row) : null;
  }

  async findAttemptById(
    attemptId: number,
    publicToken: string,
  ): Promise<InterviewAttemptEntity | null> {
    const rows = await this.database.query<AttemptRow[]>(
      `SELECT a.id, a.company_id, a.interview_id, a.candidate_id, a.status,
              a.is_shortlisted, a.started_at, a.completed_at, a.created_at, a.updated_at
       FROM interview_attempts a
       JOIN interviews i ON i.id = a.interview_id
       WHERE a.id = ? AND i.public_token = ?
       LIMIT 1`,
      [attemptId, publicToken],
    );

    const row = rows[0];
    return row ? this.mapAttempt(row) : null;
  }

  async findAttemptCompanyId(attemptId: number): Promise<number | null> {
    const rows = await this.database.query<AttemptCompanyRow[]>(
      `SELECT company_id FROM interview_attempts WHERE id = ? LIMIT 1`,
      [attemptId],
    );

    const companyId = rows[0]?.company_id;
    return companyId != null ? Number(companyId) : null;
  }

  async countCandidateMessages(attemptId: number): Promise<number> {
    const rows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM interview_messages
       WHERE interview_attempt_id = ? AND role = 'candidate'`,
      [attemptId],
    );

    return Number(rows[0]?.total ?? 0);
  }

  async countMainAnswerMessages(attemptId: number): Promise<number> {
    const rows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM interview_messages
       WHERE interview_attempt_id = ?
         AND role = 'candidate'
         AND (message_kind IS NULL OR message_kind = 'main_answer')`,
      [attemptId],
    );

    return Number(rows[0]?.total ?? 0);
  }

  async getNextSequenceOrder(
    attemptId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<number> {
    const rows = await query<CountRow[]>(
      `SELECT COALESCE(MAX(sequence_order), 0) + 1 AS total
       FROM interview_messages
       WHERE interview_attempt_id = ?`,
      [attemptId],
    );

    return Number(rows[0]?.total ?? 1);
  }

  async appendMessage(
    input: {
      companyId: number;
      attemptId: number;
      interviewQuestionId: number | null;
      role: MessageRole;
      content: string;
      sequenceOrder: number;
      messageKind?: MessageKind | null;
      parentMessageId?: number | null;
      targetCheckpointKey?: string | null;
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewMessageEntity> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO interview_messages (
         company_id, interview_attempt_id, interview_question_id, role,
         message_kind, parent_message_id, target_checkpoint_key,
         content, sequence_order
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.attemptId,
        input.interviewQuestionId,
        input.role,
        input.messageKind ?? null,
        input.parentMessageId ?? null,
        input.targetCheckpointKey ?? null,
        input.content,
        input.sequenceOrder,
      ],
    );

    const rows = await query<MessageRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id,
              role, message_kind, parent_message_id, target_checkpoint_key,
              content, sequence_order, created_at
       FROM interview_messages WHERE id = ? LIMIT 1`,
      [Number(result.insertId)],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load message after insert');
    }

    return this.mapMessage(row);
  }

  async listMessages(attemptId: number): Promise<InterviewMessageEntity[]> {
    const rows = await this.database.query<MessageRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_question_id,
              role, message_kind, parent_message_id, target_checkpoint_key,
              content, sequence_order, created_at
       FROM interview_messages
       WHERE interview_attempt_id = ?
       ORDER BY sequence_order ASC`,
      [attemptId],
    );

    return rows.map((row) => this.mapMessage(row));
  }

  async completeAttempt(
    attemptId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE interview_attempts
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'in_progress'`,
      [attemptId],
    );
  }

  async abandonAttempt(attemptId: number): Promise<void> {
    await this.database.query<ResultSetHeader>(
      `UPDATE interview_attempts
       SET status = 'abandoned', completed_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'in_progress'`,
      [attemptId],
    );
  }

  private mapInterview(row: InterviewRow): InterviewEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      createdByUserId: row.created_by_user_id,
      title: row.title,
      jobRole: row.job_role,
      professionId: row.profession_id,
      level: row.level,
      interviewLanguage: row.interview_language,
      questionCount: row.question_count,
      jobDescription: row.job_description,
      publicToken: row.public_token,
      status: row.status,
      isVideoEnabled: row.is_video_enabled === 1,
      interviewerName: row.interviewer_name,
      welcomeMessageTemplate: row.welcome_message_template,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapInterviewQuestion(
    row: InterviewQuestionRow,
  ): InterviewQuestionEntity {
    return {
      id: row.id,
      interviewId: row.interview_id,
      sourceQuestionId: row.source_question_id,
      sortOrder: row.sort_order,
      questionText: row.question_text,
      shortAnswer: row.short_answer,
      idealAnswer: row.ideal_answer,
      maxScore: Number(row.max_score),
      level: row.level,
      difficulty: row.difficulty,
      topicName: row.topic_name,
      createdAt: row.created_at,
    };
  }

  private mapInterviewQuestionCheckpoint(
    row: InterviewQuestionCheckpointRow,
  ): InterviewQuestionCheckpointEntity {
    return {
      id: row.id,
      interviewQuestionId: row.interview_question_id,
      checkpointKey: row.checkpoint_key,
      title: row.title,
      expected: row.expected,
      score: Number(row.score),
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  }

  private mapCandidate(row: CandidateRow): CandidateEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewId: row.interview_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      linkedinUrl: row.linkedin_url,
      githubUrl: row.github_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapAttempt(row: AttemptRow): InterviewAttemptEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewId: row.interview_id,
      candidateId: row.candidate_id,
      status: row.status,
      isShortlisted: row.is_shortlisted === 1,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapMessage(row: MessageRow): InterviewMessageEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewQuestionId: row.interview_question_id,
      role: row.role,
      messageKind: row.message_kind,
      parentMessageId: row.parent_message_id,
      targetCheckpointKey: row.target_checkpoint_key,
      content: row.content,
      sequenceOrder: row.sequence_order,
      createdAt: row.created_at,
    };
  }
}
