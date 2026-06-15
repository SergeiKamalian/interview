import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluationStatus,
} from '../types/per-turn-evaluation.types';
import { mergeCheckpointEvaluation } from './merge-checkpoint-evaluation.util';

export function applyCheckpointScoreFloors(
  evaluation: PerTurnCheckpointEvaluationAiResponse,
  context: AdaptiveInterviewContextPacket,
): PerTurnCheckpointEvaluationAiResponse {
  const candidateText = collectCandidateText(context);

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

    const guardedResult = applySemanticContradictionCap(
      result,
      candidateText,
      checkpoint.score,
    );

    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: priorState?.scoreAwarded ?? 0,
      currentStatus: (priorState?.status ?? 'unseen') as CheckpointStateStatus,
      currentEvidenceSummary: null,
      currentRationale: null,
      incomingScoreAwarded: guardedResult.scoreAwarded,
      incomingStatus: guardedResult.status,
      incomingEvidenceSummary: guardedResult.evidenceSummary,
      incomingRationale: guardedResult.rationale,
      maxScore: checkpoint.score,
    });

    return {
      ...result,
      scoreAwarded: merged.scoreAwarded,
      status: merged.status as PerTurnCheckpointEvaluationStatus,
      evidenceSummary: merged.evidenceSummary,
      rationale: merged.rationale ?? result.rationale,
    };
  });

  return {
    ...evaluation,
    checkpointResults,
  };
}

function collectCandidateText(context: AdaptiveInterviewContextPacket): string {
  return [
    ...context.localTurns
      .filter((turn) => turn.role === 'candidate')
      .map((turn) => turn.content),
    context.latestCandidateAnswer,
  ]
    .join(' ')
    .toLowerCase();
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
    rationale: `${result.rationale} Semantic guard capped score because candidate evidence contains a direct contradiction.`,
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

  return null;
}
