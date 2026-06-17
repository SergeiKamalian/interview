import type { CheckpointEvaluationResultItem } from './types/evaluation.types';
import type { CheckpointDefinition } from './types/checkpoint-evaluation.types';
import type { UpsertQuestionEvaluationData } from './entities/question-evaluation.entity';

const PARTIAL_SCORE_RATIO = 0.5;

export type QuestionEvaluationScoreSummary = {
  score: number;
  maxScore: number;
  shortSummary: string;
  review: string;
  needsManualReview: boolean;
  strengths: string[];
  gaps: string[];
};

export function buildQuestionEvaluationPayload(input: {
  companyId: number;
  interviewAttemptId: number;
  interviewMessageId: number;
  interviewQuestionId: number;
  checkpoints: CheckpointDefinition[];
  checkpointResults: CheckpointEvaluationResultItem[];
  rawResponse: Record<string, unknown>;
  repairAttempted: boolean;
}): UpsertQuestionEvaluationData {
  const summary = summarizeCheckpointResults(
    input.checkpoints,
    input.checkpointResults,
    input.repairAttempted,
  );

  return {
    companyId: input.companyId,
    interviewAttemptId: input.interviewAttemptId,
    interviewMessageId: input.interviewMessageId,
    interviewQuestionId: input.interviewQuestionId,
    score: summary.score,
    maxScore: summary.maxScore,
    shortSummary: summary.shortSummary,
    review: summary.review,
    rawResponse: input.rawResponse,
    needsManualReview: summary.needsManualReview,
  };
}

export function summarizeCheckpointResults(
  checkpoints: CheckpointDefinition[],
  checkpointResults: CheckpointEvaluationResultItem[],
  repairAttempted: boolean,
): QuestionEvaluationScoreSummary {
  const resultsByKey = new Map(
    checkpointResults.map((result) => [result.checkpointKey, result]),
  );

  let score = 0;
  let maxScore = 0;
  let metCount = 0;
  let partialCount = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];
  const reviewLines: string[] = [];

  for (const checkpoint of checkpoints) {
    maxScore += checkpoint.score;
    const result = resultsByKey.get(checkpoint.checkpointKey);

    if (!result) {
      gaps.push(checkpoint.title);
      reviewLines.push(`- ${checkpoint.title}: not evaluated`);
      continue;
    }

    const awarded = resolveQuestionScoreAwarded(checkpoint.score, result);
    score += awarded;

    if (result.status === 'met') {
      metCount += 1;
      strengths.push(checkpoint.title);
      reviewLines.push(`- ${checkpoint.title}: met (${result.reasoningShort})`);
      continue;
    }

    if (result.status === 'partially_met') {
      partialCount += 1;
      gaps.push(checkpoint.title);
      reviewLines.push(
        `- ${checkpoint.title}: partially met (${result.reasoningShort})`,
      );
      continue;
    }

    gaps.push(checkpoint.title);
    reviewLines.push(
      `- ${checkpoint.title}: not met (${result.reasoningShort})`,
    );
  }

  const roundedScore = roundScore(score);
  const roundedMaxScore = roundScore(maxScore);

  return {
    score: roundedScore,
    maxScore: roundedMaxScore,
    shortSummary: `${metCount}/${checkpoints.length} checkpoints met. Score ${roundedScore}/${roundedMaxScore}.`,
    review: reviewLines.join('\n'),
    strengths,
    gaps,
    needsManualReview: repairAttempted || partialCount > 0,
  };
}

function awardCheckpointScore(
  maxCheckpointScore: number,
  status: CheckpointEvaluationResultItem['status'],
): number {
  if (status === 'met') {
    return maxCheckpointScore;
  }

  if (status === 'partially_met') {
    return maxCheckpointScore * PARTIAL_SCORE_RATIO;
  }

  return 0;
}

function resolveQuestionScoreAwarded(
  maxCheckpointScore: number,
  result: CheckpointEvaluationResultItem,
): number {
  if (
    typeof result.scoreAwarded === 'number' &&
    Number.isFinite(result.scoreAwarded)
  ) {
    return Math.min(maxCheckpointScore, Math.max(0, result.scoreAwarded));
  }

  return awardCheckpointScore(maxCheckpointScore, result.status);
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
