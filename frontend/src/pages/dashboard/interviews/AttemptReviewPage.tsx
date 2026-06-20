import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMarkAttemptReviewStartedMutation } from '@entities/candidate/api/attemptReviewApi';
import { useInterviewDetailsQuery } from '@entities/interview/api/interviewDetailsApi';
import { useInterviewTranscriptQuery } from '@entities/interview/api/interviewTranscriptApi';
import { useCheckpointResultsByAttemptQuery } from '@entities/evaluation/api/checkpointResultsApi';
import { useAdaptiveCheckpointReviewByAttemptQuery } from '@entities/evaluation/api/adaptiveCheckpointReviewApi';
import { useEvaluateInterviewAttemptMutation } from '@entities/evaluation/api/evaluationApi';
import { useFinalEvaluationByAttemptQuery } from '@entities/evaluation/api/finalEvaluationApi';
import { AdaptiveCheckpointReviewPanel } from '@widgets/checkpoints/AdaptiveCheckpointReviewPanel';
import { CheckpointResultsPanel } from '@widgets/checkpoints/CheckpointResultsPanel';
import { TranscriptPanel } from '@widgets/transcript/TranscriptPanel';
import { AiAssessmentVerdictPanel } from '@features/attempt-review/ui/AiAssessmentVerdictPanel';
import { AttemptQuickActions } from '@features/attempt-review/ui/AttemptQuickActions';
import { DecisionAuditTimeline } from '@features/attempt-review/ui/DecisionAuditTimeline';
import { AttemptTeamNotesPanel } from '@features/attempt-review/ui/AttemptTeamNotesPanel';
import { AttemptShareDialog } from '@features/attempt-review/ui/AttemptShareDialog';
import { CandidateContextPanel } from '@widgets/candidate/CandidateContextPanel';
import {
  Alert,
  Badge,
  Button,
  Card,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { cn } from '@shared/lib/utils';

type FinalEvaluationDisplay = {
  totalScore: number;
  hireRecommendation?: string | null;
  summary?: string | null;
  detailedSummary?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  risks?: string[];
  needsManualReview?: boolean;
  strengthCategory?: string;
  category?: string;
  categoryBreakdown?: Array<{
    categoryKey: string;
    categoryLabel: string;
    scoreNormalized: number;
    weight: number;
    contribution: number;
  }>;
  topicEvaluations?: Array<{
    topic: string;
    score: number;
    weight: number;
    weightedScore: number;
    strengthCategory: string;
  }>;
};

type AdaptiveReview = {
  needsManualReview: boolean;
  redFlags: Array<{
    checkpointKey: string;
    checkpointTitle: string;
    summary: string;
    candidateQuote?: string | null;
    severity: string;
  }>;
  questionGroups: Array<{
    interviewQuestionId: string;
    questionText: string;
    idealAnswer?: string | null;
    needsManualReview: boolean;
    checkpoints: Array<{
      checkpointKey: string;
      checkpointTitle: string;
      status: string;
      scoreAwarded: number;
      maxScore: number;
      rationale?: string | null;
      evidenceSummary?: string | null;
      confidence?: number | null;
      needsManualReview: boolean;
      depthLabel: string;
      coveragePercent: number;
      accuracyPercent: number;
    }>;
  }>;
};

type CheckpointDigest = {
  total: number;
  covered: number;
  partial: number;
  missed: number;
  manualReview: number;
  lowConfidence: number;
  averageCoverage: number;
  averageAccuracy: number;
  strongest: Array<{ title: string; question: string; evidence?: string | null }>;
  weakest: Array<{ title: string; question: string; evidence?: string | null }>;
};

function computeCheckpointInterimScore(review: {
  questionGroups: Array<{
    checkpoints: Array<{ scoreAwarded: number; maxScore: number }>;
  }>;
} | null | undefined): { score: number; maxScore: number } | null {
  if (!review?.questionGroups.length) {
    return null;
  }

  let earned = 0;
  let rawMax = 0;

  for (const group of review.questionGroups) {
    for (const checkpoint of group.checkpoints) {
      earned += checkpoint.scoreAwarded;
      rawMax += checkpoint.maxScore;
    }
  }

  if (rawMax <= 0) {
    return null;
  }

  const scoreOutOfTen = Math.round((earned / rawMax) * 100) / 10;

  return { score: scoreOutOfTen, maxScore: 10 };
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
}

function toPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value <= 1 ? value * 100 : value)));
}

