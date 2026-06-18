import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import { applyCheckpointScoreFloors } from './apply-checkpoint-score-floors.util';
import { fiberCheckpoint } from './fiber-evaluation-hints.fixture';

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
    badAnswerExamples: [],
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

    const { evaluation } = applyCheckpointScoreFloors(
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

    const { evaluation } = applyCheckpointScoreFloors(
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

  it('caps AI credit when answer overlaps question bank bad examples', () => {
    const latestAnswer =
      'Можно передать string, а через <T> сказать функции вернуть number, и это будет type safe.';
    const context = buildGenericsContext(
      latestAnswer,
      [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content: latestAnswer,
        },
      ],
    );
    context.badAnswerExamples = [
      'Generics почти как any.',
      'Можно передать string, а через <T> сказать функции вернуть number, и это будет type safe.',
      'T extends object означает, что TypeScript сам узнает все поля объекта.',
    ];

    const { evaluation } = applyCheckpointScoreFloors(
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
          scoreAwarded: 0.5,
          status: 'partial',
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

    const { evaluation } = applyCheckpointScoreFloors(
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

  it('caps over-awarded Fiber answers to partial when evidence is half-right half-wrong', () => {
    const candidateAnswers = [
      'React Fiber — новый механизм reconciliation в React 16+, прерывать рендер. Virtual DOM, requestIdleCallback. concurrent mode не лагает на тысячах элементов.',
      'До Fiber call stack синхронно. Fiber сделал рендер полностью асинхронным через Promises, клики всегда проходят. Узлы Fiber лежат в Redux.',
      'child, sibling, return. Обход через child и sibling. Ещё parent и next, React хранит в Virtual DOM.',
      'На commit DOM мутации, useLayoutEffect. useEffect тоже в commit до paint. Fiber разбивает commit на куски по 5ms.',
      'SyncLane, TransitionLane, startTransition, useDeferredValue, createRoot. Lanes в Redux, requestIdleCallback решает приоритеты.',
    ].join(' ');

    const fiberCheckpoints = [
      'fiber_definition',
      'stack_vs_fiber',
      'fiber_pointers',
      'render_phase',
      'commit_phase',
      'scheduling',
      'lanes_priority',
      'commit_limitation',
    ] as const;

    const context: AdaptiveInterviewContextPacket = {
      companyId: 1,
      interviewId: 4,
      attemptId: 34,
      interviewQuestionId: 7,
      questionText: 'Как работает React Fiber и процесс обновления Virtual DOM?',
      referenceAnswer: 'Fiber reconciliation engine',
      latestCandidateAnswer: candidateAnswers,
      latestCandidateMessageId: 99,
      maxScore: 8,
      badAnswerExamples: [
        'Fiber — это просто Virtual DOM. React сравнивает деревья и обновляет страницу быстрее.',
        'Concurrent mode полностью убирает лаги. Можно рендерить 20 000 div без virtualization — Fiber всё разобьёт на кадры.',
        'Render phase и commit phase — одно и то же. React сразу пишет в DOM во время reconcileChildFibers.',
        'Чтобы приложение стало concurrent, достаточно обернуть все setState в startTransition, включая value инпута.',
      ],
      checkpoints: fiberCheckpoints.map((key, index) =>
        fiberCheckpoint(key, { sortOrder: index }),
      ),
      checkpointStates: [],
      evidenceSnippets: [],
      localTurns: candidateAnswers
        .split('. ')
        .map((content, index) => ({
          role: 'candidate' as const,
          sequenceOrder: index + 1,
          content,
        })),
      followUpLimits: {
        maxPerQuestion: 5,
        maxPerCheckpoint: 1,
        usedForQuestion: 4,
      },
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: fiberCheckpoints.map((checkpointKey) => ({
          checkpointKey,
          status: 'covered' as const,
          scoreAwarded: 1,
          confidence: 0.9,
          evidenceSummary: 'AI over-awarded',
          rationale:
            'Суть верна, но утверждение про requestIdleCallback не соответствует ожидаемому описанию.',
        })),
      },
      context,
    );

    const total = evaluation.checkpointResults.reduce(
      (sum, item) => sum + item.scoreAwarded,
      0,
    );

    expect(total).toBeLessThanOrEqual(5);
    expect(total).toBeGreaterThanOrEqual(3);

    expect(
      evaluation.checkpointResults.filter((item) => item.status === 'covered'),
    ).toHaveLength(0);

    expect(
      evaluation.checkpointResults.find(
        (item) => item.checkpointKey === 'commit_limitation',
      ),
    ).toEqual(
      expect.objectContaining({
        scoreAwarded: 0,
        status: 'missed',
      }),
    );
  });

  it('does not false-flag scheduling when latest answer correctly denies requestIdleCallback', () => {
    const wrongCommit =
      'В commit phase React использует requestIdleCallback и может прерываться.';
    const correctScheduling =
      'Планирование через scheduler и MessageChannel, не requestIdleCallback.';

    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext(correctScheduling, [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content: wrongCommit,
          messageKind: 'follow_up_answer',
          targetCheckpointKey: 'commit_phase',
        },
      ]),
      checkpoints: [fiberCheckpoint('scheduling')],
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 1,
            confidence: 0.9,
            evidenceSummary: 'Correct scheduling',
            rationale:
              'depth=knows, coverage=high, accuracy=full: scheduler, shouldYield, MessageChannel.',
          },
        ],
      },
      context,
    );

    const scheduling = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'scheduling',
    );

    expect(scheduling?.scoreAwarded).toBe(1);
    expect(scheduling?.rationale).not.toContain('false_claim');
  });

  it('caps lanes_priority to zero on explicit refusal in latest answer', () => {
    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext('placeholder', []),
      latestCandidateAnswer:
        'Честно, с lanes и приоритетами не разбирался — startTransition только названия слышал. Давайте дальше.',
      localTurns: [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content:
            'Fiber планирует через scheduler и lanes, startTransition для transition.',
        },
      ],
      checkpoints: [
        fiberCheckpoint('lanes_priority', {
          title: 'Понимает приоритеты и concurrent API',
          expected: 'lanes, bitmasks, startTransition',
        }),
      ],
      checkpointStates: [
        {
          checkpointKey: 'lanes_priority',
          status: 'partial',
          scoreAwarded: 0.25,
          maxScore: 1,
          followUpCount: 1,
          needsManualReview: false,
        },
      ],
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'declined',
        checkpointResults: [
          {
            checkpointKey: 'lanes_priority',
            status: 'partial',
            scoreAwarded: 0.25,
            confidence: 0.7,
            evidenceSummary: 'Mentioned lanes earlier',
            rationale:
              'depth=partial_knowledge, coverage=medium, accuracy=partial: lanes упомянуты ранее.',
          },
        ],
      },
      context,
      { evidenceSource: 'follow_up_answer' },
    );

    expect(
      evaluation.checkpointResults.find(
        (item) => item.checkpointKey === 'lanes_priority',
      ),
    ).toEqual(
      expect.objectContaining({
        scoreAwarded: 0,
        status: 'missed',
      }),
    );
  });

  it('does not cap stack_vs_fiber when answer is correct but shares render/commit vocabulary', () => {
    const stackAnswer =
      'Раньше reconciler шёл рекурсивно через call stack — синхронный обход дерева. Fiber заменил это на связный список fiber-узлов: работа идёт порциями, React может уступить поток.';

    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext(stackAnswer, []),
      questionText: 'Как работает React Fiber?',
      maxScore: 8,
      badAnswerExamples: [
        'Render phase и commit phase — одно и то же. React сразу пишет в DOM во время reconcileChildFibers.',
      ],
      checkpoints: [
        fiberCheckpoint('stack_vs_fiber', {
          title: 'Отличает stack reconciler от Fiber',
          expected: 'stack vs fiber',
        }),
      ],
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'stack_vs_fiber',
            status: 'partial',
            scoreAwarded: 0.25,
            confidence: 0.9,
            evidenceSummary: 'stack vs fiber',
            rationale:
              'depth=understands, coverage=high, accuracy=partial: верно объяснил stack vs Fiber',
          },
        ],
      },
      context,
    );

    const stack = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'stack_vs_fiber',
    );

    expect(stack?.scoreAwarded).toBeGreaterThanOrEqual(0.75);
    expect(stack?.rationale).not.toContain('overlaps bad answer example');
  });

  it('aligns scheduling score when rationale says accuracy=full depth=knows', () => {
    const schedulingAnswer =
      'Fiber планирует работу через scheduler. В work loop React проверяет shouldYield и тайм-слайсы ~5ms. Используется MessageChannel, не requestIdleCallback.';

    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext(schedulingAnswer, []),
      questionText: 'Как работает React Fiber?',
      targetCheckpointKey: 'scheduling',
      latestAnswerMessageKind: 'follow_up_answer',
      checkpoints: [fiberCheckpoint('scheduling', {
        title: 'Понимает планирование Fiber',
        expected: 'scheduler, shouldYield, MessageChannel',
      })],
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 0.25,
            confidence: 0.9,
            evidenceSummary: 'Correct scheduling',
            rationale:
              'depth=knows, coverage=high, accuracy=full: scheduler, shouldYield, MessageChannel.',
          },
        ],
      },
      context,
      { evidenceSource: 'follow_up_answer' },
    );

    const scheduling = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'scheduling',
    );

    expect(scheduling?.scoreAwarded).toBeGreaterThanOrEqual(0.7);
    expect(scheduling?.status).toBe('covered');
  });

  it('freezes targeted checkpoint score when candidate asks for scope', () => {
    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext('Что именно вам интересно?', []),
      questionText: 'Как работает React Fiber?',
      targetCheckpointKey: 'scheduling',
      latestAnswerMessageKind: 'follow_up_answer',
      checkpoints: [
        fiberCheckpoint('scheduling', {
          title: 'Понимает планирование Fiber',
          expected: 'scheduler, shouldYield, MessageChannel',
        }),
      ],
      checkpointStates: [
        {
          checkpointKey: 'scheduling',
          status: 'partial',
          scoreAwarded: 1.25,
          maxScore: 2.5,
          followUpCount: 1,
          rationale: 'depth=partial_knowledge probe=pending',
        },
      ],
      localTurns: [
        { role: 'ai', content: 'Можете уточнить технические детали?' },
        { role: 'candidate', content: 'Что именно вам интересно?' },
      ],
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 2.5,
            confidence: 0.9,
            evidenceSummary: null,
            rationale: 'depth=understands coverage=high accuracy=full',
          },
        ],
      },
      context,
      { evidenceSource: 'follow_up_answer' },
    );

    const scheduling = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'scheduling',
    );

    expect(scheduling?.scoreAwarded).toBe(1.25);
    expect(scheduling?.rationale).toContain('scope_clarification=pending');
  });

  it('does not positive-floor lanes when scheduling follow-up mentions priorities but AI says coverage=none', () => {
    const mainAnswer =
      'Fiber — reconciliation engine с render и commit phase.';
    const schedulingFollowUp =
      'Scheduler через MessageChannel и shouldYield. startTransition снижает приоритет. Ввод в инпуте важнее тяжелой перерисовки списка.';

    const scheduling = fiberCheckpoint('scheduling', { score: 2.5, sortOrder: 6 });
    const lanes = fiberCheckpoint('lanes_priority', { score: 1.5, sortOrder: 7 });

    const context: AdaptiveInterviewContextPacket = {
      companyId: 1,
      interviewId: 12,
      attemptId: 82,
      interviewQuestionId: 7,
      questionText: 'Как работает React Fiber?',
      referenceAnswer: 'Fiber reconciliation engine',
      maxScore: 8,
      badAnswerExamples: [],
      latestCandidateAnswer: schedulingFollowUp,
      latestCandidateMessageId: 8,
      latestAnswerMessageKind: 'follow_up_answer',
      targetCheckpointKey: 'scheduling',
      checkpoints: [scheduling, lanes],
      checkpointStates: [
        {
          checkpointKey: 'scheduling',
          status: 'partial',
          scoreAwarded: 1.38,
          maxScore: 2.5,
          followUpCount: 1,
        },
        {
          checkpointKey: 'lanes_priority',
          status: 'missed',
          scoreAwarded: 0,
          maxScore: 1.5,
          followUpCount: 0,
        },
      ],
      evidenceSnippets: [],
      localTurns: [
        {
          role: 'candidate',
          sequenceOrder: 1,
          content: mainAnswer,
          messageKind: 'main_answer',
        },
        {
          role: 'candidate',
          sequenceOrder: 2,
          content: schedulingFollowUp,
          messageKind: 'follow_up_answer',
          targetCheckpointKey: 'scheduling',
        },
      ],
      followUpLimits: {
        maxPerQuestion: 4,
        maxPerCheckpoint: 1,
        usedForQuestion: 1,
      },
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'scheduling',
            status: 'covered',
            scoreAwarded: 2.1,
            confidence: 0.9,
            evidenceSummary: 'scheduler priorities',
            rationale: 'depth=understands coverage=high accuracy=full',
          },
          {
            checkpointKey: 'lanes_priority',
            status: 'missed',
            scoreAwarded: 0,
            confidence: 0.95,
            evidenceSummary: null,
            rationale: 'depth=none coverage=none accuracy=none',
          },
        ],
      },
      context,
      { evidenceSource: 'follow_up_answer' },
    );

    const lanesResult = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'lanes_priority',
    );

    expect(lanesResult?.scoreAwarded).toBe(0);
    expect(lanesResult?.status).toBe('missed');
  });

  it('aligns fiber_pointers to covered when AI rationale says accuracy=full depth=knows', () => {
    const pointersAnswer =
      'Fiber-узел с child, sibling, return. Обход: вглубь через child, потом sibling, при тупике return.';

    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext(pointersAnswer, []),
      questionText: 'Как работает React Fiber?',
      targetCheckpointKey: 'fiber_pointers',
      latestAnswerMessageKind: 'follow_up_answer',
      checkpoints: [fiberCheckpoint('fiber_pointers', {
        title: 'Знает структуру fiber-узла',
        expected: 'child, sibling, return',
      })],
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'fiber_pointers',
            status: 'partial',
            scoreAwarded: 0.25,
            confidence: 0.95,
            evidenceSummary: 'child sibling return',
            rationale:
              'depth=knows, coverage=high, accuracy=full: корректно перечислены child/sibling/return и описан порядок обхода.',
          },
        ],
      },
      context,
      { evidenceSource: 'follow_up_answer' },
    );

    const pointers = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'fiber_pointers',
    );

    expect(pointers?.scoreAwarded).toBe(1);
    expect(pointers?.status).toBe('covered');
  });

  it('raises strong composite Fiber main answer toward 7.5+/10 band', () => {
    const opener =
      'Да, на практике с React 18: createRoot, startTransition, useDeferredValue. Fiber — reconciliation engine: fiber-узел в связном дереве, render phase прерывается через lanes и shouldYield, commit phase атомарно применяет изменения в DOM.';
    const main =
      'При setState/createRoot React создаёт update с lane-приоритетом. В render phase Fiber строит work-in-progress дерево: у каждого fiber есть child/sibling/return, current и alternate. Scheduler через lanes (SyncLane, TransitionLane) и MessageChannel с shouldYield прерывает длинный render, не блокируя main thread. Когда дерево готово — commit phase атомарно: before mutation, mutation (DOM), layout (useLayoutEffect), passive (useEffect). Виртуализация списков выигрывает от прерываемого render.';

    const fiberCheckpoints = [
      'fiber_definition',
      'stack_vs_fiber',
      'fiber_pointers',
      'render_phase',
      'commit_phase',
      'scheduling',
      'lanes_priority',
      'commit_limitation',
    ] as const;

    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext(main, [
        { role: 'candidate', sequenceOrder: 1, content: opener },
      ]),
      questionText: 'Как работает React Fiber?',
      maxScore: 8,
      checkpoints: fiberCheckpoints.map((checkpointKey, index) =>
        fiberCheckpoint(checkpointKey, { sortOrder: index }),
      ),
      checkpointStates: fiberCheckpoints.map((checkpointKey) => ({
        checkpointKey,
        status: 'partial' as const,
        scoreAwarded: 0.5,
        maxScore: 1,
        followUpCount: 0,
        needsManualReview: false,
      })),
    };

    const aiUnderscore = (
      checkpointKey: string,
    ): (typeof fiberCheckpoints)[number] extends never
      ? never
      : {
          checkpointKey: string;
          status: 'partial';
          scoreAwarded: number;
          confidence: number;
          evidenceSummary: string;
          rationale: string;
        } => ({
      checkpointKey,
      status: 'partial' as const,
      scoreAwarded: 0.5,
      confidence: 0.7,
      evidenceSummary: 'underscored',
      rationale:
        'depth=understands, coverage=high, accuracy=partial: корректно описал механизм, но не все детали раскрыты.',
    });

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: fiberCheckpoints.map((checkpointKey) =>
          aiUnderscore(checkpointKey),
        ),
      },
      context,
    );

    const total = evaluation.checkpointResults.reduce(
      (sum, item) => sum + item.scoreAwarded,
      0,
    );

    expect(total).toBeGreaterThanOrEqual(6);

    const pointers = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'fiber_pointers',
    );
    const scheduling = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'scheduling',
    );
    const lanes = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'lanes_priority',
    );

    expect(pointers?.scoreAwarded).toBeGreaterThanOrEqual(0.75);
    expect(scheduling?.scoreAwarded).toBeGreaterThanOrEqual(0.75);
    expect(lanes?.scoreAwarded).toBeGreaterThanOrEqual(0.75);
    expect(scheduling?.rationale).not.toContain('false_claim');
    expect(pointers?.rationale).toMatch(/depth=(knows|understands)/i);
  });

  it('preserves covered stack_vs_fiber when render follow-up omits stack comparison', () => {
    const mainAnswer =
      'До React 16 reconciler шёл рекурсивно через call stack. Fiber — связный список child/sibling/return.';
    const renderFollowUp =
      'Render phase чистая: строится WIP alternate, DOM не мутируется, commit после готовности WIP.';

    const context: AdaptiveInterviewContextPacket = {
      ...buildGenericsContext(renderFollowUp, [
        { role: 'candidate', sequenceOrder: 1, content: mainAnswer },
      ]),
      questionText: 'Как работает React Fiber?',
      maxScore: 8,
      latestAnswerMessageKind: 'follow_up_answer',
      targetCheckpointKey: 'render_phase',
      checkpoints: [
        fiberCheckpoint('stack_vs_fiber', {
          title: 'Отличает stack reconciler от Fiber',
          expected: 'stack vs fiber',
        }),
        fiberCheckpoint('render_phase', {
          title: 'Объясняет render phase',
          expected: 'WIP render',
          sortOrder: 1,
        }),
      ],
      checkpointStates: [
        {
          checkpointKey: 'stack_vs_fiber',
          status: 'covered',
          scoreAwarded: 1,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
        },
        {
          checkpointKey: 'render_phase',
          status: 'partial',
          scoreAwarded: 0.85,
          maxScore: 1,
          followUpCount: 0,
          needsManualReview: false,
        },
      ],
    };

    const { evaluation } = applyCheckpointScoreFloors(
      {
        candidateDisposition: 'engaged',
        checkpointResults: [
          {
            checkpointKey: 'stack_vs_fiber',
            status: 'partial',
            scoreAwarded: 0.5,
            confidence: 0.8,
            evidenceSummary: 'not repeated',
            rationale:
              'В текущем ответе нет явного сравнения с stack reconciler, но ранее было покрыто; текущий ответ не противоречит. depth=mention_only, coverage=high, accuracy=wrong.',
          },
          {
            checkpointKey: 'render_phase',
            status: 'covered',
            scoreAwarded: 1,
            confidence: 0.95,
            evidenceSummary: 'WIP render',
            rationale:
              'depth=knows, coverage=high, accuracy=full: WIP alternate, DOM не мутируется.',
          },
        ],
      },
      context,
      { evidenceSource: 'follow_up_answer' },
    );

    const stack = evaluation.checkpointResults.find(
      (item) => item.checkpointKey === 'stack_vs_fiber',
    );

    expect(stack?.scoreAwarded).toBe(1);
    expect(stack?.status).toBe('covered');
    expect(stack?.rationale).not.toContain('false_claim');
  });
});
