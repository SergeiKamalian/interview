import type {
  AdaptiveCheckpointDefinition,
  AdaptiveCheckpointStateSnapshot,
} from '../types/adaptive-interview-context.types';
import type { ImpliesCheckpointFloor } from '../types/checkpoint-evaluation-hints.type';
import type { PerTurnCheckpointEvaluationStatus } from '../types/per-turn-evaluation.types';
import {
  getPositiveEvidenceScoreFloor,
} from './hint-driven-evidence.util';
import { textContainsPhrase } from './text-evidence-overlap.util';

const DEFAULT_MIN_SOURCE_SCORE_FRACTION = 0.75;

export type TransitiveFloorApplication = {
  checkpointKey: string;
  floorScore: number;
  floorFraction: number;
  sourceCheckpointKey: string;
  sourceScore: number;
};

export type TransitiveCheckpointFloorsResult = {
  floorsByKey: Map<string, number>;
  applications: TransitiveFloorApplication[];
};

export type TransitiveGuardedCheckpoint = {
  checkpointKey: string;
  checkpoint: AdaptiveCheckpointDefinition;
  guardedResult: {
    checkpointKey: string;
    status: PerTurnCheckpointEvaluationStatus;
    scoreAwarded: number;
    rationale?: string | null;
  };
  priorState?: AdaptiveCheckpointStateSnapshot;
  checkpointEvidenceText: string;
  latestCandidateText: string;
  questionMaxScore: number;
};

export function applyTransitiveCheckpointFloors(input: {
  checkpoints: AdaptiveCheckpointDefinition[];
  entries: TransitiveGuardedCheckpoint[];
}): TransitiveCheckpointFloorsResult {
  const floorsByKey = new Map<string, number>();
  const applications: TransitiveFloorApplication[] = [];
  const entryByKey = new Map(
    input.entries.map((entry) => [entry.checkpointKey, entry]),
  );

  for (const entry of input.entries) {
    const edges = entry.checkpoint.evaluationHints?.impliesCheckpointFloors ?? [];
    if (edges.length === 0) {
      continue;
    }

    if (!isStrongTransitiveSource(entry)) {
      continue;
    }

    for (const edge of edges) {
      const sourceMaxScore = entry.priorState?.maxScore ?? entry.checkpoint.score;
      const minSourceFraction =
        edge.minSourceScoreFraction ?? DEFAULT_MIN_SOURCE_SCORE_FRACTION;

      if (
        sourceMaxScore <= 0 ||
        entry.guardedResult.scoreAwarded <
          sourceMaxScore * minSourceFraction
      ) {
        continue;
      }

      applyEdgeFloor({
        edge,
        sourceEntry: entry,
        entryByKey,
        floorsByKey,
        applications,
        checkpoints: input.checkpoints,
      });
    }
  }

  return { floorsByKey, applications };
}

function applyEdgeFloor(input: {
  edge: ImpliesCheckpointFloor;
  sourceEntry: TransitiveGuardedCheckpoint;
  entryByKey: Map<string, TransitiveGuardedCheckpoint>;
  floorsByKey: Map<string, number>;
  applications: TransitiveFloorApplication[];
  checkpoints: AdaptiveCheckpointDefinition[];
}): void {
  const targetEntry = input.entryByKey.get(input.edge.checkpointKey);
  const targetCheckpoint = input.checkpoints.find(
    (checkpoint) => checkpoint.checkpointKey === input.edge.checkpointKey,
  );

  if (!targetEntry || !targetCheckpoint) {
    return;
  }

  const targetMaxScore =
    targetEntry.priorState?.maxScore ?? targetCheckpoint.score;
  if (targetMaxScore <= 0) {
    return;
  }

  const targetScore = targetEntry.guardedResult.scoreAwarded;
  if (
    targetEntry.guardedResult.status === 'covered' &&
    targetScore >= targetMaxScore
  ) {
    return;
  }

  const transitiveFloor = Number(
    (targetMaxScore * input.edge.floorFraction).toFixed(2),
  );
  if (targetScore >= transitiveFloor) {
    return;
  }

  const directFloor = getPositiveEvidenceScoreFloor(
    targetCheckpoint.evaluationHints,
    targetEntry.latestCandidateText,
    targetEntry.checkpointEvidenceText,
    targetMaxScore,
  );
  if (directFloor !== null && directFloor >= transitiveFloor) {
    return;
  }

  const existing = input.floorsByKey.get(input.edge.checkpointKey) ?? 0;
  if (transitiveFloor <= existing) {
    return;
  }

  input.floorsByKey.set(input.edge.checkpointKey, transitiveFloor);
  input.applications.push({
    checkpointKey: input.edge.checkpointKey,
    floorScore: transitiveFloor,
    floorFraction: input.edge.floorFraction,
    sourceCheckpointKey: input.sourceEntry.checkpointKey,
    sourceScore: input.sourceEntry.guardedResult.scoreAwarded,
  });
}

