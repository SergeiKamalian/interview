import type {
  AdaptiveCheckpointDefinition,
  AdaptiveInterviewContextPacket,
} from '../types/adaptive-interview-context.types';
import type { CheckpointGuardAdjustment } from '../types/checkpoint-guard-adjustment.types';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import type { EvaluationEvidenceSource } from '../types/evaluation-evidence-source.type';
import type { EvaluationMode } from '../types/evaluation-mode.type';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluationStatus,
} from '../types/per-turn-evaluation.types';
import { getPerTurnCheckpointEvaluationPromptVersion } from '../prompts/per-turn-checkpoint-evaluation.prompt';
import {
  matchesCheckpointFalseClaims,
  overlapsQuestionBadAnswerExamples,
  rationaleIndicatesSoundEvidence,
} from './bad-answer-signature.util';
import { isTargetedRefusalForPolicy } from './classifier-emergency-fallback.util';
import type { CandidateTurnKind } from '../types/candidate-turn-classifier.types';
import { isScopeClarificationTurn } from './candidate-clarification.util';
import {
  collectCheckpointEvidenceText,
  collectLatestCandidateText,
  stripNeutralMetaphors,
} from './checkpoint-evidence-text.util';
import { extractMatchedFalseClaimQuoteStrict } from './false-claim-quote.util';
import {
  parseCoverageFromRationale,
  parseDepthFromRationale,
} from './checkpoint-depth.util';
import { mergeCheckpointEvaluation } from './merge-checkpoint-evaluation.util';
import { alignRationaleDepthWithScore } from './rationale-depth-alignment.util';
import {
  getContradictionScoreCap,
  getPositiveEvidenceScoreFloor,
} from './hint-driven-evidence.util';
import {
  getScoringStrictnessScoreMultiplier,
  scaleGuardScore,
} from './scoring-strictness.util';
import {
  applyTransitiveCheckpointFloors,
  applyTransitiveFloorToGuardedResult,
  type TransitiveGuardedCheckpoint,
} from './transitive-checkpoint-floors.util';
import {
  appendTopicRedirectPendingRationale,
  inferExpectedCheckpointKey,
} from './topic-mismatch.util';
import {
  appendMetaTurnFrozenRationale,
  shouldFreezeCheckpointOnMetaTurn,
} from './resolve-evaluation-mode.util';
import {
  appendProbePendingRationale,
  deriveProbeStatus,
  getMissingMustConcepts,
  getShallowAcceptFloorFraction,
  getShallowAcceptFloorScore,
  hasFalseClaimSignal,
  isProbePendingRationale,
  resolveComplexityTier,
} from './probe-policy.util';

export type ApplyCheckpointScoreFloorsResult = {
  evaluation: PerTurnCheckpointEvaluationAiResponse;
  adjustments: CheckpointGuardAdjustment[];
};

