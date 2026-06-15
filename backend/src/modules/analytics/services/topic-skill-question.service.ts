import { Injectable } from '@nestjs/common';
import type { TopicSkillQuestionFilterInput } from '../graphql/topic-skill-question.input';
import type { TopicSkillQuestionAnalyticsType } from '../graphql/topic-skill-question.type';
import { TopicSkillQuestionRepository } from '../repositories/topic-skill-question.repository';

@Injectable()
export class TopicSkillQuestionService {
  constructor(private readonly repository: TopicSkillQuestionRepository) {}

  async getAnalytics(
    companyId: number,
    filters: TopicSkillQuestionFilterInput,
  ): Promise<TopicSkillQuestionAnalyticsType> {
    const data = await this.repository.getAnalytics(companyId, filters ?? {});

    return {
      topics: data.topics.map((row) => ({
        topicName: row.topic_name,
        avgScore: Number(row.avg_score),
        passRate: Number(row.pass_rate),
        sampleCount: Number(row.sample_count),
      })),
      skills: data.skills.map((row) => ({
        skillName: row.skill_name,
        avgScore: Number(row.avg_score),
        passRate: Number(row.pass_rate),
        sampleCount: Number(row.sample_count),
      })),
      questions: data.questions.map((row) => ({
        questionId: String(row.question_id),
        questionText: row.question_text,
        avgScore: Number(row.avg_score),
        passRate: Number(row.pass_rate),
        sampleCount: Number(row.sample_count),
      })),
      totalCompletedAttempts: data.totalCompletedAttempts,
      lowSampleWarning: data.lowSampleWarning,
    };
  }
}
