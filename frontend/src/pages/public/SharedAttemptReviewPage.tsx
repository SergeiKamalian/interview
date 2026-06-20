import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchSharedAttemptReview,
  type SharedAttemptReviewSummary,
} from '@entities/candidate/api/attemptSharePublicApi';
import { HireRecommendationBadge } from '@entities/candidate/ui/HireRecommendationBadge';
import { Alert, Badge, Card, Spinner } from '@shared/ui';
import { formatScore, formatUnixDate } from '@shared/lib/format';

function InsightList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  const values = items.length > 0 ? items : [emptyLabel];

  return (
    <Card className="border border-border bg-card/80 p-4">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {values.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function SharedAttemptReviewPage() {
  const { token = '' } = useParams();
  const [data, setData] = useState<SharedAttemptReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Ссылка недействительна');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void fetchSharedAttemptReview(token)
      .then((summary) => {
        if (!cancelled) {
          setData(summary);
          setError(null);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Ссылка недействительна или отозвана',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Загрузка обзора кандидата…
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="error" title="Ссылка недоступна">
        {error ?? 'Ссылка недействительна, отозвана или срок действия истёк.'}
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Shared candidate review
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          {data.candidateName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.interviewTitle} · {data.jobRole} · {data.interviewLevel}
        </p>
        {data.completedAt ? (
          <p className="text-xs text-muted-foreground">
            Завершено {formatUnixDate(data.completedAt)}
          </p>
        ) : null}
      </div>

      <Card className="overflow-hidden border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <HireRecommendationBadge value={data.hireRecommendation} />
          {data.needsManualReview ? (
            <Badge variant="warning">Нужна ручная проверка</Badge>
          ) : null}
          {data.achievedLevel ? (
            <Badge variant="outline">Уровень: {data.achievedLevel}</Badge>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Summary
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {data.summary?.trim() ||
                'Короткое резюме появится после финальной ИИ-оценки.'}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Балл
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {data.totalScore != null ? formatScore(data.totalScore) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">из 10</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <InsightList
          title="Сильные стороны"
          items={data.strengths}
          emptyLabel="Сильные стороны пока не указаны."
        />
        <InsightList
          title="Слабые стороны"
          items={data.weaknesses}
          emptyLabel="Слабые стороны пока не указаны."
        />
        <InsightList
          title="Риски"
          items={data.risks}
          emptyLabel="Критичных рисков не указано."
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Read-only обзор без транскрипта. Для полного dashboard-обзора нужен
        доступ к компании.
      </p>
    </div>
  );
}