export function applyCheckpointScoreFloors(
  evaluation: PerTurnCheckpointEvaluationAiResponse,
  context: AdaptiveInterviewContextPacket,
  options: {
    evaluationMode?: EvaluationMode;
    evidenceSource?: EvaluationEvidenceSource;
    candidateTurnKind?: CandidateTurnKind | null;
    candidateDispositionFromClassifier?:
      | PerTurnCheckpointEvaluationAiResponse['candidateDisposition']
      | null;
  } = {},
): ApplyCheckpointScoreFloorsResult {
  const expectedCheckpointKey =
    inferExpectedCheckpointKey({
      checkpoints: context.checkpoints,
      targetCheckpointKey: context.targetCheckpointKey,
      questionText: context.questionText,
    }) ?? context.targetCheckpointKey;
  const evaluationMode = options.evaluationMode ?? 'full';
  const metaTurnTargetKey =
    context.targetCheckpointKey ?? expectedCheckpointKey ?? null;
  const latestCandidateText = collectLatestCandidateText(context);
  const badExamples = context.badAnswerExamples ?? [];
  const promptVersion = getPerTurnCheckpointEvaluationPromptVersion();
  // Per-interview scoring strictness (TASK-16.10): scales guard caps/floors only.
  // balanced (default / undefined) → 1 → byte-identical to prior behavior.
  const strictnessMultiplier = getScoringStrictnessScoreMultiplier(
    context.scoringStrictness,
  );
  const adjustments: CheckpointGuardAdjustment[] = [];

  const processed = evaluation.checkpointResults.map((result) => {
    const checkpoint = context.checkpoints.find(
      (item) => item.checkpointKey === result.checkpointKey,
    );
    const priorState = context.checkpointStates.find(
      (item) => item.checkpointKey === result.checkpointKey,
    );

    if (!checkpoint) {
      return { kind: 'passthrough' as const, result };
    }

    if (
      shouldFreezeCheckpointOnMetaTurn(
        evaluationMode,
        result.checkpointKey,
        metaTurnTargetKey,
      )
    ) {
      return {
        kind: 'frozen' as const,
        frozenResult: buildMetaTurnFrozenCheckpointResult(result, priorState),
      };
    }

    const effectiveMaxScore = priorState?.maxScore ?? checkpoint.score;
    const checkpointEvidenceText = collectCheckpointEvidenceText(
      context,
      result.checkpointKey,
    );
    const latestTurnText = collectLatestCandidateText(context);
    const isTargetedFollowUp =
      context.latestAnswerMessageKind === 'follow_up_answer' &&
      context.targetCheckpointKey === result.checkpointKey;
    const evaluationText = isTargetedFollowUp
      ? latestTurnText
      : checkpointEvidenceText;
    const floorLatestText = isTargetedFollowUp
      ? latestTurnText
      : checkpointEvidenceText;
    const floorFullText = floorLatestText;

    const aiSnapshot = {
      status: result.status,
      scoreAwarded: result.scoreAwarded,
    };

    const isTargetRefusalMetaTurn =
      evaluationMode === 'target_refusal' &&
      metaTurnTargetKey !== null &&
      result.checkpointKey === metaTurnTargetKey;

    let guardedResult = isTargetRefusalMetaTurn
      ? enforceStatusScoreAlignment(
          applyShallowAcceptFloor(
            applyExplicitRefusalCap(
              result,
              latestTurnText,
              checkpoint,
              priorState,
              context.maxScore,
              isTargetedFollowUp,
              options.candidateTurnKind,
              strictnessMultiplier,
            ),
            {
              checkpoint,
              priorState,
              checkpointEvidenceText,
              latestTurnText,
              questionMaxScore: context.maxScore,
            },
            strictnessMultiplier,
          ),
          effectiveMaxScore,
        )
      : enforceStatusScoreAlignment(
          applyRationaleScoreAlignment(
            applyShallowAcceptFloor(
              applyPositiveEvidenceFloor(
                applyExplicitRefusalCap(
                  applyBadExampleOverlapCap(
                    applySemanticContradictionCap(
                      applyRationaleContradictionCap(
                        result,
                        effectiveMaxScore,
                        strictnessMultiplier,
                        evaluationText,
                        checkpoint,
                      ),
                      evaluationText,
                      checkpoint,
                      effectiveMaxScore,
                      strictnessMultiplier,
                    ),
                    evaluationText,
                    checkpointEvidenceText,
                    [
                      ...badExamples,
                      ...(checkpoint.badExamples ?? []),
                      ...(checkpoint.questionBadExamples ?? []),
                    ],
                    checkpoint.evaluationHints?.neutralMetaphors,
                    effectiveMaxScore,
                    checkpoint,
                    strictnessMultiplier,
                  ),
                  latestTurnText,
                  checkpoint,
                  priorState,
                  context.maxScore,
                  isTargetedFollowUp,
                  options.candidateTurnKind,
                  strictnessMultiplier,
                ),
                latestTurnText,
                floorFullText,
                checkpoint,
                effectiveMaxScore,
                isTargetedFollowUp,
                options.candidateTurnKind,
                strictnessMultiplier,
              ),
              {
                checkpoint,
                priorState,
                checkpointEvidenceText,
                latestTurnText,
                questionMaxScore: context.maxScore,
              },
              strictnessMultiplier,
            ),
            effectiveMaxScore,
            strictnessMultiplier,
          ),
          effectiveMaxScore,
        );

    if (!isTargetRefusalMetaTurn) {
      guardedResult = applyTopicMismatchProvisionalGuard({
        result: guardedResult,
        checkpointKey: result.checkpointKey,
        expectedCheckpointKey,
        candidateDisposition: evaluation.candidateDisposition,
        priorScoreAwarded: priorState?.scoreAwarded ?? 0,
      });

      const effectiveDisposition =
        options.candidateDispositionFromClassifier ??
        evaluation.candidateDisposition;
      guardedResult = applyScopeClarificationScoreFreeze({
        result: guardedResult,
        checkpointKey: result.checkpointKey,
        targetCheckpointKey: context.targetCheckpointKey,
        candidateDisposition: effectiveDisposition,
        priorScoreAwarded: priorState?.scoreAwarded ?? 0,
        isTargetedFollowUp,
      });
    }

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
          latestTurnText,
          checkpoint,
        ),
        promptVersion,
      });
    }

    const guardedWithQuote = attachFalseClaimEvidence(
      guardedResult,
      checkpointEvidenceText,
      checkpoint,
    );

    return {
      kind: 'draft' as const,
      original: result,
      checkpoint,
      priorState,
      effectiveMaxScore,
      guardedWithQuote,
      isTargetedFollowUp,
      latestTurnText,
      checkpointEvidenceText,
      aiSnapshot,
    };
  });

  const transitiveEntries: TransitiveGuardedCheckpoint[] = processed
    .filter(
      (item): item is Extract<typeof item, { kind: 'draft' }> =>
        item.kind === 'draft',
    )
    .map((item) => ({
      checkpointKey: item.guardedWithQuote.checkpointKey,
      checkpoint: item.checkpoint,
      guardedResult: item.guardedWithQuote,
      priorState: item.priorState,
      checkpointEvidenceText: item.checkpointEvidenceText,
      latestCandidateText: latestCandidateText,
      questionMaxScore: context.maxScore,
    }));

  const transitiveOutcome = applyTransitiveCheckpointFloors({
    checkpoints: context.checkpoints,
    entries: transitiveEntries,
  });

  const checkpointResults = processed.map((item) => {
    if (item.kind === 'passthrough') {
      return item.result;
    }

    if (item.kind === 'frozen') {
      return item.frozenResult;
    }

    const transitiveApplication = transitiveOutcome.applications.find(
      (application) =>
        application.checkpointKey === item.guardedWithQuote.checkpointKey,
    );
    const guardedWithQuote = transitiveApplication
      ? applyTransitiveFloorToGuardedResult(
          item.guardedWithQuote,
          transitiveApplication,
        )
      : item.guardedWithQuote;

    if (
      transitiveApplication &&
      (guardedWithQuote.scoreAwarded !== item.guardedWithQuote.scoreAwarded ||
        guardedWithQuote.status !== item.guardedWithQuote.status)
    ) {
      adjustments.push({
        checkpointKey: item.guardedWithQuote.checkpointKey,
        aiStatus: item.aiSnapshot.status,
        aiScore: item.aiSnapshot.scoreAwarded,
        guardedStatus: guardedWithQuote.status,
        guardedScore: guardedWithQuote.scoreAwarded,
        reason: 'status_score_alignment',
        promptVersion,
      });
    }

    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: item.priorState?.scoreAwarded ?? 0,
      currentStatus: (item.priorState?.status ??
        'unseen') as CheckpointStateStatus,
      currentEvidenceSummary: null,
      currentRationale: null,
      incomingScoreAwarded: guardedWithQuote.scoreAwarded,
      incomingStatus: guardedWithQuote.status,
      incomingEvidenceSummary: guardedWithQuote.evidenceSummary,
      incomingRationale: guardedWithQuote.rationale,
      maxScore: item.effectiveMaxScore,
      evidenceSource: options.evidenceSource,
      relaxFollowUpWeight: item.isTargetedFollowUp,
      lockPriorScore: shouldFreezeCheckpointOnMetaTurn(
        evaluationMode,
        item.guardedWithQuote.checkpointKey,
        metaTurnTargetKey,
      ),
      incomingAllowsScoreDecrease: resolveIncomingAllowsScoreDecrease(
        context,
        item.checkpoint,
        guardedWithQuote.rationale,
        item.latestTurnText,
        item.checkpointEvidenceText,
        options.candidateTurnKind,
      ),
      provisionalScoreFloor: resolveProvisionalScoreFloor({
        checkpoint: item.checkpoint,
        priorState: item.priorState,
        checkpointEvidenceText: item.checkpointEvidenceText,
        latestTurnText: item.latestTurnText,
        questionMaxScore: context.maxScore,
        guardedResult: guardedWithQuote,
        strictnessMultiplier,
      }),
    });

    const scopeClarificationTurn =
      item.isTargetedFollowUp &&
      context.targetCheckpointKey === item.guardedWithQuote.checkpointKey &&
      (evaluationMode === 'clarification' ||
        isScopeClarificationTurn({
          candidateTurnKind: options.candidateTurnKind,
          aiDisposition:
            options.candidateDispositionFromClassifier ??
            evaluation.candidateDisposition,
        }));

    if (scopeClarificationTurn) {
      const frozenScore = item.priorState?.scoreAwarded ?? 0;
      const frozenStatus = (item.priorState?.status ??
        merged.status) as PerTurnCheckpointEvaluationStatus;

      return {
        ...item.original,
        scoreAwarded: frozenScore,
        status: frozenStatus,
        evidenceSummary: merged.evidenceSummary,
        rationale: alignRationaleDepthWithScore(
          normalizeRationaleDepth(
            appendScopeClarificationPendingRationale(
              merged.rationale ?? item.original.rationale,
            ),
          ),
          frozenScore,
          item.effectiveMaxScore,
        ),
      };
    }

    const realigned =
      item.isTargetedFollowUp &&
      (evaluation.candidateDisposition === 'declined' ||
        isTargetedRefusalForPolicy({
          candidateTurnKind: options.candidateTurnKind,
          latestCandidateText: item.latestTurnText,
        }))
        ? {
            ...item.original,
            scoreAwarded: merged.scoreAwarded,
            status: merged.status as PerTurnCheckpointEvaluationStatus,
            rationale: merged.rationale ?? item.original.rationale,
          }
        : applyRationaleScoreAlignment(
            {
              ...item.original,
              scoreAwarded: merged.scoreAwarded,
              status: merged.status as PerTurnCheckpointEvaluationStatus,
              rationale: merged.rationale ?? item.original.rationale,
            },
            item.effectiveMaxScore,
            strictnessMultiplier,
          );

    return upgradeStrongPartialToCovered(
      {
        ...item.original,
        scoreAwarded: realigned.scoreAwarded,
        status: realigned.status,
        evidenceSummary: merged.evidenceSummary,
        rationale: alignRationaleDepthWithScore(
          normalizeRationaleDepth(
            realigned.rationale ?? item.original.rationale,
          ),
          realigned.scoreAwarded,
          item.effectiveMaxScore,
        ),
      },
      item.effectiveMaxScore,
    );
  });

  return {
    evaluation: {
      ...evaluation,
      checkpointResults,
    },
    adjustments,
  };
}

