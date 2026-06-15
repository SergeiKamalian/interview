import { Injectable } from '@nestjs/common';
import type { MessageRoleEnum } from '../../interview-core/types/interview.type';
import type { InterviewTranscriptType } from '../graphql/interview-transcript.type';
import { InterviewTranscriptRepository } from '../repositories/interview-transcript.repository';

@Injectable()
export class InterviewTranscriptService {
  constructor(private readonly repository: InterviewTranscriptRepository) {}

  async getTranscript(
    companyId: number,
    attemptId: number,
  ): Promise<InterviewTranscriptType> {
    const rows = await this.repository.getTranscript(companyId, attemptId);

    return {
      attemptId: String(attemptId),
      segments: rows.map((row) => ({
        messageId: String(row.id),
        role: row.role as MessageRoleEnum,
        content: row.content,
        sequenceOrder: row.sequence_order,
        timestamp: Math.floor(row.created_at.getTime() / 1000),
        questionText: row.question_text,
        interviewQuestionId: row.interview_question_id
          ? String(row.interview_question_id)
          : null,
      })),
    };
  }
}
