import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import {
  applyProbingDepthToLimits,
  getAdaptiveInterviewContextLimits,
} from '../config/adaptive-interview-context.config';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { buildAdaptiveInterviewContextPacket } from '../utils/build-adaptive-interview-context.util';
import { attachSnapshotExamplesToCheckpoints } from '../utils/attach-snapshot-examples.util';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import {
  DEFAULT_AI_TONE,
  DEFAULT_PROBING_DEPTH,
  DEFAULT_SCORING_STRICTNESS,
} from '../../interview-core/types/interview-config.enum';

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

    const [
      messages,
      snapshotCheckpoints,
      checkpointStates,
      snapshotExamples,
      interview,
    ] = await Promise.all([
      this.interviewRepository.listMessages(attemptId),
      this.interviewRepository.findCheckpointsByInterviewQuestionId(
        interviewQuestionId,
      ),
      this.checkpointStateRepository.findByAttemptAndQuestion(
        attemptId,
        interviewQuestionId,
      ),
      this.interviewRepository.findAnswerExamplesByInterviewQuestionId(
        interviewQuestionId,
      ),
      this.interviewRepository.findById(interviewQuestion.interviewId),
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

    const checkpoints = attachSnapshotExamplesToCheckpoints(
      snapshotCheckpoints.map((checkpoint) => ({
        checkpointKey: checkpoint.checkpointKey,
        title: checkpoint.title,
        expected: checkpoint.expected,
        score: checkpoint.score,
        sortOrder: checkpoint.sortOrder,
        evaluationHints: checkpoint.evaluationHints,
      })),
      snapshotExamples,
    );

    const badAnswerExamples = checkpoints.flatMap((checkpoint) => [
      ...(checkpoint.badExamples ?? []),
      ...(checkpoint.questionBadExamples ?? []),
    ]);

    if (snapshotExamples.length === 0 && interviewQuestion.sourceQuestionId) {
      const legacyBadExamples =
        await this.interviewRepository.findBadAnswerExamplesBySourceQuestionId(
          interviewQuestion.sourceQuestionId,
        );
      badAnswerExamples.push(...legacyBadExamples);
    }

    const uniqueBadExamples = [...new Set(badAnswerExamples)];

    return buildAdaptiveInterviewContextPacket({
      interviewQuestionId: interviewQuestion.id,
      interviewId: interviewQuestion.interviewId,
      attemptId,
      companyId:
        attemptMessage?.companyId ?? checkpointStates[0]?.companyId ?? 0,
      aiTone: interview?.aiTone ?? DEFAULT_AI_TONE,
      probingDepth: interview?.probingDepth ?? DEFAULT_PROBING_DEPTH,
      scoringStrictness:
        interview?.scoringStrictness ?? DEFAULT_SCORING_STRICTNESS,
      timeLimitMinutes: interview?.timeLimitMinutes ?? null,
      questionText: interviewQuestion.questionText,
      shortAnswer: interviewQuestion.shortAnswer,
      idealAnswer: interviewQuestion.idealAnswer,
      maxScore: interviewQuestion.maxScore,
      checkpoints,
      questionMessages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        sequenceOrder: message.sequenceOrder,
        interviewQuestionId: message.interviewQuestionId,
        messageKind: message.messageKind,
        targetCheckpointKey: message.targetCheckpointKey,
      })),
      checkpointStates: checkpointStates.map((state) => ({
        checkpointKey: state.checkpointKey,
        status: state.status,
        scoreAwarded: state.scoreAwarded,
        maxScore: state.maxScore,
        followUpCount: state.followUpCount,
        evidenceSummary: state.evidenceSummary,
        rationale: state.rationale,
      })),
      badAnswerExamples: uniqueBadExamples,
      limits: applyProbingDepthToLimits(
        getAdaptiveInterviewContextLimits(),
        interview?.probingDepth ?? DEFAULT_PROBING_DEPTH,
      ),
    });
  }
}