function isStrongTransitiveSource(entry: TransitiveGuardedCheckpoint): boolean {
  const { checkpoint, guardedResult, priorState } = entry;
  const rationale = guardedResult.rationale ?? '';

  if (/depth\s*=\s*false_claim/i.test(rationale)) {
    return false;
  }

  if (/accuracy\s*=\s*wrong/i.test(rationale)) {
    return false;
  }

  if (/similarity\s*=\s*bad_example/i.test(rationale)) {
    return false;
  }

  const followUpCount = priorState?.followUpCount ?? 0;
  const closedEnough =
    guardedResult.status === 'covered' || followUpCount >= 1;

  return closedEnough;
}

export function appendTransitiveFloorRationale(
  rationale: string | null | undefined,
  application: TransitiveFloorApplication,
): string {
  const base = (rationale ?? '').trim();
  const suffix = `Transitive floor from ${application.sourceCheckpointKey} (${application.sourceScore}): ${application.checkpointKey} raised to ${application.floorScore}.`;

  return base ? `${base} ${suffix}` : suffix;
}

export function applyTransitiveFloorToGuardedResult<
  T extends {
    scoreAwarded: number;
    status: PerTurnCheckpointEvaluationStatus;
    rationale?: string | null;
  },
>(result: T, application: TransitiveFloorApplication): T {
  if (result.scoreAwarded >= application.floorScore) {
    return result;
  }

  return {
    ...result,
    scoreAwarded: application.floorScore,
    status:
      result.status === 'missed' || result.status === 'unclear'
        ? 'partial'
        : result.status,
    rationale: appendTransitiveFloorRationale(result.rationale, application),
  };
}

export function computeTransitiveFloorsFromStates(input: {
  checkpoints: AdaptiveCheckpointDefinition[];
  checkpointStates: AdaptiveCheckpointStateSnapshot[];
  candidateEvidenceTextByKey: Record<string, string>;
  latestCandidateText: string;
  questionMaxScore: number;
}): TransitiveCheckpointFloorsResult {
  const entries: TransitiveGuardedCheckpoint[] = input.checkpointStates.map(
    (state) => {
      const checkpoint = input.checkpoints.find(
        (item) => item.checkpointKey === state.checkpointKey,
      );

      return {
        checkpointKey: state.checkpointKey,
        checkpoint: checkpoint ?? {
          checkpointKey: state.checkpointKey,
          title: state.checkpointKey,
          expected: state.checkpointKey,
          score: state.maxScore,
          sortOrder: 0,
        },
        guardedResult: {
          checkpointKey: state.checkpointKey,
          status: state.status as PerTurnCheckpointEvaluationStatus,
          scoreAwarded: state.scoreAwarded,
          rationale: state.rationale,
        },
        priorState: state,
        checkpointEvidenceText:
          input.candidateEvidenceTextByKey[state.checkpointKey] ?? '',
        latestCandidateText: input.latestCandidateText,
        questionMaxScore: input.questionMaxScore,
      };
    },
  );

  return applyTransitiveCheckpointFloors({
    checkpoints: input.checkpoints,
    entries,
  });
}

export function formatTransitiveFloorsPromptBlock(
  applications: TransitiveFloorApplication[],
): string {
  if (applications.length === 0) {
    return '';
  }

  const lines = applications.map(
    (item) =>
      `- ${item.checkpointKey}: floor ${item.floorScore} from ${item.sourceCheckpointKey} (source score ${item.sourceScore})`,
  );

  return [
    'Transitive floors (already applied by system — do not lower below):',
    ...lines,
    'Instruction: score targets >= floor if no contradiction; do not require re-proving concepts implied by the source checkpoint.',
  ].join('\n');
}

export function hasTransitiveRedirectExhausted(
  rationale: string | null | undefined,
): boolean {
  return /redirect\s*=\s*(?:asked|exhausted)/i.test(rationale ?? '');
}

export function hasWrongTopicAnchorTerms(
  answer: string,
  terms: string[] | undefined,
): boolean {
  if (!terms?.length) {
    return false;
  }

  return terms.some((term) => textContainsPhrase(answer, term));
}
