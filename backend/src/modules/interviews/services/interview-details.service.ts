import { Injectable } from '@nestjs/common';
import { mapFinalEvaluationToGraphql } from '../../ai-evaluation/ai-evaluation.mapper';
import { InterviewStatusEnum } from '../../interview-core/types/interview.type';
import type { InterviewDetailsType } from '../graphql/interview-details.type';
import { InterviewDetailsRepository } from '../repositories/interview-details.repository';
import { mapInterviewAttemptRowToSummary } from '../utils/map-interview-attempt-summary.util';

@Injectable()
export class InterviewDetailsService {
  constructor(private readonly repository: InterviewDetailsRepository) {}

  async getDetails(
    companyId: number,
    interviewId: number,
  ): Promise<InterviewDetailsType> {
    const {
      interview,
      attempts,
      questions,
      skills,
      primaryAttempt,
      primaryFinalEvaluation,
    } = await this.repository.getInterviewDetails(companyId, interviewId);

    const publicUrl = `/i/${interview.public_token}`;

    const mappedAttempts = attempts.map(mapInterviewAttemptRowToSummary);

    const evaluationStatus = primaryAttempt
      ? mappedAttempts.find((attempt) => attempt.attemptId === String(primaryAttempt.id))
          ?.evaluationStatus ?? 'evaluation_pending'
      : 'no_attempts';

    return {
      id: String(interview.id),
      title: interview.title,
      jobRole: interview.job_role,
      professionName: interview.profession_name,
      level: interview.level,
      status: interview.status as InterviewStatusEnum,
      questionCount: interview.question_count,
      publicUrl,
      createdAt: Math.floor(interview.created_at.getTime() / 1000),
      skills,
      questions: questions.map((question) => ({
        id: String(question.id),
        sortOrder: question.sort_order,
        questionText: question.question_text,
        level: question.level,
        difficulty: question.difficulty,
        topicName: question.topic_name,
        maxScore: Number(question.max_score),
      })),
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
}
