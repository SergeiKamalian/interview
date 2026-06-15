import type { InterviewQuestionCheckpointEntity } from '../../interview-core/entities/interview-question-checkpoint.entity';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';
import type { UpsertInterviewQuestionSummaryData } from '../entities/interview-question-summary.entity';

export function buildQuestionSummaryFromCheckpointStates(input: {
  companyId: number;
  attemptId: number;
  interviewQuestionId: number;
  checkpoints: InterviewQuestionCheckpointEntity[];
  states: InterviewCheckpointStateEntity[];
  followUpCount: number;
}): UpsertInterviewQuestionSummaryData {
  const statesByKey = new Map(
    input.states.map((state) => [state.checkpointKey, state]),
  );

  let score = 0;
  let maxScore = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const unclearCheckpoints: string[] = [];
  let needsManualReview = false;

  for (const checkpoint of input.checkpoints) {
    maxScore += checkpoint.score;
    const state = statesByKey.get(checkpoint.checkpointKey);

    if (!state) {
      weaknesses.push(checkpoint.title);
      continue;
    }

    score += state.scoreAwarded;

    if (state.needsManualReview) {
      needsManualReview = true;
    }

    if (state.status === 'covered') {
      strengths.push(checkpoint.title);
      continue;
    }

    if (state.status === 'partial') {
      weaknesses.push(checkpoint.title);
      continue;
    }

    if (state.status === 'unclear') {
      unclearCheckpoints.push(checkpoint.checkpointKey);
      weaknesses.push(checkpoint.title);
      continue;
    }

    if (state.status === 'missed' || state.status === 'skipped') {
      weaknesses.push(checkpoint.title);
    }
  }

  const roundedScore = roundScore(score);
  const roundedMaxScore = roundScore(maxScore);
  const coveredCount = input.states.filter(
    (state) => state.status === 'covered',
  ).length;

  return {
    companyId: input.companyId,
    interviewAttemptId: input.attemptId,
    interviewQuestionId: input.interviewQuestionId,
    score: roundedScore,
    maxScore: roundedMaxScore,
    summary: `${coveredCount}/${input.checkpoints.length} checkpoints covered. Score ${roundedScore}/${roundedMaxScore}.`,
    strengths: strengths.length > 0 ? strengths : null,
    weaknesses: weaknesses.length > 0 ? weaknesses : null,
    unclearCheckpoints:
      unclearCheckpoints.length > 0 ? unclearCheckpoints : null,
    followUpCount: input.followUpCount,
    needsManualReview,
  };
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