/**
 * TASK-17.4: make `covered` reachable for strong answers. The guard chain
 * (enforceStatusScoreAlignment) downgrades `covered`→`partial` whenever the
 * awarded score is below the full max, so a confident, near-complete answer
 * (e.g. 0.85·max, confidence 0.9) would otherwise be stuck at `partial` forever
 * and surface as "0/N covered" in the final report. We upgrade a high-confidence
 * partial back to `covered` once it clears a strong threshold — WITHOUT touching
 * the score or the question bank criteria. A partial whose rationale flags a real
 * contradiction / false claim is never upgraded.
 */
export const COVERED_UPGRADE_SCORE_RATIO = 0.8;
export const COVERED_UPGRADE_MIN_CONFIDENCE = 0.7;

export function upgradeStrongPartialToCovered(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.status !== 'partial' || maxScore <= 0) {
    return result;
  }

  const ratio = result.scoreAwarded / maxScore;
  const confidence = result.confidence ?? 0;
  if (
    ratio < COVERED_UPGRADE_SCORE_RATIO ||
    confidence < COVERED_UPGRADE_MIN_CONFIDENCE
  ) {
    return result;
  }

  const rationale = result.rationale ?? '';

  // Never upgrade an answer the guards capped for a contradiction / false claim.
  if (
    hasFalseClaimInRationale(rationale) ||
    /semantic guard capped/i.test(rationale) ||
    /depth\s*=\s*false_claim/i.test(rationale)
  ) {
    return result;
  }

  // A high score produced by the shallow-accept floor means a deliberately
  // shallow (basic-tier) answer was accepted without probing — that is NOT a
  // fully-covered answer and must stay `partial`.
  if (/shallow accept floor/i.test(rationale)) {
    return result;
  }

  // `covered` requires genuine depth AND breadth, not just an inflated score:
  // the evaluator must have judged the checkpoint as understood/known with high
  // coverage. This keeps shallow/partial-knowledge answers at `partial`.
  const depth = parseDepthFromRationale(rationale);
  const coverage = parseCoverageFromRationale(rationale);
  const strongDepth = depth === 'understands' || depth === 'knows';
  if (!strongDepth || coverage !== 'high') {
    return result;
  }

  return {
    ...result,
    status: 'covered',
  };
}

