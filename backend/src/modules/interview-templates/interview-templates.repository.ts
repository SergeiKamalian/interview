import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type { DbQueryParam } from '../../common/database/database.types';
import type { CompanyInterviewTemplatesFilterInput } from './graphql/interview-template.input';
import type { InterviewTemplateStatusEnum } from './graphql/interview-template.type';
import type { QuestionLevelEnum } from '../question-bank/types/question.type';

interface InterviewTemplateRow extends RowDataPacket {
  id: number;
  company_id: number;
  created_by_user_id: number | null;
  title: string;
  job_role: string;
  profession_id: number | null;
  level: QuestionLevelEnum;
  interview_language: string;
  question_count: number;
  job_description: string | null;
  is_video_enabled: number;
  interviewer_name: string | null;
  welcome_message_template: string | null;
  status: InterviewTemplateStatusEnum;
  created_at: Date;
  updated_at: Date;
}

interface InterviewTemplateQuestionRow extends RowDataPacket {
  template_id: number;
  source_question_id: number;
  sort_order: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface InterviewForTemplateRow extends RowDataPacket {
  id: number;
  company_id: number;
  created_by_user_id: number | null;
  title: string;
  job_role: string;
  profession_id: number | null;
  level: QuestionLevelEnum;
  interview_language: string;
  question_count: number;
  job_description: string | null;
  is_video_enabled: number;
  interviewer_name: string | null;
  welcome_message_template: string | null;
}

interface InterviewQuestionSourceRow extends RowDataPacket {
  source_question_id: number | null;
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

export type InterviewTemplateQuestionEntity = {
  questionId: number;
  sortOrder: number;
};

export type InterviewTemplateEntity = {
  id: number;
  companyId: number;
  createdByUserId: number | null;
  title: string;
  jobRole: string;
  professionId: number | null;
  level: QuestionLevelEnum;
  interviewLanguage: string;
  questionCount: number;
  jobDescription: string | null;
  isVideoEnabled: boolean;
  interviewerName: string | null;
  welcomeMessageTemplate: string | null;
  status: InterviewTemplateStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  questions: InterviewTemplateQuestionEntity[];
};

export type CreateInterviewTemplateData = {
  companyId: number;
  createdByUserId: number;
  title: string;
  jobRole: string;
  professionId: number | null;
  level: QuestionLevelEnum;
  interviewLanguage: string;
  questionCount: number;
  jobDescription: string | null;
  isVideoEnabled: boolean;
  interviewerName: string | null;
  welcomeMessageTemplate: string | null;
  questionIds: number[];
};

export type InterviewTemplateDraftFromInterview = {
  title: string;
  jobRole: string;
  professionId: number | null;
  level: QuestionLevelEnum;
  interviewLanguage: string;
  jobDescription: string | null;
  isVideoEnabled: boolean;
  interviewerName: string | null;
  welcomeMessageTemplate: string | null;
  questionIds: Array<number | null>;
};

@Injectable()
export class InterviewTemplatesRepository {
  constructor(private readonly database: DatabaseService) {}

  async listForCompany(
    companyId: number,
    filters: CompanyInterviewTemplatesFilterInput,
  ): Promise<{ items: InterviewTemplateEntity[]; total: number }> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const offset = (page - 1) * pageSize;
    const conditions = ['company_id = ?'];
    const params: DbQueryParam[] = [companyId];

    if (!filters.includeArchived) {
      conditions.push("status = 'active'");
    }

    if (filters.level) {
      conditions.push('level = ?');
      params.push(filters.level);
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push('(title LIKE ? OR job_role LIKE ?)');
      params.push(term, term);
    }

    const whereClause = conditions.join(' AND ');
    const countRows = await this.database.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM interview_templates
       WHERE ${whereClause}`,
      params,
    );

    const rows = await this.database.query<InterviewTemplateRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role,
              profession_id, level, interview_language, question_count,
              job_description, is_video_enabled, interviewer_name,
              welcome_message_template, status, created_at, updated_at
       FROM interview_templates
       WHERE ${whereClause}
       ORDER BY updated_at DESC, id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params,
    );

    return {
      items: await this.attachQuestions(
        rows.map((row) => this.mapTemplate(row)),
      ),
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async findByIdForCompany(
    companyId: number,
    templateId: number,
  ): Promise<InterviewTemplateEntity | null> {
    const rows = await this.database.query<InterviewTemplateRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role,
              profession_id, level, interview_language, question_count,
              job_description, is_video_enabled, interviewer_name,
              welcome_message_template, status, created_at, updated_at
       FROM interview_templates
       WHERE company_id = ? AND id = ?
       LIMIT 1`,
      [companyId, templateId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    const [template] = await this.attachQuestions([this.mapTemplate(row)]);
    return template ?? null;
  }

