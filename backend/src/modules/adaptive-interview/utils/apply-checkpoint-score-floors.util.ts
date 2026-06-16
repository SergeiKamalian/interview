import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
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
  rationaleIndicatesSoundEvidence,
} from './bad-answer-signature.util';
import { isTargetedTopicRefusal } from './candidate-decline.util';
import { extractFalseClaimQuote } from './false-claim-quote.util';
import { mergeCheckpointEvaluation } from './merge-checkpoint-evaluation.util';
import { alignRationaleDepthWithScore } from './rationale-depth-alignment.util';
import { getPositiveEvidenceScoreFloor } from './positive-evidence-floor.util';

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
                  applyRationaleContradictionCap(
                    applySemanticContradictionCap(
                      result,
                      latestCandidateText,
                      checkpoint.score,
                    ),
                    checkpoint.score,
                  ),
                  latestCandidateText,
                  badExamples,
                  checkpoint.score,
                ),
                latestCandidateText,
                checkpoint.score,
                result.checkpointKey,
              ),
              latestCandidateText,
              fullCandidateText,
              checkpoint.score,
              result.checkpointKey,
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
        result.checkpointKey,
        guardedWithQuote.rationale,
        latestCandidateText,
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

  if (getContradictionScoreCap(original.checkpointKey, candidateText) !== null) {
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
  maxScore: number,
  checkpointKey: string,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    !isTargetedTopicRefusal(latestCandidateText) ||
    !refusalTargetsCheckpoint(latestCandidateText, checkpointKey) ||
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
  checkpointKey: string,
): boolean {
  const normalized = answer.toLowerCase();
  const topicPatterns: Record<string, RegExp[]> = {
    lanes_priority: [
      /lanes/i,
      /приоритет/i,
      /transition/i,
      /deferred/i,
      /concurrent\s+api/i,
    ],
    scheduling: [/планирован/i, /scheduler/i, /scheduling/i],
    render_phase: [/render\s+phase/i, /wip\s+tree/i],
    commit_phase: [/commit\s+phase/i, /layout\s+effect/i],
    commit_limitation: [/concurrent\s+mode/i, /commit/i],
    fiber_pointers: [/fiber-узл/i, /child/i, /sibling/i],
    stack_vs_fiber: [/stack/i, /reconciler/i],
    fiber_definition: [/fiber/i, /reconcil/i],
  };

  const patterns = topicPatterns[checkpointKey];
  if (!patterns) {
    return false;
  }

  return patterns.some((pattern) => pattern.test(normalized));
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

  const cap = partialScoreForMax(maxScore);
  return {
    ...result,
    scoreAwarded: cap,
    status: cap > 0 ? 'partial' : 'missed',
    rationale: `${result.rationale} depth=false_claim. Score capped: rationale notes material errors.`,
  };
}

function applyBadExampleOverlapCap(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  candidateText: string,
  _badExamples: string[],
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.scoreAwarded <= 0) {
    return result;
  }

  if (rationaleIndicatesSoundEvidence(result.rationale)) {
    return result;
  }

  if (!matchesDistinctiveBadAnswerClaim(candidateText)) {
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
  maxScore: number,
  checkpointKey: string,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    isTargetedTopicRefusal(latestCandidateText) &&
    refusalTargetsCheckpoint(latestCandidateText, checkpointKey)
  ) {
    return result;
  }

  const floor = getPositiveEvidenceScoreFloor(
    checkpointKey,
    latestCandidateText,
    fullCandidateText,
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

  const scoreAwarded = Math.min(maxScore, Math.max(result.scoreAwarded, floor));
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
      scoreAwarded >= maxScore
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
  candidateText: string,
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  const cap = getContradictionScoreCap(result.checkpointKey, candidateText);
  if (cap === null || result.scoreAwarded <= cap) {
    return result;
  }

  const scoreAwarded = Math.min(maxScore, cap);
  return {
    ...result,
    scoreAwarded,
    status: scoreAwarded > 0 ? 'partial' : 'missed',
    rationale: `${result.rationale} depth=false_claim. Semantic guard capped score because candidate evidence contains a direct contradiction.`,
  };
}

