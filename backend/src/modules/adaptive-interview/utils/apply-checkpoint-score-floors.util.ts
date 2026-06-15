import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { CandidateAnswerDisposition } from '../types/candidate-answer-disposition.type';
import type { CheckpointStateStatus } from '../types/checkpoint-state-status.type';
import type {
  PerTurnCheckpointEvaluationAiResponse,
  PerTurnCheckpointEvaluationStatus,
} from '../types/per-turn-evaluation.types';
import { mergeCheckpointEvaluation } from './merge-checkpoint-evaluation.util';

const STOP_WORDS = new Set([
  'кандидат',
  'говорит',
  'объясняет',
  'что',
  'для',
  'или',
  'через',
  'без',
  'the',
  'and',
  'that',
  'with',
  'from',
  'this',
  'when',
  'как',
  'это',
  'нужен',
  'нужно',
  'может',
  'типа',
  'есть',
  'про',
  'при',
  'после',
]);

const FULL_CREDIT_SIGNALS: Record<string, RegExp[]> = {
  type_parameter: [
    /какого\s+типа\s+(?:его\s+)?(?:data|данн)/i,
    /(?:таблиц|компонент|функци|класс|интерфейс).{0,120}(?:тип|data|generic|<t>)/i,
    /(?:тип|data|generic).{0,120}(?:таблиц|компонент|переда[её]м|рендер)/i,
    /items:\s*t\[\]/i,
    /\b<t>\b/i,
  ],
};

const STRONG_SIGNALS: Record<string, RegExp[]> = {
  type_parameter: [
    /\b<t>\b/i,
    /items:\s*t\[\]/i,
    /t\[\]/i,
    /параметр\s+тип/i,
    /generic/i,
    /дженерик/i,
    /основной\s+тип/i,
    /разных\s+тип/i,
    /общих\s+тип/i,
    /переда[её]м\s+.*\bтип/i,
    /ui\s+таблиц/i,
    /таблиц[аы].{0,100}тип/i,
    /тип.{0,60}(?:data|данн)/i,
    /знать\s+какого\s+типа/i,
    /переда[её]м\s+(?:ему|его|данн)/i,
    /generic\s+компонент/i,
    /параметриз/i,
  ],
  reusability: [
    /не\s+переписы/i,
    /не\s+пересозд/i,
    /переиспольз/i,
    /дублир/i,
    /в\s+каждом\s+месте/i,
    /один\s+и\s+тот\s+же\s+тип/i,
    /не\s+нужно\s+менять/i,
    /поменять\s+в\s+каждом/i,
    /каждый\s+раз\s+таблиц/i,
    /для\s+каждого\s+нового\s+типа/i,
  ],
  type_safety: [
    /type\s+safety/i,
    /связь\s+между\s+вход/i,
    /входн.*выходн/i,
    /\bany\b/i,
  ],
  constraints: [/extends/i, /огранич/i, /constraint/i],
  side_effects: [/побочн/i, /side\s+effect/i, /api/i, /запрос/i],
  dependency_array: [/dependenc/i, /зависимост/i, /deps/i],
  cleanup: [/cleanup/i, /очист/i, /unsubscribe/i, /listener/i, /таймер/i],
  run_timing: [/после\s+рендер/i, /after\s+render/i, /при\s+измен/i],
  example: [/например/i, /for\s+example/i, /usecase/i],
};

export function applyCheckpointScoreFloors(
  evaluation: PerTurnCheckpointEvaluationAiResponse,
  context: AdaptiveInterviewContextPacket,
): PerTurnCheckpointEvaluationAiResponse {
  const candidateText = collectCandidateText(context);
  const disposition = evaluation.candidateDisposition;

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

    const keywordFloor = inferKeywordPartialFloor({
      checkpointKey: checkpoint.checkpointKey,
      title: checkpoint.title,
      expected: checkpoint.expected,
      maxScore: checkpoint.score,
      candidateText,
      disposition,
    });

    const merged = mergeCheckpointEvaluation({
      currentScoreAwarded: priorState?.scoreAwarded ?? 0,
      currentStatus: (priorState?.status ?? 'unseen') as CheckpointStateStatus,
      currentEvidenceSummary: null,
      currentRationale: null,
      incomingScoreAwarded: Math.max(result.scoreAwarded, keywordFloor),
      incomingStatus: result.status,
      incomingEvidenceSummary: result.evidenceSummary,
      incomingRationale: result.rationale,
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

function inferKeywordPartialFloor(input: {
  checkpointKey: string;
  title: string;
  expected: string;
  maxScore: number;
  candidateText: string;
  disposition: CandidateAnswerDisposition;
}): number {
  // Floors use cumulative candidate turns — scoped decline on the latest answer
  // must not erase credit earned from earlier substantive answers.
  if (input.disposition === 'off_topic') {
    return 0;
  }

  if (input.candidateText.trim().length < 12) {
    return 0;
  }

  const fullCreditSignals = FULL_CREDIT_SIGNALS[input.checkpointKey] ?? [];
  if (fullCreditSignals.some((pattern) => pattern.test(input.candidateText))) {
    return input.maxScore;
  }

  const strongSignals = STRONG_SIGNALS[input.checkpointKey] ?? [];
  if (strongSignals.some((pattern) => pattern.test(input.candidateText))) {
    return Math.min(input.maxScore, input.maxScore * 0.5);
  }

  const keywords = extractKeywords(`${input.title} ${input.expected}`);
  const matched = keywords.filter((word) =>
    input.candidateText.includes(word),
  ).length;

  if (matched >= 2) {
    return Math.min(input.maxScore, input.maxScore * 0.5);
  }

  return 0;
}

function extractKeywords(text: string): string[] {
  return [...new Set(text.toLowerCase().match(/[a-z0-9_]{3,}|[а-яё]{4,}/gi) ?? [])]
    .map((word) => word.toLowerCase())
    .filter((word) => !STOP_WORDS.has(word));
}
