import type {
  AdaptiveCheckpointDefinition,
  AdaptiveInterviewContextPacket,
} from '../types/adaptive-interview-context.types';
import type { CheckpointGuardAdjustment } from '../types/checkpoint-guard-adjustment.types';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import type { EvaluationEvidenceSource } from '../types/evaluation-evidence-source.type';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluationStatus,
} from '../types/per-turn-evaluation.types';
import { getPerTurnCheckpointEvaluationPromptVersion } from '../prompts/per-turn-checkpoint-evaluation.prompt';
import {
  matchesDistinctiveBadAnswerClaim,
  overlapsQuestionBadAnswerExamples,
  rationaleIndicatesSoundEvidence,
} from './bad-answer-signature.util';
import { isTargetedTopicRefusal } from './candidate-decline.util';
import { extractFalseClaimQuote } from './false-claim-quote.util';
import { mergeCheckpointEvaluation } from './merge-checkpoint-evaluation.util';
import { alignRationaleDepthWithScore } from './rationale-depth-alignment.util';
import {
  getContradictionScoreCap,
  getPositiveEvidenceScoreFloor,
} from './hint-driven-evidence.util';

export type ApplyCheckpointScoreFloorsResult = {
  evaluation: PerTurnCheckpointEvaluationAiResponse;
  adjustments: CheckpointGuardAdjustment[];
};

export function applyCheckpointScoreFloors(
  evaluation: PerTurnCheckpointEvaluationAiResponse,
  context: AdaptiveInterviewContextPacket,
  options: { evidenceSource?: EvaluationEvidenceSource } = {},
): ApplyCheckpointScoreFloorsResult {
  const fullCandidateText = collectFullCandidateText(context);
  const latestCandidateText = collectLatestCandidateText(context);
  const badExamples = context.badAnswerExamples ?? [];
  const promptVersion = getPerTurnCheckpointEvaluationPromptVersion();
  const adjustments: CheckpointGuardAdjustment[] = [];

  const checkpointResults = evaluation.checkpointResults.map((result) => {
    const checkpoint = context.checkpoints.find(
      (item) => item.checkpointKey === result.checkpointKey,
    );
    const priorState = context.checkpointStates.find(
      (item) => item.checkpointKey === result.checkpointKey,
    );

    if (!checkpoint) {
      return result;
    }

    const aiSnapshot = {
      status: result.status,
      scoreAwarded: result.scoreAwarded,
    };

    const guardedResult = enforceStatusScoreAlignment(
        applyRationaleScoreAlignment(
            applyPositiveEvidenceFloor(
              applyExplicitRefusalCap(
                applyBadExampleOverlapCap(
                  applySemanticContradictionCap(
                    applyRationaleContradictionCap(
                      result,
                      checkpoint.score,
                    ),
                    latestCandidateText,
                    fullCandidateText,
                    checkpoint,
                  ),
                  latestCandidateText,
                  fullCandidateText,
                  [
                    ...badExamples,
                    ...(checkpoint.badExamples ?? []),
                    ...(checkpoint.questionBadExamples ?? []),
                  ],
                  checkpoint.score,
                ),
                latestCandidateText,
                checkpoint,
              ),
              latestCandidateText,
              fullCandidateText,
              checkpoint,
            ),
          checkpoint.score,
        ),
      checkpoint.score,
    );

    if (
      guardedResult.status !== aiSnapshot.status ||
      guardedResult.scoreAwarded !== aiSnapshot.scoreAwarded
    ) {
      adjustments.push({
        checkpointKey: result.checkpointKey,
        aiStatus: aiSnapshot.status,
        aiScore: aiSnapshot.scoreAwarded,
        guardedStatus: guardedResult.status,
        guardedScore: guardedResult.scoreAwarded,
        reason: resolveAdjustmentReason(
          result,
          guardedResult,
          latestCandidateText,
          checkpoint,
        ),
        promptVersion,
      });
    }

    const guardedWithQuote = attachFalseClaimEvidence(
      guardedResult,
      latestCandidateText,
      result.checkpointKey,
    );

    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: priorState?.scoreAwarded ?? 0,
      currentStatus: (priorState?.status ?? 'unseen') as CheckpointStateStatus,
      currentEvidenceSummary: null,
      currentRationale: null,
      incomingScoreAwarded: guardedWithQuote.scoreAwarded,
      incomingStatus: guardedWithQuote.status,
      incomingEvidenceSummary: guardedWithQuote.evidenceSummary,
      incomingRationale: guardedWithQuote.rationale,
      maxScore: checkpoint.score,
      evidenceSource: options.evidenceSource,
      relaxFollowUpWeight:
        context.latestAnswerMessageKind === 'follow_up_answer' &&
        context.targetCheckpointKey === result.checkpointKey,
      incomingAllowsScoreDecrease: resolveIncomingAllowsScoreDecrease(
        context,
        checkpoint,
        guardedWithQuote.rationale,
        latestCandidateText,
        fullCandidateText,
      ),
    });

    return {
      ...result,
      scoreAwarded: merged.scoreAwarded,
      status: merged.status as PerTurnCheckpointEvaluationStatus,
      evidenceSummary: merged.evidenceSummary,
      rationale: alignRationaleDepthWithScore(
        normalizeRationaleDepth(merged.rationale ?? result.rationale),
        merged.scoreAwarded,
        checkpoint.score,
      ),
    };
  });

  return {
    evaluation: {
      ...evaluation,
      checkpointResults,
    },
    adjustments,
  };
}