function scoreToPercent(score: number | null | undefined): number | null {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(score * 10)));
}

function recommendationMeta(value?: string | null): {
  label: string;
  badge: 'success' | 'info' | 'warning' | 'destructive' | 'muted';
  decision: string;
  nextStep: string;
} {
  switch (value) {
    case 'strong_invite':
      return {
        label: 'Сильно пригласить',
        badge: 'success',
        decision: 'Сильный сигнал: стоит быстро переводить в следующий этап.',
        nextStep: 'Назначить живое интервью и проверить только отмеченные риски.',
      };
    case 'invite':
      return {
        label: 'Пригласить',
        badge: 'info',
        decision: 'Положительный сигнал: кандидат выглядит релевантно.',
        nextStep: 'Позвать на следующий этап и пройтись по зонам проверки.',
      };
    case 'maybe':
      return {
        label: 'Под вопросом',
        badge: 'warning',
        decision: 'Смешанный сигнал: есть полезные знания, но нужны уточнения.',
        nextStep: 'Проверить риски на живом интервью перед решением.',
      };
    case 'reject':
    case 'strong_reject':
      return {
        label: value === 'strong_reject' ? 'Сильно отказать' : 'Отказать',
        badge: 'destructive',
        decision: 'Слабый сигнал: есть существенные пробелы для текущей роли.',
        nextStep: 'Не тратить много времени, если требования роли не снизятся.',
      };
    default:
      return {
        label: value ? value.replaceAll('_', ' ') : 'Нет рекомендации',
        badge: 'muted',
        decision: 'Решение пока не сформировано.',
        nextStep: 'Сначала дождаться полной ИИ-оценки или проверить вручную.',
      };
  }
}

function attemptStatusLabel(value?: string | null): string {
  switch (value) {
    case 'completed':
      return 'завершено';
    case 'in_progress':
      return 'в процессе';
    case 'abandoned':
      return 'прервано';
    default:
      return value ?? '—';
  }
}

function evaluationStatusLabel(value?: string | null): string {
  switch (value) {
    case 'ready':
      return 'оценка готова';
    case 'evaluation_pending':
      return 'ожидает оценки';
    default:
      return value ?? '—';
  }
}

function scoreTone(percent: number | null): string {
  if (percent === null) {
    return 'bg-muted';
  }

  if (percent >= 80) {
    return 'bg-emerald-500';
  }

  if (percent >= 65) {
    return 'bg-sky-500';
  }

  if (percent >= 50) {
    return 'bg-amber-500';
  }

  return 'bg-destructive';
}

function deriveCheckpointDigest(review: AdaptiveReview | null | undefined): CheckpointDigest {
  const checkpoints =
    review?.questionGroups.flatMap((group) =>
      group.checkpoints.map((checkpoint) => ({
        ...checkpoint,
        question: group.questionText,
      })),
    ) ?? [];

  const total = checkpoints.length;
  const covered = checkpoints.filter((checkpoint) => checkpoint.status === 'covered').length;
  const partial = checkpoints.filter((checkpoint) => checkpoint.status === 'partial').length;
  const missed = checkpoints.filter((checkpoint) => checkpoint.status === 'missed').length;
  const manualReview = checkpoints.filter((checkpoint) => checkpoint.needsManualReview).length;
  const lowConfidence = checkpoints.filter(
    (checkpoint) => checkpoint.confidence !== null && checkpoint.confidence !== undefined && checkpoint.confidence < 0.6,
  ).length;
  const averageCoverage =
    total > 0
      ? Math.round(
          checkpoints.reduce((sum, checkpoint) => sum + checkpoint.coveragePercent, 0) /
            total,
        )
      : 0;
  const averageAccuracy =
    total > 0
      ? Math.round(
          checkpoints.reduce((sum, checkpoint) => sum + checkpoint.accuracyPercent, 0) /
            total,
        )
      : 0;

  const strongest = checkpoints
    .filter((checkpoint) => checkpoint.status === 'covered')
    .sort(
      (left, right) =>
        right.scoreAwarded / Math.max(1, right.maxScore) -
        left.scoreAwarded / Math.max(1, left.maxScore),
    )
    .slice(0, 3)
    .map((checkpoint) => ({
      title: checkpoint.checkpointTitle,
      question: checkpoint.question,
      evidence: checkpoint.evidenceSummary,
    }));

  const weakest = checkpoints
    .filter(
      (checkpoint) =>
        checkpoint.status === 'missed' ||
        checkpoint.status === 'partial' ||
        checkpoint.needsManualReview,
    )
    .sort((left, right) => {
      const statusWeight = (status: string) => (status === 'missed' ? 0 : 1);
      const statusDiff = statusWeight(left.status) - statusWeight(right.status);

      if (statusDiff !== 0) {
        return statusDiff;
      }

      return left.scoreAwarded / Math.max(1, left.maxScore) - right.scoreAwarded / Math.max(1, right.maxScore);
    })
    .slice(0, 4)
    .map((checkpoint) => ({
      title: checkpoint.checkpointTitle,
      question: checkpoint.question,
      evidence: checkpoint.evidenceSummary,
    }));

  return {
    total,
    covered,
    partial,
    missed,
    manualReview,
    lowConfidence,
    averageCoverage,
    averageAccuracy,
    strongest,
    weakest,
  };
}

