import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type { DbQueryParam } from '../../common/database/database.types';
import { parseCheckpointEvaluationHints } from '../adaptive-interview/types/checkpoint-evaluation-hints.type';
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
import type {
  AiTone,
  ProbingDepth,
  ScoringStrictness,
} from './types/interview-config.enum';
import type { InterviewAnswerExampleEntity } from './entities/interview-answer-example.entity';
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
  ai_tone: AiTone;
  probing_depth: ProbingDepth;
  scoring_strictness: ScoringStrictness;
  expires_at: Date | null;
  max_completions: number | null;
  allow_retake: number;
  time_limit_minutes: number | null;
  passing_score: string | null;
  require_phone: number;
  require_linkedin: number;
  require_github: number;
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
  topic_weight: string;
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
  is_preview: number;
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
  evaluation_hints: unknown;
  score: string;
  sort_order: number;
  created_at: Date;
}

interface InterviewAnswerExampleRow extends RowDataPacket {
  id: number;
  interview_question_id: number;
  checkpoint_key: string | null;
  example_type: 'good' | 'bad';
  example_text: string;
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
  aiTone: AiTone;
  probingDepth: ProbingDepth;
  scoringStrictness: ScoringStrictness;
  expiresAt: Date | null;
  maxCompletions: number | null;
  allowRetake: boolean;
  timeLimitMinutes: number | null;
  passingScore: number | null;
  requirePhone: boolean;
  requireLinkedin: boolean;
  requireGithub: boolean;
  questions: QuestionWithDetailsEntity[];
  topicNames: Map<number, string>;
  topicWeights: Map<number, number>;
  questionTopicWeights?: Map<number, number>;
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
         public_token, status, is_video_enabled, interviewer_name, welcome_message_template,
         ai_tone, probing_depth, scoring_strictness, expires_at, max_completions,
         allow_retake, time_limit_minutes, passing_score,
         require_phone, require_linkedin, require_github
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        data.aiTone,
        data.probingDepth,
        data.scoringStrictness,
        data.expiresAt,
        data.maxCompletions,
        data.allowRetake ? 1 : 0,
        data.timeLimitMinutes,
        data.passingScore,
        data.requirePhone ? 1 : 0,
        data.requireLinkedin ? 1 : 0,
        data.requireGithub ? 1 : 0,
      ],
    );

    const interviewId = Number(result.insertId);

    for (let index = 0; index < data.questions.length; index += 1) {
      const question = data.questions[index];
      const topicName = data.topicNames.get(question.topicId) ?? null;
      const topicWeight =
        data.questionTopicWeights?.get(question.id) ??
        data.topicWeights.get(question.topicId) ??
        1;

      const questionResult = await query<ResultSetHeader>(
        `INSERT INTO interview_questions (
           interview_id, source_question_id, sort_order, question_text,
           short_answer, ideal_answer, max_score, level, difficulty, topic_name, topic_weight
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          topicWeight,
        ],
      );

      const interviewQuestionId = Number(questionResult.insertId);

      for (const checkpoint of question.checkpoints) {
        await query<ResultSetHeader>(
          `INSERT INTO interview_question_checkpoints (
             interview_question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            interviewQuestionId,
            checkpoint.checkpointKey,
            checkpoint.title,
            checkpoint.expected,
            checkpoint.evaluationHints
              ? JSON.stringify(checkpoint.evaluationHints)
              : null,
            checkpoint.score,
            checkpoint.sortOrder,
          ],
        );
      }

      for (const example of question.answerExamples) {
        await query<ResultSetHeader>(
          `INSERT INTO interview_answer_examples (
             interview_question_id, checkpoint_key, example_type, example_text, sort_order
           ) VALUES (?, ?, ?, ?, ?)`,
          [
            interviewQuestionId,
            example.checkpointKey,
            example.exampleType,
            example.exampleText,
            example.sortOrder,
          ],
        );
      }
    }

    const rows = await query<InterviewRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role, profession_id,
              level, interview_language, question_count, job_description,
              public_token, status, is_video_enabled, interviewer_name,
              welcome_message_template, ai_tone, probing_depth, scoring_strictness,
              expires_at, max_completions, allow_retake, time_limit_minutes,
              passing_score, require_phone, require_linkedin, require_github,
              created_at, updated_at
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

  async updateStatus(
    companyId: number,
    interviewId: number,
    status: InterviewStatus,
  ): Promise<InterviewEntity | null> {
    await this.database.query<ResultSetHeader>(
      `UPDATE interviews SET status = ? WHERE id = ? AND company_id = ?`,
      [status, interviewId, companyId],
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
              welcome_message_template, ai_tone, probing_depth, scoring_strictness,
              expires_at, max_completions, allow_retake, time_limit_minutes,
              passing_score, require_phone, require_linkedin, require_github,
              created_at, updated_at
       FROM interviews
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [interviewId, companyId],
    );

    const row = rows[0];
    return row ? this.mapInterview(row) : null;
  }

  async findById(interviewId: number): Promise<InterviewEntity | null> {
    const rows = await this.database.query<InterviewRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role, profession_id,
              level, interview_language, question_count, job_description,
              public_token, status, is_video_enabled, interviewer_name,
              welcome_message_template, ai_tone, probing_depth, scoring_strictness,
              expires_at, max_completions, allow_retake, time_limit_minutes,
              passing_score, require_phone, require_linkedin, require_github,
              created_at, updated_at
       FROM interviews
       WHERE id = ?
       LIMIT 1`,
      [interviewId],
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
              welcome_message_template, ai_tone, probing_depth, scoring_strictness,
              expires_at, max_completions, allow_retake, time_limit_minutes,
              passing_score, require_phone, require_linkedin, require_github,
              created_at, updated_at
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
              short_answer, ideal_answer, max_score, level, difficulty, topic_name,
              topic_weight, created_at
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
              short_answer, ideal_answer, max_score, level, difficulty, topic_name,
              topic_weight, created_at
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
      `SELECT id, interview_question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order, created_at
       FROM interview_question_checkpoints
       WHERE interview_question_id = ?
       ORDER BY sort_order ASC`,
      [interviewQuestionId],
    );

    return rows.map((row) => this.mapInterviewQuestionCheckpoint(row));
  }

  async findAnswerExamplesByInterviewQuestionId(
    interviewQuestionId: number,
  ): Promise<InterviewAnswerExampleEntity[]> {
    const rows = await this.database.query<InterviewAnswerExampleRow[]>(
      `SELECT id, interview_question_id, checkpoint_key, example_type, example_text, sort_order, created_at
       FROM interview_answer_examples
       WHERE interview_question_id = ?
       ORDER BY sort_order ASC`,
      [interviewQuestionId],
    );

    return rows.map((row) => this.mapInterviewAnswerExample(row));
  }

  async findBadAnswerExamplesBySourceQuestionId(
    sourceQuestionId: number,
    limit = 3,
  ): Promise<string[]> {
    const safeLimit = Math.max(1, Math.min(10, Math.trunc(limit)));
    const rows = await this.database.query<RowDataPacket[]>(
      `SELECT example_text
       FROM answer_examples
       WHERE question_id = ? AND example_type = 'bad'
       ORDER BY sort_order ASC
       LIMIT ${safeLimit}`,
      [sourceQuestionId],
    );

    return rows.map((row) => String(row.example_text));
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
              is_preview, started_at, completed_at, created_at, updated_at
       FROM interview_attempts
       WHERE interview_id = ? AND candidate_id = ? AND status IN ('pending', 'in_progress')
       LIMIT 1`,
      [interviewId, candidateId],
    );

    const row = rows[0];
    return row ? this.mapAttempt(row) : null;
  }

  async countCompletedAttempts(
    interviewId: number,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<number> {
    const rows = await query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM interview_attempts
       WHERE interview_id = ? AND status = 'completed' AND is_preview = 0`,
      [interviewId],
    );

    return Number(rows[0]?.total ?? 0);
  }

  async hasCompletedAttemptForEmail(
    interviewId: number,
    email: string,
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<boolean> {
    const rows = await query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM interview_attempts a
       INNER JOIN candidates c ON c.id = a.candidate_id
       WHERE a.interview_id = ? AND c.email = ? AND a.status = 'completed' AND a.is_preview = 0`,
      [interviewId, email],
    );

    return Number(rows[0]?.total ?? 0) > 0;
  }

  async createAttempt(
    input: {
      companyId: number;
      interviewId: number;
      candidateId: number;
      isPreview?: boolean;
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<InterviewAttemptEntity> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO interview_attempts (
         company_id, interview_id, candidate_id, status, is_preview, started_at
       ) VALUES (?, ?, ?, 'pending', ?, NULL)`,
      [
        input.companyId,
        input.interviewId,
        input.candidateId,
        input.isPreview ? 1 : 0,
      ],
    );

    const rows = await query<AttemptRow[]>(
      `SELECT id, company_id, interview_id, candidate_id, status, is_shortlisted,
              is_preview, started_at, completed_at, created_at, updated_at
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
              is_preview, started_at, completed_at, created_at, updated_at
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
              i.welcome_message_template, i.ai_tone, i.probing_depth, i.scoring_strictness,
              i.expires_at, i.max_completions, i.allow_retake, i.time_limit_minutes,
              i.passing_score, i.require_phone, i.require_linkedin, i.require_github,
              i.created_at, i.updated_at
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
              is_preview, started_at, completed_at, created_at, updated_at
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
              a.is_shortlisted, a.is_preview, a.started_at, a.completed_at, a.created_at, a.updated_at
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

  async findAwaitingTopicOpener(attemptId: number): Promise<{
    interviewQuestionId: number;
    topicOpenerMessageId: number;
    topicOpenerText: string;
  } | null> {
    const rows = await this.database.query<
      (RowDataPacket & {
        id: number;
        interview_question_id: number | null;
        role: string;
        message_kind: MessageKind | null;
        content: string;
      })[]
    >(
      `SELECT id, interview_question_id, role, message_kind, content
       FROM interview_messages
       WHERE interview_attempt_id = ?
       ORDER BY sequence_order DESC
       LIMIT 1`,
      [attemptId],
    );

    const last = rows[0];
    if (
      !last ||
      last.role !== 'ai' ||
      last.message_kind !== 'topic_opener' ||
      last.interview_question_id == null
    ) {
      return null;
    }

    return {
      interviewQuestionId: Number(last.interview_question_id),
      topicOpenerMessageId: Number(last.id),
      topicOpenerText: last.content,
    };
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
      aiTone: row.ai_tone,
      probingDepth: row.probing_depth,
      scoringStrictness: row.scoring_strictness,
      expiresAt: row.expires_at,
      maxCompletions:
        row.max_completions != null ? Number(row.max_completions) : null,
      allowRetake: row.allow_retake === 1,
      timeLimitMinutes:
        row.time_limit_minutes != null ? Number(row.time_limit_minutes) : null,
      passingScore:
        row.passing_score != null ? Number(row.passing_score) : null,
      requirePhone: row.require_phone === 1,
      requireLinkedin: row.require_linkedin === 1,
      requireGithub: row.require_github === 1,
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
      topicWeight: Number(row.topic_weight),
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
      evaluationHints: parseCheckpointEvaluationHints(row.evaluation_hints),
      score: Number(row.score),
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  }

  private mapInterviewAnswerExample(
    row: InterviewAnswerExampleRow,
  ): InterviewAnswerExampleEntity {
    return {
      id: row.id,
      interviewQuestionId: row.interview_question_id,
      checkpointKey: row.checkpoint_key,
      exampleType: row.example_type,
      exampleText: row.example_text,
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
      isPreview: row.is_preview === 1,
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
