import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyCandidatesQuery } from '@entities/candidate/api/candidatesApi';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { Alert, Badge, Button, Card, CheckboxField, Input, SelectField, Spinner } from '@shared/ui';

export function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('avg_score');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError, error, refetch } = useCompanyCandidatesQuery({
    search: debouncedSearch.trim() || undefined,
    shortlistedOnly: shortlistedOnly || undefined,
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
        <h2 className="text-xl font-semibold text-slate-900">Candidates</h2>
        <p className="text-sm text-slate-500">
          Агрегированные метрики кандидатов, shortlist и переход к отчётам.
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
            placeholder="Поиск по имени или email"
          />
          <CheckboxField
            label="Только shortlist"
            checked={shortlistedOnly}
            onCheckedChange={(checked) => {
              setShortlistedOnly(checked);
              setPage(1);
            }}
          />
          <SelectField
            value={sort}
            onValueChange={setSort}
            options={[
              { value: 'avg_score', label: 'Сортировка: avg score' },
              { value: 'last_interview_date', label: 'Сортировка: last interview' },
            ]}
          />
          <Button variant="secondary" onClick={() => void refetch()}>
            Обновить
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
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
            После завершения интервью кандидаты появятся здесь.
          </Alert>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Interviews</th>
                    <th className="px-4 py-3 font-medium">Avg score</th>
                    <th className="px-4 py-3 font-medium">Last interview</th>
                    <th className="px-4 py-3 font-medium">Shortlist</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item) => (
                    <tr key={item.candidateId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/dashboard/candidates/${item.candidateId}/report`}
                          className="font-medium text-brand-primary hover:underline"
                        >
                          {item.fullName}
                        </Link>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.interviewsCount}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatScore(item.avgScore)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatUnixDate(item.lastInterviewDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.shortlistStatus === 'shortlisted' ? 'success' : 'muted'
                          }
                        >
                          {item.shortlistStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/dashboard/candidates/${item.candidateId}/report`}
                          className="text-sm text-brand-primary hover:underline"
                        >
                          Report
                        </Link>
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
