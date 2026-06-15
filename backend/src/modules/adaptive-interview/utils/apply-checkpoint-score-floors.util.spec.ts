import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { applyCheckpointScoreFloors } from './apply-checkpoint-score-floors.util';

function buildGenericsContext(
  latestAnswer: string,
  localTurns: AdaptiveInterviewContextPacket['localTurns'],
  checkpointStates: AdaptiveInterviewContextPacket['checkpointStates'] = [],
): AdaptiveInterviewContextPacket {
  return {
    companyId: 1,
    interviewId: 1,
    attemptId: 1,
    interviewQuestionId: 3,
    questionText: 'Для чего нужны generics в TypeScript и как их использовать?',
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
    followUpLimits: {
      maxPerQuestion: 3,
      maxPerCheckpoint: 1,
      usedForQuestion: 0,
    },
  };
}

describe('applyCheckpointScoreFloors', () => {
  it('preserves prior earned score when latest answer declines a sub-aspect', () => {
    const localTurns = [
      {
        role: 'candidate' as const,
        sequenceOrder: 1,
        content:
          'Ну они для того чтобы основной тип использовать в разных типах общих',
      },
      {
        role: 'candidate' as const,
        sequenceOrder: 2,
        content:
          'Ну например есть у нас два типа да машина и мото... items: T[], там мы передеаем какого типа этот T',
      },
      {
        role: 'candidate' as const,
        sequenceOrder: 3,
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
          scoreAwarded: 0.5,
          status: 'partial',
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

  it('does not award score from keyword mentions when AI found no semantic evidence', () => {
    const context = buildGenericsContext(
      [
        'Generic тут нужен, чтобы заменить any, но TypeScript всё равно примерно понимал тип.',
        'Если функция принимает T, то она может вернуть уже другой T, который мы сами укажем.',
        'На вход можно дать строку, а на выходе попросить число, и это будет безопасно.',
        'Через extends можно написать T extends object, и TypeScript сам поймёт, какие поля там есть.',
      ].join(' '),
      [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content:
            'Generic позволяет на вход дать строку, а на выходе попросить число, это безопасно.',
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
    const typeSafety = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'type_safety',
    );
    const constraints = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'constraints',
    );

    expect(typeParameter?.scoreAwarded).toBe(0);
    expect(reusability?.scoreAwarded).toBe(0);
    expect(typeSafety?.scoreAwarded).toBe(0);
    expect(constraints?.scoreAwarded).toBe(0);
  });

  it('caps AI credit when generics answer contains direct semantic contradictions', () => {
    const context = buildGenericsContext(
      [
        'Generics почти как any.',
        'Можно передать string, а через <T> сказать функции вернуть number, и это будет type safe.',
        'Generic не связывает вход и выход, а просто разрешает менять тип результата.',
        'T extends object означает, что TypeScript сам узнает все поля объекта.',
      ].join(' '),
      [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content:
            'Можно передать string, а через <T> сказать функции вернуть number, и это будет type safe.',
        },
      ],
    );

    const evaluation = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'type_parameter',
            status: 'covered',
            scoreAwarded: 1,
            confidence: 0.8,
            evidenceSummary: 'Mentioned <T>.',
            rationale: 'AI over-awarded keyword mention.',
          },
          {
            checkpointKey: 'reusability',
            status: 'missed',
            scoreAwarded: 0,
            confidence: 0.8,
            evidenceSummary: null,
            rationale: 'No reusability.',
          },
          {
            checkpointKey: 'type_safety',
            status: 'covered',
            scoreAwarded: 1,
            confidence: 0.8,
            evidenceSummary: 'Claimed type safe.',
            rationale: 'AI over-awarded false type safety claim.',
          },
          {
            checkpointKey: 'constraints',
            status: 'covered',
            scoreAwarded: 1,
            confidence: 0.8,
            evidenceSummary: 'Mentioned extends.',
            rationale: 'AI over-awarded false extends explanation.',
          },
        ],
      },
      context,
    );

    expect(evaluation.checkpointResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          checkpointKey: 'type_parameter',
          scoreAwarded: 0.5,
          status: 'partial',
        }),
        expect.objectContaining({
          checkpointKey: 'type_safety',
          scoreAwarded: 0,
          status: 'missed',
        }),
        expect.objectContaining({
          checkpointKey: 'constraints',
          scoreAwarded: 0,
          status: 'missed',
        }),
      ]),
    );
  });

  it('keeps AI-awarded semantic score without adding extra keyword floors', () => {
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
        checkpointResults: [
          {
            checkpointKey: 'type_parameter',
            status: 'partial',
            scoreAwarded: 0.5,
            confidence: 0.8,
            evidenceSummary: 'Explained generic data type for UI table.',
            rationale: 'Semantically partial type parameter evidence.',
          },
          {
            checkpointKey: 'reusability',
            status: 'partial',
            scoreAwarded: 0.5,
            confidence: 0.8,
            evidenceSummary: 'Mentioned reusing one table for different types.',
            rationale: 'Semantically partial reusability evidence.',
          },
          {
            checkpointKey: 'type_safety',
            status: 'missed',
            scoreAwarded: 0,
            confidence: 0.8,
            evidenceSummary: null,
            rationale: 'No type safety explanation.',
          },
          {
            checkpointKey: 'constraints',
            status: 'missed',
            scoreAwarded: 0,
            confidence: 0.8,
            evidenceSummary: null,
            rationale: 'No constraints explanation.',
          },
        ],
      },
      context,
    );

    const typeParameter = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'type_parameter',
    );
    const reusability = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'reusability',
    );

    expect(typeParameter?.scoreAwarded).toBe(0.5);
    expect(typeParameter?.status).toBe('partial');
    expect(reusability?.scoreAwarded).toBe(0.5);
  });
});
