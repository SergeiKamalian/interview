import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyInterviewsQuery } from '@entities/interview/api/interviewsApi';
import type { AttemptStatus } from '@shared/api/graphql/generated/graphql';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { Alert, Button, Card, Input, SelectField, Spinner } from '@shared/ui';

export function InterviewsPage() {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Interviews</h2>
          <p className="text-sm text-slate-500">
            Список попыток интервью с фильтрами и пагинацией.
          </p>
        </div>
        <Link to="/dashboard/interviews/create">
          <Button variant="primary">Create Interview</Button>
        </Link>
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
              { value: 'pending', label: 'pending' },
              { value: 'in_progress', label: 'in_progress' },
              { value: 'completed', label: 'completed' },
              { value: 'abandoned', label: 'abandoned' },
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
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner />
            Загрузка интервью…
          </div>
        )}

        {isError && (
          <Alert variant="error" title="Не удалось загрузить интервью">
            {'message' in (error as object)
              ? String((error as { message: string }).message)
              : 'Unknown error'}
          </Alert>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Alert variant="info" title="Интервью пока нет">
            Создайте первое интервью или дождитесь попыток кандидатов.
          </Alert>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Started</th>
                    <th className="px-4 py-3 font-medium">Completed</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item) => (
                    <tr key={item.attemptId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/dashboard/interviews/${item.interviewId}?attemptId=${item.attemptId}`}
                          className="font-medium text-brand-primary hover:underline"
                        >
                          {item.jobRole}
                        </Link>
                        <p className="text-xs text-slate-500">{item.interviewTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-900">{item.candidateName}</p>
                        <p className="text-xs text-slate-500">{item.candidateEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.status}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatUnixDate(item.startedAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatUnixDate(item.completedAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatScore(item.overallScore)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
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