function resolveAdjustmentReason(
  original: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  guarded: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  candidateText: string,
  checkpoint: AdaptiveCheckpointDefinition,
): CheckpointGuardAdjustment['reason'] {
  if (
    original.status === 'covered' &&
    guarded.status !== 'covered' &&
    /incorrect|wrong|contradict|неверн|ошиб|противореч/i.test(
      original.rationale ?? '',
    )
  ) {
    return 'rationale_contradiction_cap';
  }

  if (
    getContradictionScoreCap(checkpoint, candidateText, checkpoint.score) !== null
  ) {
    return 'semantic_contradiction_cap';
  }

  if (original.status === 'covered' && guarded.status !== 'covered') {
    return 'status_score_alignment';
  }

  return 'bad_example_overlap_cap';
}

function collectFullCandidateText(context: AdaptiveInterviewContextPacket): string {
  return [
    ...context.localTurns
      .filter((turn) => turn.role === 'candidate')
      .map((turn) => turn.content),
    context.latestCandidateAnswer,
  ]
    .join(' ')
    .toLowerCase();
}

function collectLatestCandidateText(
  context: AdaptiveInterviewContextPacket,
): string {
  return (context.latestCandidateAnswer ?? '').toLowerCase();
}

function hasFalseClaimInRationale(rationale: string | null | undefined): boolean {
  return /depth\s*=\s*false_claim/i.test(rationale ?? '');
}

function normalizeRationaleDepth(rationale: string | null | undefined): string {
  if (!rationale || !/depth\s*=\s*false_claim/i.test(rationale)) {
    return rationale ?? '';
  }

  return rationale
    .replace(
      /depth\s*=\s*(?:knows|understands|partial_knowledge|heard_of|mention_only)/gi,
      'depth=mention_only',
    )
    .replace(/accuracy\s*=\s*full/gi, 'accuracy=wrong');
}

function attachFalseClaimEvidence(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  latestCandidateText: string,
  checkpointKey: string,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (!hasFalseClaimInRationale(result.rationale)) {
    return result;
  }

  const quote = extractFalseClaimQuote(latestCandidateText, checkpointKey);
  if (!quote) {
    return result;
  }

  return {
    ...result,
    evidenceSummary: quote,
  };
}

function applyExplicitRefusalCap(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  latestCandidateText: string,
  checkpoint: AdaptiveCheckpointDefinition,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    !isTargetedTopicRefusal(latestCandidateText) ||
    !refusalTargetsCheckpoint(latestCandidateText, checkpoint) ||
    result.scoreAwarded <= 0
  ) {
    return result;
  }

  return {
    ...result,
    scoreAwarded: 0,
    status: 'missed',
    rationale: `${stripTrailingDepth(result.rationale)} depth=heard_of. Explicit refusal in latest answer.`,
  };
}

function refusalTargetsCheckpoint(
  answer: string,
  checkpoint: AdaptiveCheckpointDefinition,
): boolean {
  const normalized = answer.toLowerCase();
  const source = `${checkpoint.title} ${checkpoint.expected} ${checkpoint.checkpointKey.replace(/_/g, ' ')}`;
  const tokens = source
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4);

  if (tokens.length === 0) {
    return false;
  }

  const hits = tokens.filter((token) => normalized.includes(token)).length;
  const threshold = Math.min(2, tokens.length);

  return hits >= threshold;
}

function stripTrailingDepth(rationale: string | null | undefined): string {
  return (rationale ?? '')
    .replace(/\s*depth\s*=\s*\w+/gi, '')
    .replace(/\s*accuracy\s*=\s*\w+/gi, '')
    .trim();
}

