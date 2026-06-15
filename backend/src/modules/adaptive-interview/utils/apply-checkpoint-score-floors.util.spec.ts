import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { applyCheckpointScoreFloors } from './apply-checkpoint-score-floors.util';

function buildGenericsContext(
  latestAnswer: string,
  localTurns: AdaptiveInterviewContextPacket['localTurns'],
  checkpointStates: AdaptiveInterviewContextPacket['checkpointStates'] = [],
): AdaptiveInterviewContextPacket {
  return {
    companyId: 1,
    attemptId: 1,
    interviewQuestionId: 3,
    questionText:
      'Для чего нужны generics в TypeScript и как их использовать?',
    referenceAnswer: 'Generics позволяют параметризовать типы.',
    latestCandidateAnswer: latestAnswer,
    latestCandidateMessageId: 10,
    maxScore: 4,
    checkpoints: [
      {
        checkpointKey: 'type_parameter',
        title: 'Понимает параметр типа',
        expected:
          'Кандидат объясняет, что generic добавляет параметр типа для функции, интерфейса, класса или типа.',
        score: 1,
        sortOrder: 0,
      },
      {
        checkpointKey: 'reusability',
        title: 'Понимает переиспользование',
        expected:
          'Кандидат говорит, что generics позволяют не дублировать похожие типы и API.',
        score: 1,
        sortOrder: 1,
      },
      {
        checkpointKey: 'type_safety',
        title: 'Понимает type safety',
        expected:
          'Кандидат объясняет, что generics сохраняют связь входных и выходных типов без any.',
        score: 1,
        sortOrder: 2,
      },
      {
        checkpointKey: 'constraints',
        title: 'Знает constraints',
        expected:
          'Кандидат упоминает extends или ограничение допустимых типов.',
        score: 1,
        sortOrder: 3,
      },
    ],
    checkpointStates,
    evidenceSnippets: [],
    localTurns,
    limits: {
      localTurnLimit: 3,
      maxPerQuestion: 3,
      maxPerCheckpoint: 1,
    },
  };
}

describe('applyCheckpointScoreFloors', () => {
  it('awards partial credit for substantive generics answers when AI returns zeros', () => {
    const localTurns = [
      {
        role: 'candidate' as const,
        content:
          'Ну они для того чтобы основной тип использовать в разных типах общих',
      },
      {
        role: 'candidate' as const,
        content:
          'Ну например есть у нас два типа да машина и мото... items: T[], там мы передеаем какого типа этот T',
      },
      {
        role: 'candidate' as const,
        content:
          'Ну это легко для того чтобы не переписывать код всегда, плюс если добавили какой то новфй тип или убрали и поменяли, не нужно поменять в каждом месте',
      },
    ];

    const context = buildGenericsContext(
      'На это я вряд ли смогу ответить',
      localTurns,
      [
        {
          checkpointKey: 'type_parameter',
          status: 'partial',
          scoreAwarded: 0.5,
          maxScore: 1,
          followUpCount: 1,
        },
        {
          checkpointKey: 'reusability',
          status: 'partial',
          scoreAwarded: 0.5,
          maxScore: 1,
          followUpCount: 1,
        },
        {
          checkpointKey: 'type_safety',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1,
          followUpCount: 1,
        },
        {
          checkpointKey: 'constraints',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1,
          followUpCount: 0,
        },
      ],
    );

    const evaluation = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'declined',
        checkpointResults: context.checkpoints.map((checkpoint) => ({
          checkpointKey: checkpoint.checkpointKey,
          status: 'missed' as const,
          scoreAwarded: 0,
          confidence: 0.9,
          evidenceSummary: null,
          rationale: 'Latest answer declined one aspect',
        })),
      },
      context,
    );

    expect(evaluation.checkpointResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          checkpointKey: 'type_parameter',
          scoreAwarded: 1,
          status: 'covered',
        }),
        expect.objectContaining({
          checkpointKey: 'reusability',
          scoreAwarded: 0.5,
        }),
        expect.objectContaining({
          checkpointKey: 'type_safety',
          scoreAwarded: 0,
        }),
      ]),
    );
  });

  it('raises type_parameter and reusability from first generics answers alone', () => {
    const context = buildGenericsContext(
      'Ну например items: T[], там мы передеаем какого типа этот T',
      [
        {
          role: 'candidate',
          content:
            'Ну они для того чтобы основной тип использовать в разных типах общих',
        },
      ],
    );

    const evaluation = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: context.checkpoints.map((checkpoint) => ({
          checkpointKey: checkpoint.checkpointKey,
          status: 'missed' as const,
          scoreAwarded: 0,
          confidence: 0.5,
          evidenceSummary: null,
          rationale: 'AI missed partial credit',
        })),
      },
      context,
    );

    const typeParameter = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'type_parameter',
    );
    const reusability = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'reusability',
    );

    expect(typeParameter?.scoreAwarded).toBeGreaterThanOrEqual(0.5);
    expect(reusability?.scoreAwarded).toBeGreaterThanOrEqual(0);
  });

  it('awards full type_parameter credit for generic ui table example from attempt 10', () => {
    const localTurns = [
      {
        role: 'candidate' as const,
        content: 'Ну они нужны чтобы переиспользовать типы typescript',
        sequenceOrder: 1,
      },
      {
        role: 'candidate' as const,
        content:
          'Ну короче есть у нас таблица ui, в нем мы должы рендерить в каждом ячейке че нибидь, где нужно достать значение из даты которые мы передадим ему, ui таблица должна знать какого типа его data чтобы можно было изнутри контроиловать его',
        sequenceOrder: 2,
      },
      {
        role: 'candidate' as const,
        content:
          'Ну это для того, чтобы не пересоздать каждый раз таблицу для каждого нового типа, а можно было изнутри все красиво использовать в разных кейсах',
        sequenceOrder: 3,
      },
    ];

    const context = buildGenericsContext('Ой на это не отвечу', localTurns);

    const evaluation = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'declined',
        checkpointResults: context.checkpoints.map((checkpoint) => ({
          checkpointKey: checkpoint.checkpointKey,
          status: 'missed' as const,
          scoreAwarded: 0,
          confidence: 0.9,
          evidenceSummary: null,
          rationale: 'AI missed ui table generic example',
        })),
      },
      context,
    );

    const typeParameter = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'type_parameter',
    );
    const reusability = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'reusability',
    );

    expect(typeParameter?.scoreAwarded).toBe(1);
    expect(typeParameter?.status).toBe('covered');
    expect(reusability?.scoreAwarded).toBeGreaterThanOrEqual(0.5);
  });
});
