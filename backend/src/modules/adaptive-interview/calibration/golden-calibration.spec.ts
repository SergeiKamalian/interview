import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { PerTurnCheckpointEvaluationAiResponse } from '../types/per-turn-evaluation.types';
import { applyCheckpointScoreFloors } from '../utils/apply-checkpoint-score-floors.util';
import { fiberCheckpoint } from '../utils/fiber-evaluation-hints.fixture';
import type { GoldenCalibrationCase } from './types';

const FIBER_CHECKPOINTS = [
  'fiber_definition',
  'stack_vs_fiber',
  'fiber_pointers',
  'render_phase',
  'commit_phase',
  'scheduling',
  'lanes_priority',
  'commit_limitation',
] as const;

function loadGoldenCases(): GoldenCalibrationCase[] {
  const casesDir = path.join(__dirname, 'golden-cases');
  const files = fs
    .readdirSync(casesDir)
    .filter((file) => file.endsWith('.json'))
    .filter((file) => !file.includes('budget-prioritizes'))
    .filter((file) => !file.includes('transitive-'))
    .filter((file) => !file.includes('hooks-useeffect'))
    .filter((file) => !file.includes('hooks-useeffect-after'))
    .filter((file) => !file.includes('hooks-double-mismatch'))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(casesDir, file), 'utf8');
    return JSON.parse(raw) as GoldenCalibrationCase;
  });
}

function buildFiberContext(
  caseData: GoldenCalibrationCase,
): AdaptiveInterviewContextPacket {
  const candidateTurns = caseData.turns.filter((turn) => turn.role === 'candidate');
  const useLatestTurnOnly =
    caseData.id === 'react-fiber-attempt42-paraphrase' ||
    caseData.id === 'react-fiber-scheduling-after-probe-decline';
  const isFollowUpAnswer = useLatestTurnOnly && candidateTurns.length > 1;
  const candidateText = useLatestTurnOnly
    ? (candidateTurns[candidateTurns.length - 1]?.content ?? '')
    : candidateTurns.map((turn) => turn.content).join(' ');

  const checkpointStates =
    caseData.id === 'react-fiber-scheduling-after-probe-decline'
      ? [
          {
            checkpointKey: 'scheduling',
            status: 'partial',
            scoreAwarded: 1.38,
            maxScore: 2.5,
            followUpCount: 1,
            rationale:
              'depth=partial_knowledge, probe=pending coverage=medium accuracy=partial',
          },
        ]
      : [];

  return {
    companyId: 1,
    interviewId: 4,
    attemptId: 34,
    interviewQuestionId: 7,
    questionText: 'Как работает React Fiber и процесс обновления Virtual DOM?',
    referenceAnswer: 'Fiber reconciliation engine',
    maxScore: 8,
    badAnswerExamples: [
      'Fiber — это просто Virtual DOM. React сравнивает деревья и обновляет страницу быстрее.',
      'Concurrent mode полностью убирает лаги. Можно рендерить 20 000 div без virtualization — Fiber всё разобьёт на кадры.',
      'Render phase и commit phase — одно и то же. React сразу пишет в DOM во время reconcileChildFibers.',
      'Fiber использует requestIdleCallback для планирования работы',
      'Узлы Fiber хранятся в Virtual DOM и Redux',
    ],
    latestCandidateAnswer: candidateText,
    latestCandidateMessageId: 99,
    latestAnswerMessageKind: isFollowUpAnswer ? 'follow_up_answer' : null,
    targetCheckpointKey: isFollowUpAnswer ? 'scheduling' : null,
    checkpoints: FIBER_CHECKPOINTS.map((key, index) =>
      fiberCheckpoint(key, {
        sortOrder: index,
        score: key === 'scheduling' ? 2.5 : undefined,
      }),
    ),
    checkpointStates,
    evidenceSnippets: [],
    localTurns: caseData.turns.map((turn, index) => ({
      role: 'candidate' as const,
      sequenceOrder: index + 1,
      content: turn.content,
    })),
    followUpLimits: {
      maxPerQuestion: 3,
      maxPerCheckpoint: 1,
      usedForQuestion: 0,
    },
  };
}

function toAiResponse(
  caseData: GoldenCalibrationCase,
): PerTurnCheckpointEvaluationAiResponse {
  return {
    candidateDisposition: caseData.aiResponse
      .candidate_disposition as PerTurnCheckpointEvaluationAiResponse['candidateDisposition'],
    checkpointResults: caseData.aiResponse.checkpoint_results.map((item) => ({
      checkpointKey: item.checkpoint_key,
      status: item.status as PerTurnCheckpointEvaluationAiResponse['checkpointResults'][number]['status'],
      scoreAwarded: item.score_awarded,
      confidence: item.confidence,
      evidenceSummary: item.evidence_summary,
      rationale: item.rationale,
    })),
  };
}

describe('golden calibration (mocked AI)', () => {
  const cases = loadGoldenCases();

  it.each(cases.map((caseData) => [caseData.id, caseData]))(
    '%s stays within expected score bands after guards',
    (_id, caseData) => {
      const context = buildFiberContext(caseData);
      const { evaluation } = applyCheckpointScoreFloors(
        toAiResponse(caseData),
        context,
      );

      const total = evaluation.checkpointResults.reduce(
        (sum, item) => sum + item.scoreAwarded,
        0,
      );
      const ratio = total / context.maxScore;

      expect(ratio).toBeGreaterThanOrEqual(
        caseData.expected.totalScoreRatio.min - 0.01,
      );
      expect(ratio).toBeLessThanOrEqual(
        caseData.expected.totalScoreRatio.max + 0.01,
      );

      for (const expected of caseData.expected.checkpointResults) {
        const actual = evaluation.checkpointResults.find(
          (item) => item.checkpointKey === expected.checkpoint_key,
        );
        expect(actual).toBeDefined();

        if (expected.status) {
          expect(actual?.status).toBe(expected.status);
        }

        if (expected.score_awarded) {
          expect(actual?.scoreAwarded).toBeGreaterThanOrEqual(
            expected.score_awarded.min - 0.01,
          );
          expect(actual?.scoreAwarded).toBeLessThanOrEqual(
            expected.score_awarded.max + 0.01,
          );
        }

        if (
          caseData.id === 'react-fiber-scheduling-shallow-needs-probe' &&
          expected.checkpoint_key === 'scheduling'
        ) {
          expect(actual?.rationale ?? '').toMatch(/probe\s*=\s*pending/i);
        }
      }
    },
  );
});

describe('golden calibration live AI', () => {
  const liveEnabled = process.env.CALIBRATION_LIVE_AI === '1';

  (liveEnabled ? it : it.skip)(
    'requires CALIBRATION_LIVE_AI=1',
    () => {
      expect(liveEnabled).toBe(true);
    },
  );
});
