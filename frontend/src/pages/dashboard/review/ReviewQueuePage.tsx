import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyReviewQueueQuery } from '@entities/candidate/api/reviewQueueApi';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { Alert, Badge, Button, Card, CheckboxField, Input, SelectField, Spinner } from '@shared/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';

const evaluationStatusOptions = [
  { value: 'all', label: 'Все оценки' },
  { value: 'ready', label: 'Оценка готова' },
  { value: 'evaluation_pending', label: 'Оценка ожидает запуска' },
];

const sortOptions = [
  { value: 'completed_at', label: 'Сначала новые' },
  { value: 'score', label: 'Сначала сильные' },
];

function evaluationStatusLabel(status: string) {
  if (status === 'ready') {
    return 'Готова';
  }

  if (status === 'evaluation_pending') {
    return 'Нужна AI-оценка';
  }

  return status;
}

function recommendationLabel(value: string | null | undefined) {
  if (!value) {
    return '—';
  }

  return value.replaceAll('_', ' ');
}

export function ReviewQueuePage() {
  const [search, setSearch] = useState('');
  const [evaluationStatus, setEvaluationStatus] = useState('all');
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [manualReviewOnly, setManualReviewOnly] = useState(false);
  const [sort, setSort] = useState('completed_at');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      evaluationStatus:
        evaluationStatus === 'all' ? undefined : evaluationStatus,
      shortlistedOnly: shortlistedOnly || undefined,
      manualReviewOnly: manualReviewOnly || undefined,
      page,
      pageSize: 20,
      sort,
      sortDirection: 'desc',
    }),
    [
      debouncedSearch,
      evaluationStatus,
      manualReviewOnly,
      page,
      shortlistedOnly,
      sort,
    ],
  );

  const { data, isLoading, isError, error, refetch } =
    useCompanyReviewQueueQuery(filters);

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review queue</h2>
          <p className="text-sm text-muted-foreground">
            Завершённые интервью, которые компания должна посмотреть после прохождения.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void refetch()}>
          Обновить
        </Button>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Кандидат, email или интервью"
          />
          <SelectField
            value={evaluationStatus}
            onValueChange={(value) => {
              setEvaluationStatus(value);
              setPage(1);
            }}
            options={evaluationStatusOptions}
          />
          <SelectField
            value={sort}
            onValueChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            options={sortOptions}
          />
          <CheckboxField
            label="Только shortlist"
            checked={shortlistedOnly}
            onCheckedChange={(checked) => {
              setShortlistedOnly(checked);
              setPage(1);
            }}
          />
          <CheckboxField
            label="Требует ручной проверки"
            checked={manualReviewOnly}
            onCheckedChange={(checked) => {
              setManualReviewOnly(checked);
              setPage(1);
            }}
          />
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Загрузка review queue…
          </div>
        )}

        {isError && (
          <Alert variant="error" title="Не удалось загрузить review queue">
            {'message' in (error as object)
              ? String((error as { message: string }).message)
              : 'Unknown error'}
          </Alert>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Alert variant="info" title="Очередь пустая">
            Завершённые интервью появятся здесь после прохождения кандидатами.
          </Alert>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className="rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Interview</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Evaluation</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Shortlist</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.attemptId}>
                      <TableCell>
                        <Link
                          to={`/dashboard/candidates/${item.candidateId}/report`}
                          className="font-medium text-brand-primary hover:underline"
                        >
                          {item.candidateName}
                        </Link>
                        <p className="text-xs text-muted-foreground">{item.candidateEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/dashboard/interviews/${item.interviewId}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {item.interviewTitle}
                        </Link>
                        <p className="text-xs text-muted-foreground">{item.jobRole}</p>
                      </TableCell>
                      <TableCell>{formatUnixDate(item.completedAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant={
                              item.evaluationStatus === 'ready' ? 'success' : 'warning'
                            }
                          >
                            {evaluationStatusLabel(item.evaluationStatus)}
                          </Badge>
                          {item.needsManualReview && (
                            <Badge variant="destructive">Manual review</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatScore(item.totalScore)}
                      </TableCell>
                      <TableCell>{recommendationLabel(item.hireRecommendation)}</TableCell>
                      <TableCell>
                        {item.achievedLevel ? (
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary">{item.achievedLevel}</Badge>
                            {item.achievedLevelMethod === 'estimate' && (
                              <Badge variant="outline">estimate</Badge>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.shortlistStatus === 'shortlisted'
                              ? 'success'
                              : 'muted'
                          }
                        >
                          {item.shortlistStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/dashboard/candidates/${item.candidateId}/report`}
                            className="text-sm text-brand-primary hover:underline"
                          >
                            Report
                          </Link>
                          <Link
                            to={`/dashboard/interviews/${item.interviewId}/attempts/${item.attemptId}/review`}
                            className="text-sm text-brand-primary hover:underline"
                          >
                            Details
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
