import { useAiCostAnalyticsQuery } from '@entities/analytics/api/aiCostApi';
import { formatUsd } from '@shared/lib/format';
import { Alert, Card, Spinner } from '@shared/ui';

export function AiCostAnalyticsPage() {
  const { data, isLoading, isError, error } = useAiCostAnalyticsQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner />
        Загрузка AI cost analytics…
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="error" title="Не удалось загрузить cost analytics">
        {'message' in (error as object)
          ? String((error as { message: string }).message)
          : 'Unknown error'}
      </Alert>
    );
  }

  if (!data || data.kpi.totalRequests === 0) {
    return (
      <Alert variant="info" title="AI usage пока пуст">
        После первых AI-оценок здесь появятся расходы по моделям и интервью.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card header="Total cost (USD)">
          <p className="text-2xl font-semibold text-slate-900">
            ${formatUsd(data.kpi.totalCostUsd)}
          </p>
        </Card>
        <Card header="Cost / interview">
          <p className="text-2xl font-semibold text-slate-900">
            ${formatUsd(data.kpi.costPerInterview)}
          </p>
        </Card>
        <Card header="Cost / candidate">
          <p className="text-2xl font-semibold text-slate-900">
            ${formatUsd(data.kpi.costPerCandidate)}
          </p>
        </Card>
        <Card header="Requests">
          <p className="text-2xl font-semibold text-slate-900">{data.kpi.totalRequests}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card header="Tokens by model">
          <div className="space-y-2 text-sm">
            {data.byModel.map((row) => (
              <div key={row.model} className="flex justify-between gap-2">
                <span className="font-medium">{row.model}</span>
                <span className="text-slate-600">
                  ${formatUsd(row.totalCostUsd)} · {row.promptTokens + row.completionTokens} tok
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card header="Top expensive interviews">
          <div className="space-y-2 text-sm">
            {data.topExpensiveInterviews.map((row) => (
              <div key={row.interviewAttemptId} className="flex justify-between gap-2">
                <span>{row.interviewTitle ?? `Attempt ${row.interviewAttemptId}`}</span>
                <span className="text-slate-600">
                  ${formatUsd(row.totalCostUsd)}
                  {row.latencyMs ? ` · ${row.latencyMs}ms` : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
