import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { QuestionBankRepository } from '../../question-bank/question-bank.repository';
import type { CheckpointEvaluationContext } from '../types/checkpoint-evaluation.types';

@Injectable()
export class EvaluationContextService {
  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly questionBankRepository: QuestionBankRepository,
  ) {}

  async buildCheckpointEvaluationContext(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<CheckpointEvaluationContext> {
    const interviewQuestion =
      await this.interviewRepository.findInterviewQuestionById(
        interviewQuestionId,
      );

    if (!interviewQuestion) {
      throw new NotFoundException('Interview question not found');
    }

    const messages = await this.interviewRepository.listMessages(attemptId);
    const attemptMessages = messages.filter(
      (message) => message.interviewAttemptId === attemptId,
    );

    const questionMessages = attemptMessages.filter(
      (message) => message.interviewQuestionId === interviewQuestionId,
    );

    const candidateMessages = questionMessages.filter(
      (message) => message.role === 'candidate',
    );

    const candidateMessage = candidateMessages[0];
    const candidateAnswer = candidateMessages
      .map((message) => message.content)
      .join('\n\n')
      .trim();

    if (!candidateMessage || !candidateAnswer) {
      throw new BadRequestException({
        message: 'Candidate answer not found for this question',
        code: 'CANDIDATE_ANSWER_NOT_FOUND',
      });
    }

    const checkpoints = await this.loadCheckpointsFromQuestionBank(
      interviewQuestion.sourceQuestionId,
    );

    if (checkpoints.length === 0) {
      throw new BadRequestException({
        message: 'No checkpoints found in question bank for this question',
        code: 'CHECKPOINTS_NOT_FOUND',
      });
    }

    return {
      interviewQuestionId: interviewQuestion.id,
      interviewId: interviewQuestion.interviewId,
      attemptId,
      companyId: attemptMessages[0]?.companyId ?? 0,
      questionText: interviewQuestion.questionText,
      idealAnswer: interviewQuestion.idealAnswer,
      maxScore: interviewQuestion.maxScore,
      sourceQuestionId: interviewQuestion.sourceQuestionId,
      checkpoints,
      candidateAnswer,
      candidateMessageId: candidateMessage.id,
      transcriptFragments: questionMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };
  }

  private async loadCheckpointsFromQuestionBank(
    sourceQuestionId: number | null,
  ) {
    if (!sourceQuestionId) {
      return [];
    }

    const rows =
      await this.questionBankRepository.findCheckpointsByQuestionId(
        sourceQuestionId,
      );

    return rows.map((checkpoint) => ({
      checkpointKey: checkpoint.checkpointKey,
      title: checkpoint.title,
      expected: checkpoint.expected,
      score: checkpoint.score,
      sortOrder: checkpoint.sortOrder,
    }));
  }
}