function compactList(values: Array<string | null | undefined>, fallback: string): string[] {
  const items = values
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());

  return items.length > 0 ? items.slice(0, 4) : [fallback];
}

function SignalMeter({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | null;
  hint?: string;
  tone?: string;
}) {
  const displayValue = value === null ? '—' : `${value}%`;

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {displayValue}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn('h-2 rounded-full', tone ?? scoreTone(value))}
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
    </div>
  );
}

function InsightColumn({
  title,
  description,
  items,
  tone,
}: {
  title: string;
  description: string;
  items: string[];
  tone: 'success' | 'warning' | 'info';
}) {
  const toneClass = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    info: 'border-sky-500/20 bg-sky-500/5',
  }[tone];

  return (
    <Card className={cn('border', toneClass)}>
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-lg border border-border bg-card/70 p-3 text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function AttemptReviewPage() {
  const { interviewId = '', attemptId = '' } = useParams();
  const [evalError, setEvalError] = useState<string | null>(null);
  const [transcriptSearch, setTranscriptSearch] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useInterviewDetailsQuery(
    interviewId,
    { skip: !interviewId },
  );
  const { data: transcript, refetch: refetchTranscript } =
    useInterviewTranscriptQuery(attemptId, { skip: !attemptId });
  const { data: checkpointData, refetch: refetchCheckpoints } =
    useCheckpointResultsByAttemptQuery(attemptId, { skip: !attemptId });
  const { data: adaptiveReview, refetch: refetchAdaptiveReview } =
    useAdaptiveCheckpointReviewByAttemptQuery(attemptId, {
      skip: !attemptId,
    });

  const selectedAttempt = useMemo(
    () => data?.attempts.find((attempt) => attempt.attemptId === attemptId),
    [attemptId, data?.attempts],
  );

  const evaluationReady = selectedAttempt?.evaluationStatus === 'ready';
  const { data: evaluation } = useFinalEvaluationByAttemptQuery(attemptId, {
    skip: !attemptId || !evaluationReady,
  });
  const [evaluateAttempt, { isLoading: isEvaluating }] =
    useEvaluateInterviewAttemptMutation();
  const [markReviewStarted] = useMarkAttemptReviewStartedMutation();

  useEffect(() => {
    if (!attemptId || !selectedAttempt) {
      return;
    }

    void markReviewStarted(attemptId);
  }, [attemptId, markReviewStarted, selectedAttempt?.attemptId]);

  if (!interviewId || !attemptId) {
    return (
      <Alert variant="error" title="Некорректный маршрут">
        Не хватает параметров маршрута.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Загрузка проверки кандидата…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Не удалось загрузить интервью">
        {extractErrorMessage(error, 'Интервью не найдено или доступ запрещён')}
      </Alert>
    );
  }

  if (!selectedAttempt) {
    return (
      <Alert variant="error" title="Попытка не найдена">
        Этот кандидат не найден в выбранном интервью или доступ запрещён.
      </Alert>
    );
  }

  const displayEvaluation: FinalEvaluationDisplay | null = evaluationReady
    ? (evaluation ?? null)
    : null;
  const checkpointInterimScore = computeCheckpointInterimScore(adaptiveReview);
  const displayScore =
    displayEvaluation?.totalScore ??
    selectedAttempt.overallScore ??
    checkpointInterimScore?.score ??
    null;
  const displayScoreMax = 10;
  const showInterimCheckpointScore =
    displayEvaluation == null &&
    selectedAttempt.overallScore == null &&
    checkpointInterimScore != null;
  const displayHireRecommendation =
    displayEvaluation?.hireRecommendation ?? selectedAttempt.hireRecommendation ?? null;
  const displaySummary = displayEvaluation?.summary ?? null;
  const displayNeedsManualReview =
    displayEvaluation?.needsManualReview ?? adaptiveReview?.needsManualReview ?? false;
  const displayCategoryBreakdown = displayEvaluation?.categoryBreakdown ?? [];
  const recommendation = recommendationMeta(displayHireRecommendation);
  const scorePercent = scoreToPercent(displayScore);
  const checkpointDigest = deriveCheckpointDigest(adaptiveReview);
  const categorySignals = displayCategoryBreakdown
    .map((item) => ({
      label: item.categoryLabel,
      percent: toPercent(item.scoreNormalized) ?? 0,
    }))
    .sort((left, right) => right.percent - left.percent);
  const strongCategoryCount = categorySignals.filter((item) => item.percent >= 80).length;
  const watchCategoryCount = categorySignals.filter(
    (item) => item.percent >= 60 && item.percent < 80,
  ).length;
  const riskCategoryCount = categorySignals.filter((item) => item.percent < 60).length;
  const strengths = compactList(
    [
      ...(displayEvaluation?.strengths ?? []),
      ...checkpointDigest.strongest.map((checkpoint) => checkpoint.title),
      ...categorySignals.slice(0, 2).map((item) => `${item.label}: ${item.percent}%`),
    ],
    'Сильные стороны появятся после полной оценки или ручной проверки.',
  );
  const risks = compactList(
    [
      ...(displayEvaluation?.risks ?? []),
      ...(displayEvaluation?.weaknesses ?? []),
      ...(adaptiveReview?.redFlags.map((flag) => `${flag.checkpointTitle}: ${flag.summary}`) ??
        []),
    ],
    'Критичных рисков в данных оценки пока нет.',
  );
  const focusAreas = compactList(
    [
      ...(displayEvaluation?.weaknesses ?? []),
      ...(displayEvaluation?.risks ?? []),
      ...checkpointDigest.weakest.map((checkpoint) => checkpoint.title),
      ...categorySignals.slice(-2).map((item) => `${item.label}: ${item.percent}%`),
    ],
    'Фокус для живого интервью появится после оценки.',
  );
  const lowPriorityAreas = compactList(
    [
      ...(displayEvaluation?.strengths ?? []),
      ...checkpointDigest.strongest.map((checkpoint) => checkpoint.title),
      ...categorySignals.slice(0, 3).map((item) => `${item.label}: ${item.percent}%`),
    ],
    'Пока нет уверенных зон, которые можно пропустить.',
  );
  const strongestEvidence =
    checkpointDigest.strongest.length > 0
      ? checkpointDigest.strongest
      : categorySignals.slice(0, 4).map((item) => ({
          title: item.label,
          question: `Оценка категории: ${item.percent}%`,
          evidence: null,
        }));
  const weakestEvidence =
    checkpointDigest.weakest.length > 0
      ? checkpointDigest.weakest
      : categorySignals
          .slice()
          .sort((left, right) => left.percent - right.percent)
          .slice(0, 4)
          .map((item) => ({
            title: item.label,
            question: `Оценка категории: ${item.percent}%`,
            evidence: null,
          }));
  const needsEvaluation =
    selectedAttempt.status === 'completed' &&
    selectedAttempt.evaluationStatus === 'evaluation_pending';

  const handleRunEvaluation = async () => {
    setEvalError(null);

    try {
      await evaluateAttempt(attemptId).unwrap();
      await Promise.all([
        refetch(),
        refetchTranscript(),
        refetchCheckpoints(),
        refetchAdaptiveReview(),
      ]);
    } catch (mutationError) {
      setEvalError(extractErrorMessage(mutationError, 'Не удалось запустить ИИ-оценку'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to={`/dashboard/interviews/${interviewId}`}
            className="text-sm text-brand-primary hover:underline"
          >
            ← Назад к интервью
          </Link>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            {selectedAttempt.candidateName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedAttempt.candidateEmail} · {data.title} · {data.jobRole}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AttemptShareDialog attemptId={selectedAttempt.attemptId} />
          <AttemptQuickActions
          attemptId={selectedAttempt.attemptId}
          candidateId={selectedAttempt.candidateId}
          candidateName={selectedAttempt.candidateName}
          shortlistStatus={selectedAttempt.shortlistStatus}
          overallScore={displayScore}
          hireRecommendation={displayHireRecommendation}
          summary={displaySummary}
          layout="stack"
          />
        </div>
      </div>

      <CandidateContextPanel
        candidateId={selectedAttempt.candidateId}
        currentAttemptId={attemptId}
        currentInterviewId={interviewId}
      />

      {needsEvaluation && (
        <Alert variant="info" title="ИИ-оценка не запущена">
          <div className="space-y-3">
            <p>
              Интервью завершено, но оценка по критериям ещё не выполнена.
              Запустите ИИ-оценку, чтобы заполнить балл, рекомендацию и детализацию.
            </p>
            <Button
              variant="primary"
              disabled={isEvaluating}
              onClick={() => void handleRunEvaluation()}
            >
              {isEvaluating ? 'Оценка выполняется…' : 'Запустить ИИ-оценку'}
            </Button>
            {evalError && <p className="text-sm text-red-700">{evalError}</p>}
          </div>
        </Alert>
      )}

      {isEvaluating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          ИИ анализирует ответы кандидата — это может занять до минуты…
        </div>
      )}

      <AiAssessmentVerdictPanel
        attemptId={selectedAttempt.attemptId}
        aiAssessmentVerdict={selectedAttempt.aiAssessmentVerdict}
        reviewedAt={selectedAttempt.reviewedAt}
        evaluationReady={evaluationReady}
      />

      <AttemptTeamNotesPanel attemptId={selectedAttempt.attemptId} />

      <DecisionAuditTimeline attemptId={selectedAttempt.attemptId} />

      <section className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={recommendation.badge}>{recommendation.label}</Badge>
              {displayNeedsManualReview && (
                <Badge variant="warning">Нужна ручная проверка</Badge>
              )}
              {showInterimCheckpointScore && (
                <Badge variant="outline">Промежуточный балл</Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Краткое решение по кандидату
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-foreground">
                {recommendation.decision}
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {displaySummary ??
                  displayEvaluation?.detailedSummary ??
                  'Короткое резюме появится после финальной ИИ-оценки.'}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Следующее действие
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {recommendation.nextStep}
              </p>
            </div>
          </div>
          <div className="border-t border-border bg-muted/20 p-5 md:p-6 lg:border-l lg:border-t-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Итоговая оценка</p>
                    <p className="mt-1 text-4xl font-semibold tabular-nums text-foreground">
                      {scorePercent === null ? '—' : scorePercent}
                      <span className="text-base text-muted-foreground">/100</span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{formatScore(displayScore)} / {formatScore(displayScoreMax)}</p>
                    <p>{evaluationStatusLabel(selectedAttempt.evaluationStatus)}</p>
                  </div>
                </div>
                <div className="mt-4 h-3 rounded-full bg-muted">
                  <div
                    className={cn('h-3 rounded-full', scoreTone(scorePercent))}
                    style={{ width: `${scorePercent ?? 0}%` }}
                  />
                </div>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-3">
                  <dt className="text-muted-foreground">Завершено</dt>
                  <dd className="font-medium text-foreground">
                    {formatUnixDate(selectedAttempt.completedAt)}
                  </dd>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <dt className="text-muted-foreground">Попытка</dt>
                  <dd className="font-medium text-foreground">
                    {attemptStatusLabel(selectedAttempt.status)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <InsightColumn
          title="Плюсы"
          description="На что можно опираться при решении."
          items={strengths}
          tone="success"
        />
        <InsightColumn
          title="Минусы и риски"
          description="Что может повлиять на решение о найме."
          items={risks}
          tone="warning"
        />
        <InsightColumn
          title="Проверить на живом интервью"
          description="Лучшие вопросы для живого этапа."
          items={focusAreas}
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card header="Сигналы по навыкам">
          <div className="space-y-3">
            {displayCategoryBreakdown.length > 0 ? (
              displayCategoryBreakdown.map((item) => {
                const percent = toPercent(item.scoreNormalized);

                return (
                  <SignalMeter
                    key={item.categoryKey}
                    label={item.categoryLabel}
                    value={percent}
                    hint={`Вес ${item.weight} · вклад ${item.contribution.toFixed(1)}`}
                  />
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Детализация появится после полной оценки.
              </p>
            )}
          </div>
        </Card>

        <Card header="Фокус проверки">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl border border-border bg-emerald-500/5 p-3">
                <p className="text-lg font-semibold text-foreground">
                  {checkpointDigest.total > 0 ? checkpointDigest.covered : strongCategoryCount}
                </p>
                <p className="text-xs text-muted-foreground">сильные</p>
              </div>
              <div className="rounded-xl border border-border bg-amber-500/5 p-3">
                <p className="text-lg font-semibold text-foreground">
                  {checkpointDigest.total > 0 ? checkpointDigest.partial : watchCategoryCount}
                </p>
                <p className="text-xs text-muted-foreground">проверить</p>
              </div>
              <div className="rounded-xl border border-border bg-destructive/5 p-3">
                <p className="text-lg font-semibold text-foreground">
                  {checkpointDigest.total > 0 ? checkpointDigest.missed : riskCategoryCount}
                </p>
                <p className="text-xs text-muted-foreground">риск</p>
              </div>
            </div>
            <SignalMeter
              label="Покрытие"
              value={
                checkpointDigest.total > 0
                  ? checkpointDigest.averageCoverage
                  : scorePercent
              }
              hint="Насколько кандидат затронул ожидаемые критерии."
              tone="bg-sky-500"
            />
            <SignalMeter
              label="Точность"
              value={
                checkpointDigest.total > 0
                  ? checkpointDigest.averageAccuracy
                  : scorePercent
              }
              hint="Насколько объяснение было корректным."
              tone="bg-emerald-500"
            />
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-sm font-medium text-foreground">Где не тратить время</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {lowPriorityAreas.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Решение</TabsTrigger>
          <TabsTrigger value="evidence">Доказательства</TabsTrigger>
          <TabsTrigger value="transcript">Расшифровка</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card header="Почему такой вывод">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="font-medium text-foreground">Сильные доказательства</h4>
                <div className="mt-3 space-y-2">
                  {strongestEvidence.length > 0 ? (
                    strongestEvidence.map((checkpoint) => (
                      <div key={checkpoint.title} className="rounded-lg border border-border bg-muted/20 p-3">
                        <p className="text-sm font-medium text-foreground">{checkpoint.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{checkpoint.question}</p>
                        {checkpoint.evidence && (
                          <p className="mt-2 text-xs italic text-muted-foreground">
                            “{checkpoint.evidence}”
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Сильные доказательства пока не выделены.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Слабые доказательства</h4>
                <div className="mt-3 space-y-2">
                  {weakestEvidence.length > 0 ? (
                    weakestEvidence.map((checkpoint) => (
                      <div key={checkpoint.title} className="rounded-lg border border-border bg-amber-500/5 p-3">
                        <p className="text-sm font-medium text-foreground">{checkpoint.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{checkpoint.question}</p>
                        {checkpoint.evidence && (
                          <p className="mt-2 text-xs italic text-muted-foreground">
                            “{checkpoint.evidence}”
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Слабые доказательства пока не выделены.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          {adaptiveReview && <AdaptiveCheckpointReviewPanel review={adaptiveReview} />}
          <CheckpointResultsPanel
            questionGroups={checkpointData?.questionGroups ?? []}
            onCheckpointClick={(hint) => setTranscriptSearch(hint)}
          />
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          <TranscriptPanel
            segments={transcript?.segments ?? []}
            onSegmentClick={() => undefined}
          />
          {transcriptSearch && (
            <p className="text-xs text-muted-foreground">
              Подсказка по доказательству: {transcriptSearch} — используйте поиск в расшифровке.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