function applyRationaleContradictionCap(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.scoreAwarded < maxScore || result.status !== 'covered') {
    return result;
  }

  const rationale = (result.rationale ?? '').toLowerCase();
  if (rationaleIndicatesOmissionNotContradiction(rationale)) {
    return result;
  }

  const admitsError = [
    /incorrect/,
    /wrong/,
    /contradict/,
    /не\s+соответствует/,
    /неверн/,
    /ошиб/,
    /противореч/,
    /неправильн/,
    /не\s+так/,
    /перепутал/,
    /не\s+точн/,
    /слишком\s+категорич/,
    /ложн/,
    /не\s+упомянул/,
    /не\s+раскрыт/,
    /добавлени[ея].{0,40}ошиб/,
  ].some((pattern) => pattern.test(rationale));

  if (!admitsError) {
    return result;
  }

  const accuracyWrong = /accuracy\s*=\s*wrong/i.test(rationale);
  const cap = accuracyWrong ? 0 : partialScoreForMax(maxScore);
  return {
    ...result,
    scoreAwarded: cap,
    status: cap > 0 ? 'partial' : 'missed',
    rationale: `${result.rationale} depth=false_claim. Score capped: rationale notes material errors.`,
  };
}

function applyBadExampleOverlapCap(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  latestCandidateText: string,
  fullCandidateText: string,
  badExamples: string[],
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.scoreAwarded <= 0) {
    return result;
  }

  if (rationaleIndicatesSoundEvidence(result.rationale)) {
    return result;
  }

  const overlapsBadExample =
    matchesDistinctiveBadAnswerClaim(latestCandidateText) ||
    matchesDistinctiveBadAnswerClaim(fullCandidateText) ||
    overlapsQuestionBadAnswerExamples(latestCandidateText, badExamples) ||
    overlapsQuestionBadAnswerExamples(fullCandidateText, badExamples);

  if (!overlapsBadExample) {
    return result;
  }

  const cap = partialScoreForMax(maxScore);
  return {
    ...result,
    scoreAwarded: Math.min(result.scoreAwarded, cap),
    status: 'partial',
    rationale: `${result.rationale} depth=false_claim. Score capped: overlaps bad answer example.`,
  };
}

function applyRationaleScoreAlignment(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  const rationale = result.rationale ?? '';
  if (
    /depth\s*=\s*false_claim/i.test(rationale) ||
    /accuracy\s*=\s*wrong/i.test(rationale)
  ) {
    return result;
  }

  const depth = rationale.match(/depth\s*=\s*([\w_]+)/i)?.[1]?.toLowerCase();
  const accuracy = rationale
    .match(/accuracy\s*=\s*([\w_]+)/i)?.[1]
    ?.toLowerCase();
  const coverage = rationale
    .match(/coverage\s*=\s*([\w_]+)/i)?.[1]
    ?.toLowerCase();

  let minScore: number | null = null;
  if (
    accuracy === 'full' &&
    (depth === 'knows' || depth === 'understands')
  ) {
    minScore = maxScore;
  } else if (accuracy === 'full' && depth === 'partial_knowledge') {
    minScore = strongPartialScoreForMax(maxScore);
  } else if (coverage === 'high' && accuracy === 'partial' && depth === 'understands') {
    minScore = strongPartialScoreForMax(maxScore);
  } else if (
    coverage === 'high' &&
    accuracy === 'partial' &&
    depth === 'partial_knowledge'
  ) {
    minScore = rationaleIndicatesSoundEvidence(rationale)
      ? strongPartialScoreForMax(maxScore)
      : moderatePartialScoreForMax(maxScore);
  } else if (coverage === 'high' && accuracy === 'partial') {
    minScore = moderatePartialScoreForMax(maxScore);
  } else if (
    coverage === 'medium' &&
    accuracy === 'partial' &&
    (depth === 'understands' || depth === 'partial_knowledge')
  ) {
    minScore = moderatePartialScoreForMax(maxScore);
  } else if (
    accuracy === 'partial' &&
    (depth === 'knows' ||
      depth === 'understands' ||
      depth === 'partial_knowledge')
  ) {
    minScore = partialScoreForMax(maxScore);
  }

  if (minScore === null || result.scoreAwarded >= minScore) {
    return result;
  }

  const scoreAwarded = Math.min(maxScore, minScore);
  return {
    ...result,
    scoreAwarded,
    status: scoreAwarded >= maxScore ? 'covered' : 'partial',
  };
}

