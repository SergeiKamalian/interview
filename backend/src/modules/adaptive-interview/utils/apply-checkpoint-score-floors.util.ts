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

    const guardedResult = enforceStatusScoreAlignment(
      applyRationaleContradictionCap(
        applySemanticContradictionCap(result, candidateText, checkpoint.score),
        checkpoint.score,
      ),
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

function applyRationaleContradictionCap(
  result: PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number],
  maxScore: number,
): PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number] {
  if (result.scoreAwarded < maxScore || result.status !== 'covered') {
    return result;
  }

  const rationale = (result.rationale ?? '').toLowerCase();
  const admitsError = [
    /не\s+соответствует/,
    /неверн/,
    /ошиб/,
    /противореч/,
    /неправильн/,
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
    rationale: `${result.rationale} Score capped: rationale notes material errors.`,
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

  if (
    checkpointKey === 'scheduling' &&
    has([/requestidlecallback/i, /request_idle_callback/i])
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
