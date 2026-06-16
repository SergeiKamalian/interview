import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useInterviewDetailsQuery } from '@entities/interview/api/interviewDetailsApi';
import { useInterviewTranscriptQuery } from '@entities/interview/api/interviewTranscriptApi';
import { useCheckpointResultsByAttemptQuery } from '@entities/evaluation/api/checkpointResultsApi';
import { useAdaptiveCheckpointReviewByAttemptQuery } from '@entities/evaluation/api/adaptiveCheckpointReviewApi';
import { useEvaluateInterviewAttemptMutation } from '@entities/evaluation/api/evaluationApi';
import { useFinalEvaluationByAttemptQuery } from '@entities/evaluation/api/finalEvaluationApi';
import { CheckpointResultsPanel } from '@widgets/checkpoints/CheckpointResultsPanel';
import { AdaptiveCheckpointReviewPanel } from '@widgets/checkpoints/AdaptiveCheckpointReviewPanel';
import { TranscriptPanel } from '@widgets/transcript/TranscriptPanel';
import { OverallScoreCard } from '@widgets/score/OverallScoreCard';
import { CategoryBreakdownChart } from '@widgets/score/CategoryBreakdownChart';
import { RecommendationCard } from '@widgets/score/RecommendationCard';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { Alert, Button, Card, Spinner } from '@shared/ui';