function getContradictionScoreCap(
  checkpointKey: string,
  candidateText: string,
): number | null {
  const has = (patterns: RegExp[]) =>
    patterns.some((pattern) => pattern.test(candidateText));

  if (
    checkpointKey === 'type_safety' &&
    has([
      /строк.{0,80}(?:выход|верн).{0,40}числ/i,
      /string.{0,80}(?:return|верн|выход).{0,40}number/i,
      /не\s+связывает\s+вход\s+и\s+выход/i,
      /вернуть\s+уже\s+другой\s+t/i,
      /любой\s+тип\s+результата\s+независимо\s+от\s+вход/i,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'type_parameter' &&
    has([/generic.{0,40}(?:как|вроде)\s+any/i, /почти\s+как\s+any/i])
  ) {
    return 0.5;
  }

  if (
    checkpointKey === 'constraints' &&
    has([
      /сам\s+(?:узна[её]т|пойм[её]т)\s+все\s+поля/i,
      /можно\s+обращаться\s+к\s+любому\s+полю/i,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'run_timing' &&
    has([/до\s+рендер/i, /before\s+render/i, /заранее\s+подготовить\s+dom/i])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'dependency_array' &&
    has([
      /зависимост.{0,80}заново\s+отрис/i,
      /эффект\s+запускает\s+(?:этот\s+)?ререндер/i,
      /react\s+понимал\s+когда\s+надо\s+заново\s+отрис/i,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'cleanup' &&
    has([
      /сразу.{0,80}(?:clearinterval|unsubscribe|отпис)/i,
      /react\s+.*сам\s+.*чист/i,
      /cleanup\s+не\s+.*обязательно/i,
      /return\s+cleanup\s+.*не\s+нуж/i,
    ])
  ) {
    return 0.5;
  }

  if (
    checkpointKey === 'side_effects' &&
    has([/вместо\s+usestate/i, /нужен.{0,80}перерис/i])
  ) {
    return 0.5;
  }

  if (
    checkpointKey === 'scheduling' &&
    hasPositiveRequestIdleCallbackClaim(candidateText)
  ) {
    return partialScoreForMax(1);
  }

  if (
    checkpointKey === 'stack_vs_fiber' &&
    has([
      /через\s+promises?/i,
      /полностью\s+асинхронн/i,
      /клики\s+всегда\s+проходят/i,
      /redux/i,
    ])
  ) {
    return partialScoreForMax(1);
  }

  if (
    checkpointKey === 'fiber_pointers' &&
    has([
      /\bparent\b.*\bnext\b/i,
      /лежат\s+в\s+redux/i,
      /virtual\s+dom.{0,40}(?:fiber|узл)/i,
      /хранит.{0,40}virtual\s+dom/i,
    ])
  ) {
    return partialScoreForMax(1);
  }

  if (
    checkpointKey === 'commit_phase' &&
    has([
      /useeffect.{0,40}commit/i,
      /useeffect.{0,40}до\s+paint/i,
      /тоже\s+в\s+commit.{0,40}до\s+paint/i,
      /fiber.{0,40}разбивает.{0,40}commit/i,
      /commit.{0,40}куск/i,
      /commit.{0,40}5\s*ms/i,
      /commit.{0,60}(?:может|можно)\s+прерыв/i,
      /(?:может|можно)\s+прервать.{0,40}commit/i,
      /requestidlecallback/i,
    ])
  ) {
    return partialScoreForMax(1);
  }

  if (
    checkpointKey === 'lanes_priority' &&
    has([
      /lanes?.{0,40}redux/i,
      /redux.{0,40}lanes?/i,
      /requestidlecallback/i,
    ])
  ) {
    return partialScoreForMax(1);
  }

  if (
    checkpointKey === 'commit_limitation' &&
    has([
      /concurrent.{0,40}не\s+лаг/i,
      /вообще\s+не\s+лаг/i,
      /не\s+лагает.{0,40}тысяч/i,
      /10000|10\s*000/,
    ])
  ) {
    return 0;
  }

  if (
    checkpointKey === 'render_phase' &&
    has([
      /requestidlecallback/i,
      /concurrent.{0,40}не\s+лаг/i,
    ])
  ) {
    return partialScoreForMax(1);
  }

  return null;
}

function hasPositiveRequestIdleCallbackClaim(candidateText: string): boolean {
  if (/(?:не|not|instead\s+of|а\s+не)\s+.{0,30}request\s*idle\s*callback/i.test(
    candidateText,
  )) {
    return false;
  }

  return /request\s*idle\s*callback|requestidlecallback/i.test(candidateText);
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
  checkpointKey: string,
  rationale: string | null | undefined,
  latestCandidateText: string,
): boolean {
  if (
    isTargetedTopicRefusal(latestCandidateText) &&
    refusalTargetsCheckpoint(latestCandidateText, checkpointKey)
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
    context.targetCheckpointKey !== checkpointKey
  ) {
    return getContradictionScoreCap(checkpointKey, latestCandidateText) !== null;
  }

  return true;
}

export { getContradictionScoreCap };
