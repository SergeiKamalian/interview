import type { InterviewQuestionCheckpointEntity } from '../../interview-core/entities/interview-question-checkpoint.entity';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';
import type { UpsertInterviewQuestionSummaryData } from '../entities/interview-question-summary.entity';
import { isMustHaveCheckpoint } from './probe-policy.util';

/**
 * TASK-17.3: a checkpoint counts toward the question score (numerator AND
 * denominator) only when it was actually assessed:
 *  - must-have (probe-required tier / heavy weight) — always counted; or
 *  - has positive evidence (covered/partial or score > 0); or
 *  - was actually probed (followUpCount > 0 — asked but possibly unanswered).
 *
 * A SECONDARY checkpoint that was never probed and shows no evidence (typical at
 * probing_depth=shallow) is NOT counted — so unasked secondary criteria can no
 * longer topple a strong answer. A probed-but-missed checkpoint stays counted,
 * preserving the penalty for "asked and not answered". This normalizes by
 * touched checkpoints WITHOUT changing weights / max_score / criteria.
 */
function isCheckpointAssessed(
  checkpoint: InterviewQuestionCheckpointEntity,
  state: InterviewCheckpointStateEntity | undefined,
  questionMaxScore: number,
): boolean {
  const mustHave = isMustHaveCheckpoint({
    checkpointWeight: checkpoint.score,
    hints: checkpoint.evaluationHints,
    questionMaxScore,
  });

  if (mustHave) {
    return true;
  }

  if (!state) {
    return false;
  }

  const hasEvidence =
    state.status === 'covered' ||
    state.status === 'partial' ||
    state.scoreAwarded > 0;
  const wasProbed = state.followUpCount > 0;

  return hasEvidence || wasProbed;
}

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

  const fullMaxScore = input.checkpoints.reduce(
    (total, checkpoint) => total + checkpoint.score,
    0,
  );

  let score = 0;
  let maxScore = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const unclearCheckpoints: string[] = [];
  let assessedCount = 0;
  let coveredCount = 0;
  let partialCount = 0;
  let needsManualReview = false;

  for (const checkpoint of input.checkpoints) {
    const state = statesByKey.get(checkpoint.checkpointKey);

    // TASK-17.3: skip never-asked secondary checkpoints (no penalty, no listing).
    if (!isCheckpointAssessed(checkpoint, state, fullMaxScore)) {
      continue;
    }

    maxScore += checkpoint.score;
    assessedCount += 1;

    if (!state) {
      weaknesses.push(checkpoint.title);
      continue;
    }

    score += state.scoreAwarded;

    if (state.needsManualReview) {
      needsManualReview = true;
    }

    if (state.status === 'covered') {
      coveredCount += 1;
      strengths.push(checkpoint.title);
      continue;
    }

    if (state.status === 'partial') {
      partialCount += 1;
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

  // Guard: if nothing was assessed (e.g. no must-have checkpoints and an empty
  // answer), fall back to the full denominator so a no-answer still scores 0/max
  // instead of 0/0.
  if (maxScore === 0) {
    maxScore = fullMaxScore;
    assessedCount = input.checkpoints.length;
  }

  const roundedScore = roundScore(score);
  const roundedMaxScore = roundScore(maxScore);

  // TASK-17.4: "coverage" = covered + partial (partial still counts as the
  // candidate having addressed the checkpoint). The denominator is the number of
  // ASSESSED checkpoints (TASK-17.3), never the full bank set — so a strong
  // answer no longer reports a misleading "0/N covered" that the final narrative
  // would otherwise turn into a "low coverage" risk.
  const addressedCount = coveredCount + partialCount;

  return {
    companyId: input.companyId,
    interviewAttemptId: input.attemptId,
    interviewQuestionId: input.interviewQuestionId,
    score: roundedScore,
    maxScore: roundedMaxScore,
    summary: `${addressedCount}/${assessedCount} checkpoints addressed (${coveredCount} covered, ${partialCount} partial). Score ${roundedScore}/${roundedMaxScore}.`,
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