function applyTopicMismatchProvisionalGuard(input: {
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number];
  checkpointKey: string;
  expectedCheckpointKey?: string | null;
  candidateDisposition: PerTurnCheckpointEvaluationAiResponse['candidateDisposition'];
  priorScoreAwarded: number;
}): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    input.candidateDisposition !== 'misunderstood_question' ||
    !input.expectedCheckpointKey ||
    input.checkpointKey !== input.expectedCheckpointKey
  ) {
    return input.result;
  }

  const minProvisional = input.priorScoreAwarded;
  if (
    input.result.status === 'missed' &&
    input.result.scoreAwarded <= minProvisional
  ) {
    return {
      ...input.result,
      status: 'unclear',
      scoreAwarded: minProvisional,
      rationale: appendTopicRedirectPendingRationale(input.result.rationale),
    };
  }

  if (
    input.result.scoreAwarded < minProvisional &&
    input.result.status !== 'covered'
  ) {
    return {
      ...input.result,
      status: 'unclear',
      scoreAwarded: minProvisional,
      rationale: appendTopicRedirectPendingRationale(input.result.rationale),
    };
  }

  return input.result;
}

function applyScopeClarificationScoreFreeze(input: {
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number];
  checkpointKey: string;
  targetCheckpointKey?: string | null;
  candidateDisposition:
    | PerTurnCheckpointEvaluationAiResponse['candidateDisposition']
    | null;
  priorScoreAwarded: number;
  isTargetedFollowUp: boolean;
}): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    input.candidateDisposition !== 'asked_for_scope' ||
    !input.isTargetedFollowUp ||
    !input.targetCheckpointKey ||
    input.checkpointKey !== input.targetCheckpointKey
  ) {
    return input.result;
  }

  const frozenScore = input.priorScoreAwarded;
  if (
    input.result.scoreAwarded <= frozenScore &&
    input.result.status !== 'covered'
  ) {
    return input.result;
  }

  return {
    ...input.result,
    scoreAwarded: frozenScore,
    status:
      frozenScore > 0 && input.result.status === 'covered'
        ? 'partial'
        : input.result.status === 'covered'
          ? 'partial'
          : input.result.status,
    rationale: appendScopeClarificationPendingRationale(input.result.rationale),
  };
}