  async createTemplate(
    data: CreateInterviewTemplateData,
  ): Promise<InterviewTemplateEntity> {
    const templateId = await this.database.withTransaction(async (query) => {
      const result = await query<ResultSetHeader>(
        `INSERT INTO interview_templates (
           company_id, created_by_user_id, title, job_role, profession_id,
           level, interview_language, question_count, job_description,
           is_video_enabled, interviewer_name, welcome_message_template, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
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
          data.isVideoEnabled ? 1 : 0,
          data.interviewerName,
          data.welcomeMessageTemplate,
        ],
      );

      const id = Number(result.insertId);
      await this.insertTemplateQuestions(id, data.questionIds, query);
      return id;
    });

    const template = await this.findByIdForCompany(data.companyId, templateId);
    if (!template) {
      throw new Error('Created interview template was not found');
    }

    return template;
  }

  async findTemplateDraftFromInterview(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewTemplateDraftFromInterview | null> {
    const interviewRows = await this.database.query<InterviewForTemplateRow[]>(
      `SELECT id, company_id, created_by_user_id, title, job_role,
              profession_id, level, interview_language, question_count,
              job_description, is_video_enabled, interviewer_name,
              welcome_message_template
       FROM interviews
       WHERE id = ? AND company_id = ?
       LIMIT 1`,
      [interviewId, companyId],
    );

    const interview = interviewRows[0];
    if (!interview) {
      return null;
    }

    const questionRows = await this.database.query<
      InterviewQuestionSourceRow[]
    >(
      `SELECT source_question_id
       FROM interview_questions
       WHERE interview_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [interviewId],
    );

    return {
      title: interview.title,
      jobRole: interview.job_role,
      professionId: interview.profession_id,
      level: interview.level,
      interviewLanguage: interview.interview_language,
      jobDescription: interview.job_description,
      isVideoEnabled: interview.is_video_enabled === 1,
      interviewerName: interview.interviewer_name,
      welcomeMessageTemplate: interview.welcome_message_template,
      questionIds: questionRows.map((row) => row.source_question_id),
    };
  }

  private async insertTemplateQuestions(
    templateId: number,
    questionIds: number[],
    query: QueryFn,
  ): Promise<void> {
    for (let index = 0; index < questionIds.length; index += 1) {
      await query<ResultSetHeader>(
        `INSERT INTO interview_template_questions (
           template_id, source_question_id, sort_order
         ) VALUES (?, ?, ?)`,
        [templateId, questionIds[index], index],
      );
    }
  }

  private async attachQuestions(
    templates: InterviewTemplateEntity[],
  ): Promise<InterviewTemplateEntity[]> {
    if (templates.length === 0) {
      return [];
    }

    const templateIds = templates.map((template) => template.id);
    const placeholders = templateIds.map(() => '?').join(', ');
    const rows = await this.database.query<InterviewTemplateQuestionRow[]>(
      `SELECT template_id, source_question_id, sort_order
       FROM interview_template_questions
       WHERE template_id IN (${placeholders})
       ORDER BY template_id ASC, sort_order ASC`,
      templateIds,
    );

    const byTemplateId = new Map<number, InterviewTemplateQuestionEntity[]>();
    for (const row of rows) {
      const questions = byTemplateId.get(row.template_id) ?? [];
      questions.push({
        questionId: row.source_question_id,
        sortOrder: row.sort_order,
      });
      byTemplateId.set(row.template_id, questions);
    }

    return templates.map((template) => ({
      ...template,
      questions: byTemplateId.get(template.id) ?? [],
    }));
  }

  private mapTemplate(row: InterviewTemplateRow): InterviewTemplateEntity {
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
      isVideoEnabled: row.is_video_enabled === 1,
      interviewerName: row.interviewer_name,
      welcomeMessageTemplate: row.welcome_message_template,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      questions: [],
    };
  }
}
