import { Injectable } from '@nestjs/common';
import { getAdaptiveInterviewContextLimits } from '../config/adaptive-interview-context.config';
import { getFollowUpEvidenceWeightConfig } from '../config/follow-up-evidence-weight.config';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type {
  FollowUpPolicyDecision,
  FollowUpPolicyInput,
} from '../types/follow-up-planner.types';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import { evaluateFollowUpPolicy } from '../utils/follow-up-policy.util';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';
import { collectCheckpointEvidenceText } from '../utils/checkpoint-evidence-text.util';

@Injectable()
export class FollowUpPolicyService {
  evaluate(
    context: AdaptiveInterviewContextPacket,
    checkpointStates: InterviewCheckpointStateEntity[],
    followUpsUsedForQuestion: number,
    candidateDispositionFromAi?: CandidateAnswerDisposition | null,
    recentScoreDeltas?: number[],
  ): FollowUpPolicyDecision {
    const limits = getAdaptiveInterviewContextLimits();

    const weightConfig = getFollowUpEvidenceWeightConfig();

    const checkpointEvidenceTextByKey = Object.fromEntries(
      context.checkpoints.map((checkpoint) => [
        checkpoint.checkpointKey,
        collectCheckpointEvidenceText(context, checkpoint.checkpointKey),
      ]),
    );

    const input: FollowUpPolicyInput = {
      questionMaxScore: context.maxScore,
      checkpoints: context.checkpoints,
      checkpointStates: checkpointStates.map((state) => ({
        checkpointKey: state.checkpointKey,
        status: state.status,
        scoreAwarded: state.scoreAwarded,
        maxScore: state.maxScore,
        followUpCount: state.followUpCount,
        needsManualReview: state.needsManualReview,
        rationale: state.rationale,
      })),
      followUpsUsedForQuestion,
      maxFollowUpsPerQuestion: limits.maxFollowUpsPerQuestion,
      maxFollowUpsPerCheckpoint: limits.maxFollowUpsPerCheckpoint,
      questionScoreSufficientRatio: limits.questionScoreSufficientRatio,
      lowWeightCheckpointRatio: limits.lowWeightCheckpointRatio,
      stagnationLimit: weightConfig.stagnationLimit,
      recentScoreDeltas,
      latestCandidateAnswer: context.latestCandidateAnswer,
      checkpointEvidenceTextByKey,
      candidateDispositionFromAi: candidateDispositionFromAi ?? undefined,
      stickyTargetCheckpointKey: context.targetCheckpointKey,
    };

    return evaluateFollowUpPolicy(input);
  }

  isCheckpointEligible(
    status: CheckpointStateStatus,
    scoreAwarded: number,
    maxScore: number,
  ): boolean {
    if (status === 'covered' || status === 'skipped' || status === 'unseen') {
      return false;
    }

    if (status === 'partial' && scoreAwarded >= maxScore) {
      return false;
    }

    return status === 'missed' || status === 'unclear' || status === 'partial';
  }
}