function appendScopeClarificationPendingRationale(
  rationale: string | null | undefined,
): string {
  const base = rationale?.trim() ?? '';
  const tag = 'scope_clarification=pending';
  if (base.includes(tag)) {
    return base;
  }

  return base ? `${base}; ${tag}` : tag;
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
    getContradictionScoreCap(checkpoint, candidateText, checkpoint.score) !==
    null
  ) {
    return 'semantic_contradiction_cap';
  }

  if (original.status === 'covered' && guarded.status !== 'covered') {
    return 'status_score_alignment';
  }

  return 'bad_example_overlap_cap';
}

function hasFalseClaimInRationale(
  rationale: string | null | undefined,
): boolean {
  const value = rationale ?? '';
  return (
    /depth\s*=\s*false_claim/i.test(value) ||
    (/semantic guard capped/i.test(value) &&
      !/similarity\s*=\s*bad_example/i.test(value))
  );
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
  checkpointEvidenceText: string,
  checkpoint: AdaptiveCheckpointDefinition,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (!hasFalseClaimInRationale(result.rationale)) {
    return result;
  }

  // TASK-17.5: only overwrite evidence_summary with a quote that LITERALLY
  // contains a configured false claim. Without a real match we keep the model's
  // own evidence_summary instead of falling back to the answer's first sentence
  // (which produced irrelevant "evidence" like the opening definition of a
  // correct answer).
  const quote = extractMatchedFalseClaimQuoteStrict(
    checkpointEvidenceText,
    checkpoint.evaluationHints?.falseClaims,
  );
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
  priorState?: AdaptiveInterviewContextPacket['checkpointStates'][number],
  questionMaxScore?: number,
  isTargetedFollowUp = false,
  candidateTurnKind?: CandidateTurnKind | null,
  strictnessMultiplier = 1,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    !isTargetedRefusalForPolicy({
      candidateTurnKind,
      latestCandidateText,
    })
  ) {
    return result;
  }

  if (
    !refusalTargetsCheckpoint(latestCandidateText, checkpoint) &&
    !isTargetedFollowUp
  ) {
    return result;
  }

  const maxScore = priorState?.maxScore ?? checkpoint.score;
  const hints = checkpoint.evaluationHints;
  const tier = resolveComplexityTier(
    hints,
    checkpoint.score,
    questionMaxScore ?? maxScore,
  );
  const probedOrPartial =
    (priorState?.followUpCount ?? 0) > 0 ||
    (priorState?.scoreAwarded ?? 0) > 0 ||
    result.scoreAwarded > 0;

  if (probedOrPartial && hints?.probePolicy) {
    const fraction = getShallowAcceptFloorFraction({
      hints,
      tier,
      probeStatus: 'probed',
    });
    const floor = scaleGuardScore(
      getShallowAcceptFloorScore(maxScore, fraction),
      maxScore,
      strictnessMultiplier,
    );
    const scoreAwarded = Math.max(floor, Math.min(result.scoreAwarded, floor));

    return {
      ...result,
      scoreAwarded,
      status: scoreAwarded > 0 ? 'partial' : 'missed',
      rationale: `${stripTrailingDepth(result.rationale)} depth=heard_of. Explicit refusal after probe; shallow accept closed.`,
    };
  }

  if (result.scoreAwarded <= 0) {
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
  strictnessMultiplier = 1,
  candidateText = '',
  checkpoint?: AdaptiveCheckpointDefinition,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.scoreAwarded < maxScore || result.status !== 'covered') {
    return result;
  }

  const rationale = (result.rationale ?? '').toLowerCase();
  if (rationaleIndicatesOmissionNotContradiction(rationale)) {
    return result;
  }

  // TASK-17.2: never cap an answer the rationale itself calls sound. The model
  // sometimes self-contradicts (writes accuracy=wrong while also stating
  // «суть сохранена и не противоречит» / «описан корректно»); that is not a
  // real material error and must not zero a correct answer.
  if (
    rationaleIndicatesSoundEvidence(result.rationale) ||
    rationaleAffirmsAnswerIsCorrect(rationale)
  ) {
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

  // TASK-17.2: the rationale-based contradiction cap must be backed by a real,
  // cited contradicting phrase from the question bank's false claims — not the
  // raw model accuracy=wrong/false_claim flag alone. Without a matched quote we
  // trust the covered score (the semantic contradiction cap already handles
  // hint-matched contradictions separately).
  if (!hasCitedFalseClaim(candidateText, checkpoint)) {
    return result;
  }

  const accuracyWrong = /accuracy\s*=\s*wrong/i.test(rationale);
  const cap = accuracyWrong
    ? 0
    : scaleGuardScore(
        partialScoreForMax(maxScore),
        maxScore,
        strictnessMultiplier,
      );
  return {
    ...result,
    scoreAwarded: cap,
    status: cap > 0 ? 'partial' : 'missed',
    rationale: `${result.rationale} depth=false_claim. Score capped: rationale notes material errors.`,
  };
}

