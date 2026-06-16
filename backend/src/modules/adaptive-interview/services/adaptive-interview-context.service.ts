import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { getAdaptiveInterviewContextLimits } from '../config/adaptive-interview-context.config';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { buildAdaptiveInterviewContextPacket } from '../utils/build-adaptive-interview-context.util';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';

@Injectable()
export class AdaptiveInterviewContextService {
  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly checkpointStateRepository: CheckpointStateRepository,
  ) {}

  async buildContextPacket(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<AdaptiveInterviewContextPacket> {
    const interviewQuestion =
      await this.interviewRepository.findInterviewQuestionById(
        interviewQuestionId,
      );

    if (!interviewQuestion) {
      throw new NotFoundException('Interview question not found');
    }

    const [messages, snapshotCheckpoints, checkpointStates, badAnswerExamples] =
      await Promise.all([
      this.interviewRepository.listMessages(attemptId),
      this.interviewRepository.findCheckpointsByInterviewQuestionId(
        interviewQuestionId,
      ),
      this.checkpointStateRepository.findByAttemptAndQuestion(
        attemptId,
        interviewQuestionId,
      ),
      interviewQuestion.sourceQuestionId
        ? this.interviewRepository.findBadAnswerExamplesBySourceQuestionId(
            interviewQuestion.sourceQuestionId,
          )
        : Promise.resolve([]),
    ]);

    if (snapshotCheckpoints.length === 0) {
      throw new BadRequestException({
        message: 'No checkpoints found in interview question snapshot',
        code: 'CHECKPOINTS_NOT_FOUND',
      });
    }

    const attemptMessage = messages.find(
      (message) => message.interviewAttemptId === attemptId,
    );

    return buildAdaptiveInterviewContextPacket({
      interviewQuestionId: interviewQuestion.id,
      interviewId: interviewQuestion.interviewId,
      attemptId,
      companyId: attemptMessage?.companyId ?? checkpointStates[0]?.companyId ?? 0,
      questionText: interviewQuestion.questionText,
      shortAnswer: interviewQuestion.shortAnswer,
      idealAnswer: interviewQuestion.idealAnswer,
      maxScore: interviewQuestion.maxScore,
      checkpoints: snapshotCheckpoints.map((checkpoint) => ({
        checkpointKey: checkpoint.checkpointKey,
        title: checkpoint.title,
        expected: checkpoint.expected,
        score: checkpoint.score,
        sortOrder: checkpoint.sortOrder,
      })),
      questionMessages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        sequenceOrder: message.sequenceOrder,
        interviewQuestionId: message.interviewQuestionId,
      })),
      checkpointStates: checkpointStates.map((state) => ({
        checkpointKey: state.checkpointKey,
        status: state.status,
        scoreAwarded: state.scoreAwarded,
        maxScore: state.maxScore,
        followUpCount: state.followUpCount,
        evidenceSummary: state.evidenceSummary,
      })),
      badAnswerExamples,
      limits: getAdaptiveInterviewContextLimits(),
    });
  }
}
