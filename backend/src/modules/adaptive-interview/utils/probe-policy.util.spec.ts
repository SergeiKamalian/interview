import { fiberCheckpoint, FIBER_EVALUATION_HINTS } from './fiber-evaluation-hints.fixture';
import {
  buildProbeFollowUpQuestion,
  buildResidualGapFollowUpQuestion,
  deriveProbeStatus,
  getMissingMustConcepts,
  hasPartialConceptCoverage,
  probeRequired,
  residualGapProbeRequired,
  resolveProbePhrasesForCandidate,
} from './probe-policy.util';

describe('probe-policy.util', () => {
  const schedulingCheckpoint = fiberCheckpoint('scheduling', {
    score: 2.5,
    title: 'Планирование Fiber',
  });

  it('requires probe for advanced scheduling with shallow correct answer', () => {
    const answer =
      'Планирование Fiber — React не делает весь рендер одним блоком. Разбивает на части, ввод — высокий приоритет.';

    expect(
      probeRequired({
        checkpoint: schedulingCheckpoint,
        state: {
          status: 'partial',
          scoreAwarded: 0.25,
          maxScore: 2.5,
          followUpCount: 0,
          rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
        },
        hints: FIBER_EVALUATION_HINTS.scheduling,
        questionMaxScore: 8,
        candidateEvidenceText: answer,
        latestCandidateText: answer,
      }),
    ).toBe(true);
  });

  it('does not require probe for basic tier checkpoint', () => {
    const checkpoint = fiberCheckpoint('fiber_definition', { score: 1 });
    const answer =
      'Fiber — reconciliation engine, render прерывается, commit синхронный.';

    expect(
      probeRequired({
        checkpoint,
        state: {
          status: 'partial',
          scoreAwarded: 0.25,
          maxScore: 1,
          followUpCount: 0,
          rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
        },
        hints: FIBER_EVALUATION_HINTS.fiber_definition,
        questionMaxScore: 8,
        candidateEvidenceText: answer,
      }),
    ).toBe(false);
  });

  it('derives open probe status before follow-up', () => {
    expect(
      deriveProbeStatus({
        checkpoint: schedulingCheckpoint,
        state: {
          status: 'partial',
          scoreAwarded: 0.25,
          maxScore: 2.5,
          followUpCount: 0,
          rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
        },
        hints: FIBER_EVALUATION_HINTS.scheduling,
        questionMaxScore: 8,
        candidateEvidenceText:
          'Планирование Fiber — приоритеты ввода выше списка.',
      }),
    ).toBe('open');
  });

  it('lists missing mustConcepts for shallow scheduling answer', () => {
    const answer = 'Планирование — приоритеты ввода и списка.';
    const missing = getMissingMustConcepts(
      FIBER_EVALUATION_HINTS.scheduling,
      answer,
    );

    expect(missing).toEqual(
      expect.arrayContaining(['scheduler', 'MessageChannel', 'shouldYield']),
    );
  });

  it('builds candidate-facing probe follow-up without rubric title', () => {
    const question = buildProbeFollowUpQuestion({
      checkpointTitle: 'Понимает планирование Fiber',
      missingMustConcepts: ['scheduler', 'планирован', 'MessageChannel'],
      hints: FIBER_EVALUATION_HINTS.scheduling,
    });

    expect(question).not.toContain('Понимает');
    expect(question).toContain('scheduler');
    expect(question).toContain('MessageChannel');
    expect(question).toMatch(/^Хорошо\. Вы верно описали общую идею\./);
  });

  it('resolves probe phrases from bank probeConceptGroups only', () => {
    expect(
      resolveProbePhrasesForCandidate(FIBER_EVALUATION_HINTS.scheduling, [
        'scheduler',
        'планирован',
        'MessageChannel',
      ]),
    ).toBe('scheduler, MessageChannel и postMessage');

    expect(
      resolveProbePhrasesForCandidate(null, ['scheduler', 'MessageChannel']),
    ).toBeNull();
  });

  it('requires residual gap probe after partial compound follow-up answer', () => {
    const answer =
      'Render phase — React считает изменения в памяти, экран пока не обновляет.';
    const hints = FIBER_EVALUATION_HINTS.render_phase;

    expect(hasPartialConceptCoverage(hints, answer)).toBe(true);
    expect(
      residualGapProbeRequired({
        checkpoint: fiberCheckpoint('render_phase', { score: 1 }),
        state: {
          status: 'partial',
          scoreAwarded: 0.55,
          maxScore: 1,
          followUpCount: 1,
          rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
        },
        hints,
        questionMaxScore: 8,
        candidateEvidenceText: answer,
        latestCandidateText: answer,
      }),
    ).toBe(true);
  });

  it('derives open probe status while residual gap remains', () => {
    const answer =
      'Render phase — React считает изменения в памяти, экран пока не обновляет.';

    expect(
      deriveProbeStatus({
        checkpoint: fiberCheckpoint('render_phase', { score: 1 }),
        state: {
          status: 'partial',
          scoreAwarded: 0.55,
          maxScore: 1,
          followUpCount: 1,
          rationale: 'depth=partial_knowledge coverage=medium accuracy=partial',
        },
        hints: FIBER_EVALUATION_HINTS.render_phase,
        questionMaxScore: 8,
        candidateEvidenceText: answer,
        latestCandidateText: answer,
      }),
    ).toBe('open');
  });

  it('builds residual narrowing follow-up for missing WIP concepts', () => {
    const question = buildResidualGapFollowUpQuestion({
      missingMustConcepts: ['wip', 'alternate', 'current tree'],
      hints: FIBER_EVALUATION_HINTS.render_phase,
    });

    expect(question).toMatch(/^Ок, это верно\./);
    expect(question).toContain('WIP tree');
  });
});