function applyBadExampleOverlapCap(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  evaluationText: string,
  _fullCandidateText: string,
  badExamples: string[],
  neutralMetaphors: string[] | undefined,
  maxScore: number,
  checkpoint: AdaptiveCheckpointDefinition,
  strictnessMultiplier = 1,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.scoreAwarded <= 0) {
    return result;
  }

  if (rationaleIndicatesSoundEvidence(result.rationale)) {
    return result;
  }

  const strippedEvaluation = stripNeutralMetaphors(
    evaluationText,
    neutralMetaphors,
  );

  const overlapsBadExample =
    overlapsQuestionBadAnswerExamples(strippedEvaluation, badExamples) ||
    matchesCheckpointFalseClaims(
      strippedEvaluation,
      checkpoint.evaluationHints?.falseClaims ?? [],
    );

  if (!overlapsBadExample) {
    return result;
  }

  const cap = scaleGuardScore(
    partialScoreForMax(maxScore),
    maxScore,
    strictnessMultiplier,
  );
  return {
    ...result,
    scoreAwarded: Math.min(result.scoreAwarded, cap),
    status: 'partial',
    rationale: `${result.rationale} similarity=bad_example. Score capped: overlaps bad answer example.`,
  };
}

function applyRationaleScoreAlignment(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  maxScore: number,
  strictnessMultiplier = 1,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  const rationale = result.rationale ?? '';
  if (result.scoreAwarded <= 0) {
    return result;
  }

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
  if (accuracy === 'full' && (depth === 'knows' || depth === 'understands')) {
    minScore = maxScore;
  } else if (accuracy === 'full' && depth === 'partial_knowledge') {
    minScore = strongPartialScoreForMax(maxScore);
  } else if (
    coverage === 'high' &&
    accuracy === 'partial' &&
    depth === 'understands'
  ) {
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

  if (minScore !== null) {
    minScore = scaleGuardScore(minScore, maxScore, strictnessMultiplier);
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

function applyShallowAcceptFloor(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  input: {
    checkpoint: AdaptiveCheckpointDefinition;
    priorState:
      | AdaptiveInterviewContextPacket['checkpointStates'][number]
      | undefined;
    checkpointEvidenceText: string;
    latestTurnText: string;
    questionMaxScore: number;
  },
  strictnessMultiplier = 1,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  const state = {
    status: result.status as CheckpointStateStatus,
    scoreAwarded: result.scoreAwarded,
    maxScore: input.priorState?.maxScore ?? input.checkpoint.score,
    followUpCount: input.priorState?.followUpCount ?? 0,
    rationale: result.rationale,
  };

  if (
    hasFalseClaimInRationale(result.rationale) ||
    /semantic guard capped/i.test(result.rationale ?? '') ||
    hasFalseClaimSignal(
      input.checkpoint,
      state,
      input.latestTurnText,
      input.checkpointEvidenceText,
    )
  ) {
    return result;
  }

  const hints = input.checkpoint.evaluationHints;
  const probeStatus = deriveProbeStatus({
    checkpoint: input.checkpoint,
    state,
    hints,
    questionMaxScore: input.questionMaxScore,
    candidateEvidenceText: input.checkpointEvidenceText,
    latestCandidateText: input.latestTurnText,
  });

  if (probeStatus === 'closed') {
    return result;
  }

  if (!hints?.probePolicy && !hints?.complexityTier) {
    return result;
  }

  if (result.scoreAwarded <= 0 && probeStatus !== 'open') {
    return result;
  }

  const tier = resolveComplexityTier(
    hints,
    input.checkpoint.score,
    input.questionMaxScore,
  );

  if (
    probeStatus === 'provisional' &&
    !hints?.probePolicy &&
    !['mention', 'basic', 'core_plus'].includes(tier)
  ) {
    return result;
  }

  const fraction = getShallowAcceptFloorFraction({
    hints,
    tier,
    probeStatus,
  });
  const floor = scaleGuardScore(
    getShallowAcceptFloorScore(state.maxScore, fraction),
    state.maxScore,
    strictnessMultiplier,
  );

  if (result.scoreAwarded >= floor) {
    if (probeStatus === 'open' && !isProbePendingRationale(result.rationale)) {
      const missing = getMissingMustConcepts(
        hints,
        input.checkpointEvidenceText,
      );
      return {
        ...result,
        status: 'partial',
        rationale: appendProbePendingRationale(result.rationale, missing),
      };
    }

    return result;
  }

  const missing = getMissingMustConcepts(hints, input.checkpointEvidenceText);
  const scoreAwarded = Math.min(
    state.maxScore,
    Math.max(result.scoreAwarded, floor),
  );

  return {
    ...result,
    scoreAwarded,
    status: scoreAwarded > 0 ? 'partial' : 'missed',
    rationale:
      probeStatus === 'open'
        ? appendProbePendingRationale(result.rationale, missing)
        : `${result.rationale ?? ''} Shallow accept floor applied.`.trim(),
  };
}

function resolveProvisionalScoreFloor(input: {
  checkpoint: AdaptiveCheckpointDefinition;
  priorState:
    | AdaptiveInterviewContextPacket['checkpointStates'][number]
    | undefined;
  checkpointEvidenceText: string;
  latestTurnText: string;
  questionMaxScore: number;
  guardedResult: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number];
  strictnessMultiplier?: number;
}): number | undefined {
  const maxScore = input.priorState?.maxScore ?? input.checkpoint.score;
  const state = {
    status: input.guardedResult.status as CheckpointStateStatus,
    scoreAwarded: input.priorState?.scoreAwarded ?? 0,
    maxScore,
    followUpCount: input.priorState?.followUpCount ?? 0,
    rationale:
      input.guardedResult.rationale ?? input.priorState?.rationale ?? null,
  };
  const hints = input.checkpoint.evaluationHints;
  const probeStatus = deriveProbeStatus({
    checkpoint: input.checkpoint,
    state,
    hints,
    questionMaxScore: input.questionMaxScore,
    candidateEvidenceText: input.checkpointEvidenceText,
    latestCandidateText: input.latestTurnText,
  });

  if (probeStatus === 'closed') {
    return undefined;
  }

  if (!hints?.probePolicy && !hints?.complexityTier) {
    return undefined;
  }

  const tier = resolveComplexityTier(
    hints,
    input.checkpoint.score,
    input.questionMaxScore,
  );
  const fraction = getShallowAcceptFloorFraction({
    hints,
    tier,
    probeStatus,
  });

  return scaleGuardScore(
    getShallowAcceptFloorScore(maxScore, fraction),
    maxScore,
    input.strictnessMultiplier ?? 1,
  );
}

function applyPositiveEvidenceFloor(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  latestCandidateText: string,
  fullCandidateText: string,
  checkpoint: AdaptiveCheckpointDefinition,
  maxScore: number,
  isTargetedFollowUp = false,
  candidateTurnKind?: CandidateTurnKind | null,
  strictnessMultiplier = 1,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (
    isTargetedRefusalForPolicy({
      candidateTurnKind,
      latestCandidateText,
    }) &&
    (refusalTargetsCheckpoint(latestCandidateText, checkpoint) ||
      isTargetedFollowUp)
  ) {
    return result;
  }

  if (
    !isTargetedFollowUp &&
    parseCoverageFromRationale(result.rationale) === 'none'
  ) {
    return result;
  }

  const rawFloor = getPositiveEvidenceScoreFloor(
    checkpoint.evaluationHints,
    isTargetedFollowUp ? latestCandidateText : '',
    fullCandidateText,
    maxScore,
  );
  const floor =
    rawFloor === null
      ? null
      : scaleGuardScore(rawFloor, maxScore, strictnessMultiplier);
  if (
    floor === null ||
    matchesCheckpointFalseClaims(
      latestCandidateText,
      checkpoint.evaluationHints?.falseClaims ?? [],
    ) ||
    overlapsQuestionBadAnswerExamples(latestCandidateText, [
      ...(checkpoint.badExamples ?? []),
      ...(checkpoint.questionBadExamples ?? []),
    ])
  ) {
    return result;
  }

  if (
    hasFalseClaimInRationale(result.rationale) ||
    /semantic guard capped/i.test(result.rationale ?? '')
  ) {
    return result;
  }

  const underScored = result.scoreAwarded < floor;

  if (!underScored) {
    return result;
  }

  const scoreAwarded = Math.min(maxScore, Math.max(result.scoreAwarded, floor));

  return {
    ...result,
    scoreAwarded,
    status:
      scoreAwarded >= maxScore
        ? 'covered'
        : scoreAwarded > 0
          ? 'partial'
          : 'missed',
    rationale: result.rationale
      ? `${result.rationale} Positive evidence floor applied.`
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
  checkpoint: AdaptiveCheckpointDefinition,
  maxScore: number,
  strictnessMultiplier = 1,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  const rawCap = getContradictionScoreCap(checkpoint, candidateText, maxScore);
  const cap =
    rawCap === null
      ? null
      : scaleGuardScore(rawCap, maxScore, strictnessMultiplier);
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

/**
 * TASK-17.2: detects rationales where the model affirms the answer is
 * substantively correct / not contradictory even though it also emitted a
 * accuracy=wrong / false_claim flag. Patterns are deliberately narrow so a
 * genuine half-right/half-wrong rationale (e.g. «суть верна, но X не
 * соответствует») is NOT treated as an affirmation.
 */
function rationaleAffirmsAnswerIsCorrect(rationale: string): boolean {
  return [
    /не\s+противоречит/,
    /без\s+ложных\s+утвержд/,
    /без\s+материальн\w*\s+ошиб/,
    /суть\s+[\wа-яё]+\s+сохранен/,
    /механизм[\wа-яё ]*описан\s+корректно/,
    /описан[аоы]?\s+корректно\s+без/,
  ].some((pattern) => pattern.test(rationale));
}

/**
 * TASK-17.2: a contradiction cap may only be applied when the candidate's
 * evidence actually contains a phrase that matches the checkpoint's configured
 * false claims (question bank source of truth) — not on the model's raw flag.
 */
function hasCitedFalseClaim(
  candidateText: string,
  checkpoint?: AdaptiveCheckpointDefinition,
): boolean {
  const falseClaims = checkpoint?.evaluationHints?.falseClaims ?? [];
  if (falseClaims.length === 0 || !candidateText.trim()) {
    return false;
  }

  return matchesCheckpointFalseClaims(candidateText, falseClaims);
}

function resolveIncomingAllowsScoreDecrease(
  context: AdaptiveInterviewContextPacket,
  checkpoint: AdaptiveCheckpointDefinition,
  rationale: string | null | undefined,
  latestCandidateText: string,
  fullCandidateText: string,
  candidateTurnKind?: CandidateTurnKind | null,
): boolean {
  if (
    isTargetedRefusalForPolicy({
      candidateTurnKind,
      latestCandidateText,
    }) &&
    refusalTargetsCheckpoint(latestCandidateText, checkpoint)
  ) {
    return true;
  }

  if (!hasFalseClaimInRationale(rationale)) {
    return false;
  }

  if (
    rationaleIndicatesOmissionNotContradiction((rationale ?? '').toLowerCase())
  ) {
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

function buildMetaTurnFrozenCheckpointResult(
  original: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  priorState?: AdaptiveInterviewContextPacket['checkpointStates'][number],
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  const frozenScore = priorState?.scoreAwarded ?? 0;
  const maxScore = priorState?.maxScore ?? original.scoreAwarded;
  const frozenStatus = normalizeFrozenCheckpointStatus(
    priorState?.status ?? original.status,
    frozenScore,
    maxScore,
  );

  return {
    ...original,
    scoreAwarded: frozenScore,
    status: frozenStatus,
    evidenceSummary: null,
    rationale: appendMetaTurnFrozenRationale(
      priorState?.rationale ?? original.rationale,
    ),
  };
}

function normalizeFrozenCheckpointStatus(
  status: string,
  scoreAwarded: number,
  maxScore: number,
): PerTurnCheckpointEvaluationStatus {
  if (scoreAwarded <= 0) {
    return status === 'unclear' ? 'unclear' : 'missed';
  }

  if (maxScore > 0 && scoreAwarded >= maxScore) {
    return 'covered';
  }

  if (
    status === 'covered' ||
    status === 'partial' ||
    status === 'missed' ||
    status === 'unclear'
  ) {
    return status;
  }

  return 'partial';
}

export { getContradictionScoreCap } from './hint-driven-evidence.util';
