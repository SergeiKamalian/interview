import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyInterviewsQuery } from '@entities/interview/api/interviewsApi';
import type { AttemptStatus } from '@shared/api/graphql/generated/graphql';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { Alert, Button, Card, Input, SelectField, Spinner } from '@shared/ui';

const attemptStatusLabels: Record<string, string> = {
  pending: 'Ожидает',
  in_progress: 'В процессе',
  completed: 'Завершено',
  abandoned: 'Прервано',
};

export function AttemptsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AttemptStatus | ''>('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('created_at');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError, error, refetch } = useCompanyInterviewsQuery({
    search: debouncedSearch.trim() || undefined,
    status: status || undefined,
    page,
    pageSize: 20,
    sort,
    sortDirection: 'desc',
  });

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Кандидаты интервью</h2>
        <p className="text-sm text-muted-foreground">
          Все сессии кандидатов с фильтрами по статусу и поиском.
        </p>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Поиск: кандидат, email, роль…"
          />
          <SelectField
            value={status}
            onValueChange={(value) => {
              setStatus(value as AttemptStatus | '');
              setPage(1);
            }}
            placeholder="Все статусы"
            options={[
              { value: '', label: 'Все статусы' },
              { value: 'pending', label: attemptStatusLabels.pending },
              { value: 'in_progress', label: attemptStatusLabels.in_progress },
              { value: 'completed', label: attemptStatusLabels.completed },
              { value: 'abandoned', label: attemptStatusLabels.abandoned },
            ]}
          />
          <SelectField
            value={sort}
            onValueChange={setSort}
            options={[
              { value: 'created_at', label: 'Сортировка: дата' },
              { value: 'overall_score', label: 'Сортировка: score' },
            ]}
          />
          <Button variant="secondary" onClick={() => void refetch()}>
            Обновить
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Загрузка кандидатов…
          </div>
        )}

        {isError && (
          <Alert variant="error" title="Не удалось загрузить кандидатов">
            {'message' in (error as object)
              ? String((error as { message: string }).message)
              : 'Unknown error'}
          </Alert>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Alert variant="info" title="Кандидатов пока нет">
            Создайте интервью или дождитесь, когда кандидаты начнут проходить скрининг.
          </Alert>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-xl border">
              <table className="min-w-full divide-y text-sm">
                <thead className="bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Роль</th>
                    <th className="px-4 py-3 font-medium">Кандидат</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium">Начало</th>
                    <th className="px-4 py-3 font-medium">Завершение</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-card">
                  {items.map((item) => (
                    <tr key={item.attemptId} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          to={`/dashboard/interviews/${item.interviewId}?attemptId=${item.attemptId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.jobRole}
                        </Link>
                        <p className="text-xs text-muted-foreground">{item.interviewTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{item.candidateName}</p>
                        <p className="text-xs text-muted-foreground">{item.candidateEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {attemptStatusLabels[item.status] ?? item.status}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatUnixDate(item.startedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatUnixDate(item.completedAt)}
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">
                        {formatScore(item.overallScore)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Страница {data?.page ?? 1} из {totalPages} · всего {data?.total ?? 0}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Назад
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Вперёд
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