function applyPositiveEvidenceFloor(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  latestCandidateText: string,
  fullCandidateText: string,
  checkpoint: AdaptiveCheckpointDefinition,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    isTargetedTopicRefusal(latestCandidateText) &&
    refusalTargetsCheckpoint(latestCandidateText, checkpoint)
  ) {
    return result;
  }

  const floor = getPositiveEvidenceScoreFloor(
    checkpoint.evaluationHints,
    latestCandidateText,
    fullCandidateText,
    checkpoint.score,
  );
  if (floor === null || matchesDistinctiveBadAnswerClaim(latestCandidateText)) {
    return result;
  }

  if (
    hasFalseClaimInRationale(result.rationale) ||
    /semantic guard capped/i.test(result.rationale ?? '')
  ) {
    return result;
  }

  const overlapFalseClaim = /overlaps bad answer example/i.test(
    result.rationale ?? '',
  );
  const underScored = result.scoreAwarded < floor;

  if (!overlapFalseClaim && !underScored) {
    return result;
  }

  const scoreAwarded = Math.min(
    checkpoint.score,
    Math.max(result.scoreAwarded, floor),
  );
  const cleanedRationale = (result.rationale ?? '')
    .replace(
      /depth\s*=\s*false_claim\.?\s*Score capped: overlaps bad answer example\.?/gi,
      '',
    )
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    ...result,
    scoreAwarded,
    status:
      scoreAwarded >= checkpoint.score
        ? 'covered'
        : scoreAwarded > 0
          ? 'partial'
          : 'missed',
    rationale: cleanedRationale
      ? `${cleanedRationale} Positive evidence floor applied.`
      : 'Positive evidence floor applied.',
  };
}

function enforceStatusScoreAlignment(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.scoreAwarded <= 0) {
    return {
      ...result,
      scoreAwarded: 0,
      status: 'missed',
    };
  }

  if (result.scoreAwarded < maxScore && result.status === 'covered') {
    return {
      ...result,
      status: 'partial',
    };
  }

  return result;
}

function partialScoreForMax(maxScore: number): number {
  return Number((maxScore * 0.5).toFixed(2));
}

function moderatePartialScoreForMax(maxScore: number): number {
  return Number((maxScore * 0.65).toFixed(2));
}

function strongPartialScoreForMax(maxScore: number): number {
  return Number((maxScore * 0.75).toFixed(2));
}

function applySemanticContradictionCap(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  latestCandidateText: string,
  fullCandidateText: string,
  checkpoint: AdaptiveCheckpointDefinition,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  const cap =
    getContradictionScoreCap(checkpoint, latestCandidateText, checkpoint.score) ??
    getContradictionScoreCap(checkpoint, fullCandidateText, checkpoint.score);
  if (cap === null || result.scoreAwarded <= cap) {
    return result;
  }

  const scoreAwarded = Math.min(checkpoint.score, cap);
  return {
    ...result,
    scoreAwarded,
    status: scoreAwarded > 0 ? 'partial' : 'missed',
    rationale: `${result.rationale} depth=false_claim. Semantic guard capped score because candidate evidence contains a direct contradiction.`,
  };
}

function rationaleIndicatesOmissionNotContradiction(
  rationale: string,
): boolean {
  return [
    /в\s+текущем\s+ответе\s+нет/i,
    /не\s+повторен/i,
    /ранее\s+было\s+покрыт/i,
    /текущий\s+ответ\s+не\s+противоречит/i,
    /не\s+адресован/i,
    /не\s+упомянут.{0,40}текущ/i,
  ].some((pattern) => pattern.test(rationale));
}

function resolveIncomingAllowsScoreDecrease(
  context: AdaptiveInterviewContextPacket,
  checkpoint: AdaptiveCheckpointDefinition,
  rationale: string | null | undefined,
  latestCandidateText: string,
  fullCandidateText: string,
): boolean {
  if (
    isTargetedTopicRefusal(latestCandidateText) &&
    refusalTargetsCheckpoint(latestCandidateText, checkpoint)
  ) {
    return true;
  }

  if (!hasFalseClaimInRationale(rationale)) {
    return false;
  }

  if (rationaleIndicatesOmissionNotContradiction((rationale ?? '').toLowerCase())) {
    return false;
  }

  if (
    context.latestAnswerMessageKind === 'follow_up_answer' &&
    context.targetCheckpointKey &&
    context.targetCheckpointKey !== checkpoint.checkpointKey
  ) {
    return (
      getContradictionScoreCap(
        checkpoint,
        latestCandidateText,
        checkpoint.score,
      ) !== null ||
      getContradictionScoreCap(
        checkpoint,
        fullCandidateText,
        checkpoint.score,
      ) !== null
    );
  }

  return true;
}

export { getContradictionScoreCap } from './hint-driven-evidence.util';
