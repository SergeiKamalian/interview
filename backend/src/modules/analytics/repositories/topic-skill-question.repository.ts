import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import type { TopicSkillQuestionFilterInput } from '../graphql/topic-skill-question.input';

interface TopicRow extends RowDataPacket {
  topic_name: string;
  avg_score: string;
  pass_rate: string;
  sample_count: number;
}

interface SkillRow extends RowDataPacket {
  skill_name: string;
  avg_score: string;
  pass_rate: string;
  sample_count: number;
}

interface QuestionRow extends RowDataPacket {
  question_id: number;
  question_text: string;
  avg_score: string;
  pass_rate: string;
  sample_count: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const MIN_SAMPLE_SIZE = 5;

@Injectable()
export class TopicSkillQuestionRepository {
  constructor(private readonly database: DatabaseService) {}

  async getAnalytics(
    companyId: number,
    filters: TopicSkillQuestionFilterInput,
  ) {
    const conditions = [
      'ia.company_id = ?',
      "ia.status = 'completed'",
      'ia.is_preview = 0',
    ];
    const params: DbQueryParam[] = [companyId];

    if (filters.dateFrom) {
      conditions.push('ia.completed_at >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('ia.completed_at <= ?');
      params.push(`${filters.dateTo} 23:59:59`);
    }

    if (filters.jobRole?.trim()) {
      conditions.push('i.job_role = ?');
      params.push(filters.jobRole.trim());
    }

    if (filters.level) {
      conditions.push('i.level = ?');
      params.push(filters.level);
    }

    const whereClause = conditions.join(' AND ');

    const attemptCount = await this.database.query<CountRow[]>(
      `SELECT COUNT(DISTINCT ia.id) AS total
       FROM interview_attempts ia
       INNER JOIN interviews i ON i.id = ia.interview_id
       WHERE ${whereClause}`,
      params,
    );

    const topics = await this.database.query<TopicRow[]>(
      `SELECT iq.topic_name,
              AVG(qe.score) AS avg_score,
              AVG(CASE WHEN qe.score >= (qe.max_score * 0.6) THEN 1 ELSE 0 END) AS pass_rate,
              COUNT(qe.id) AS sample_count
       FROM question_evaluations qe
       INNER JOIN interview_attempts ia ON ia.id = qe.interview_attempt_id
       INNER JOIN interviews i ON i.id = ia.interview_id
       INNER JOIN interview_questions iq ON iq.id = qe.interview_question_id
       WHERE ${whereClause} AND iq.topic_name IS NOT NULL
       GROUP BY iq.topic_name
       ORDER BY avg_score ASC
       LIMIT 20`,
      params,
    );

    const skills = await this.database.query<SkillRow[]>(
      `SELECT s.name AS skill_name,
              AVG(qe.score) AS avg_score,
              AVG(CASE WHEN qe.score >= (qe.max_score * 0.6) THEN 1 ELSE 0 END) AS pass_rate,
              COUNT(qe.id) AS sample_count
       FROM question_evaluations qe
       INNER JOIN interview_attempts ia ON ia.id = qe.interview_attempt_id
       INNER JOIN interviews i ON i.id = ia.interview_id
       INNER JOIN interview_questions iq ON iq.id = qe.interview_question_id
       INNER JOIN questions q ON q.id = iq.source_question_id
       INNER JOIN question_skills qs ON qs.question_id = q.id
       INNER JOIN skills s ON s.id = qs.skill_id
       WHERE ${whereClause}
       GROUP BY s.id, s.name
       ORDER BY avg_score DESC
       LIMIT 20`,
      params,
    );

    const questions = await this.database.query<QuestionRow[]>(
      `SELECT iq.id AS question_id,
              iq.question_text,
              AVG(qe.score) AS avg_score,
              AVG(CASE WHEN qe.score >= (qe.max_score * 0.6) THEN 1 ELSE 0 END) AS pass_rate,
              COUNT(qe.id) AS sample_count
       FROM question_evaluations qe
       INNER JOIN interview_attempts ia ON ia.id = qe.interview_attempt_id
       INNER JOIN interviews i ON i.id = ia.interview_id
       INNER JOIN interview_questions iq ON iq.id = qe.interview_question_id
       WHERE ${whereClause}
       GROUP BY iq.id, iq.question_text
       ORDER BY avg_score ASC
       LIMIT 30`,
      params,
    );

    const totalCompletedAttempts = Number(attemptCount[0]?.total ?? 0);

    return {
      topics,
      skills,
      questions,
      totalCompletedAttempts,
      lowSampleWarning: totalCompletedAttempts < MIN_SAMPLE_SIZE,
    };
  }
}