type FinalEvaluationDisplay = {
  totalScore: number;
  hireRecommendation?: string | null;
  summary?: string | null;
  needsManualReview?: boolean;
  categoryBreakdown?: Array<{
    categoryKey: string;
    categoryLabel: string;
    scoreNormalized: number;
    weight: number;
    contribution: number;
  }>;
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

export function InterviewDetailsPage() {
  const { interviewId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [evalError, setEvalError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useInterviewDetailsQuery(
    interviewId,
    { skip: !interviewId },
  );

  const selectedAttemptId =
    searchParams.get('attemptId') ?? data?.attempts[0]?.attemptId ?? '';

  const [manualReviewOnly, setManualReviewOnly] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState<string | null>(null);

  const { data: transcript, refetch: refetchTranscript } = useInterviewTranscriptQuery(
    selectedAttemptId,
    { skip: !selectedAttemptId },
  );
  const { data: checkpointData, refetch: refetchCheckpoints } =
    useCheckpointResultsByAttemptQuery(selectedAttemptId, { skip: !selectedAttemptId });
  const { data: adaptiveReview, refetch: refetchAdaptiveReview } =
    useAdaptiveCheckpointReviewByAttemptQuery(selectedAttemptId, {
      skip: !selectedAttemptId,
    });

  const selectedAttempt = useMemo(
    () => data?.attempts.find((attempt) => attempt.attemptId === selectedAttemptId),
    [data?.attempts, selectedAttemptId],
  );

  const evaluationReady = selectedAttempt?.evaluationStatus === 'ready';

  const { data: evaluation } = useFinalEvaluationByAttemptQuery(selectedAttemptId, {
    skip: !selectedAttemptId || !evaluationReady,
  });

  const [evaluateAttempt, { isLoading: isEvaluating }] =
    useEvaluateInterviewAttemptMutation();

  const needsEvaluation =
    selectedAttempt?.status === 'completed' &&
    selectedAttempt.evaluationStatus === 'evaluation_pending';

  const handleRunEvaluation = async () => {
    if (!selectedAttemptId) {
      return;
    }

    setEvalError(null);

    try {
      await evaluateAttempt(selectedAttemptId).unwrap();
      await Promise.all([
        refetch(),
        refetchTranscript(),
        refetchCheckpoints(),
        refetchAdaptiveReview(),
      ]);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : typeof mutationError === 'object' &&
              mutationError !== null &&
              'message' in mutationError &&
              typeof mutationError.message === 'string'
            ? mutationError.message
            : 'Не удалось запустить AI-оценку';

      setEvalError(message);
    }
  };

  if (!interviewId) {
    return <Alert variant="error" title="Invalid route">Interview id is missing.</Alert>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner />
        Загрузка деталей интервью…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Не удалось загрузить интервью">
        {'message' in (error as object)
          ? String((error as { message: string }).message)
          : 'Interview not found or access denied'}
      </Alert>
    );
  }

  const displayEvaluation: FinalEvaluationDisplay | null = evaluationReady
    ? (evaluation ?? null)
    : null;

  const checkpointInterimScore = computeCheckpointInterimScore(adaptiveReview);

  const displayScore =
    displayEvaluation?.totalScore ??
    selectedAttempt?.overallScore ??
    checkpointInterimScore?.score ??
    null;

  const displayScoreMax = 10;

  const showInterimCheckpointScore =
    displayEvaluation == null &&
    selectedAttempt?.overallScore == null &&
    checkpointInterimScore != null;

  const displayHireRecommendation =
    displayEvaluation?.hireRecommendation ?? selectedAttempt?.hireRecommendation ?? null;

  const displaySummary = displayEvaluation?.summary ?? null;

  const displayNeedsManualReview =
    displayEvaluation?.needsManualReview ?? adaptiveReview?.needsManualReview ?? false;

  const displayCategoryBreakdown = displayEvaluation?.categoryBreakdown ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{data.title}</h2>
          <p className="text-sm text-slate-500">
            {data.jobRole} · {data.questionCount} вопросов · создано{' '}
            {formatUnixDate(data.createdAt)}
          </p>
        </div>
        <Button variant="secondary" onClick={() => void refetch()}>
          Обновить
        </Button>
      </div>

      {needsEvaluation && (
        <Alert variant="info" title="AI-оценка не запущена">
          <div className="space-y-3">
            <p>
              Интервью завершено, но оценка по checkpoints ещё не выполнена. Нажмите
              кнопку ниже — это вызовет AI и заполнит score, recommendation и breakdown.
            </p>
            <Button
              variant="primary"
              disabled={isEvaluating}
              onClick={() => void handleRunEvaluation()}
            >
              {isEvaluating ? 'Оценка выполняется…' : 'Запустить AI-оценку'}
            </Button>
            {evalError && <p className="text-sm text-red-700">{evalError}</p>}
          </div>
        </Alert>
      )}

      {isEvaluating && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Spinner />
          AI анализирует ответы кандидата — это может занять до минуты…
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card header="Interview meta">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-900">{data.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Public link</dt>
              <dd>
                <a href={data.publicUrl} className="text-brand-primary hover:underline">
                  {data.publicUrl}
                </a>
              </dd>
            </div>
          </dl>
        </Card>

        <Card header="Selected candidate" className="lg:col-span-2">
          {selectedAttempt ? (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{selectedAttempt.candidateName}</p>
                <p className="text-slate-500">{selectedAttempt.candidateEmail}</p>
              </div>
              <div className="text-right text-slate-600">
                <p>Status: {selectedAttempt.status}</p>
                <p>Score: {formatScore(displayScore)}</p>
                {showInterimCheckpointScore && (
                  <p className="text-xs text-slate-500">
                    Промежуточно по checkpoints ({formatScore(displayScore)}/
                    {formatScore(displayScoreMax)})
                  </p>
                )}
              </div>
              <Link
                to={`/dashboard/candidates/${selectedAttempt.candidateId}/report`}
                className="text-brand-primary hover:underline"
              >
                Candidate report →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Попыток пока нет.</p>
          )}
        </Card>
      </div>

      <Card header="Attempts timeline">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={manualReviewOnly}
              onChange={(event) => setManualReviewOnly(event.target.checked)}
            />
            Только с ручной проверкой
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.attempts
            .filter((attempt) => {
              if (!manualReviewOnly) {
                return true;
              }

              if (attempt.attemptId === selectedAttemptId) {
                return adaptiveReview?.needsManualReview ?? false;
              }

              return false;
            })
            .map((attempt) => (
            <button
              key={attempt.attemptId}
              type="button"
              className={[
                'rounded-full border px-3 py-1 text-sm',
                attempt.attemptId === selectedAttemptId
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50',
              ].join(' ')}
              onClick={() =>
                setSearchParams((params) => {
                  params.set('attemptId', attempt.attemptId);
                  return params;
                })
              }
            >
              {attempt.candidateName} · {attempt.status}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <OverallScoreCard
          score={displayScore}
          maxScore={displayScoreMax}
          loading={isEvaluating}
          interim={showInterimCheckpointScore}
        />
        <RecommendationCard
          hireRecommendation={displayHireRecommendation}
          summary={displaySummary}
          needsManualReview={displayNeedsManualReview}
          loading={isEvaluating}
        />
        <CategoryBreakdownChart items={displayCategoryBreakdown} />
      </div>

      {selectedAttemptId && adaptiveReview && (
        <AdaptiveCheckpointReviewPanel review={adaptiveReview} />
      )}

      {selectedAttemptId && (
        <div className="grid gap-4 xl:grid-cols-2">
          <TranscriptPanel
            segments={transcript?.segments ?? []}
            onSegmentClick={() => undefined}
          />
          <CheckpointResultsPanel
            questionGroups={checkpointData?.questionGroups ?? []}
            onCheckpointClick={(hint) => setTranscriptSearch(hint)}
          />
        </div>
      )}

      {transcriptSearch && (
        <p className="text-xs text-slate-500">
          Evidence hint: {transcriptSearch} — используйте поиск в transcript panel.
        </p>
      )}
    </div>
  );
}
