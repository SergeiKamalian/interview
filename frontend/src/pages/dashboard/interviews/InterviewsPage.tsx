import { useState } from 'react';

import { useCompanyInterviewSummariesQuery } from '@entities/interview/api/interviewsApi';
import {
  applyMockInterviewSummariesFilters,
  computeMockInterviewSummariesFacets,
  DEFAULT_INTERVIEW_SUMMARIES_FILTERS,
  hasActiveInterviewListFilters,
  toInterviewSummariesQueryFilters,
} from '@entities/interview/lib/interviewSummariesFilters';
import { env } from '@shared/config/env';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { getDashboardMockInterviewSummaries } from '@shared/mocks/dashboard-overview.mock';
import { Alert, Card, Spinner } from '@shared/ui';
import { Button } from '@shared/ui/button';
import { InterviewSummariesFiltersBar } from '@widgets/dashboard/InterviewSummariesFiltersBar';
import {
  InterviewSummariesActiveFilterTags,
  InterviewSummariesQuickFilters,
  InterviewSummariesSummaryStrip,
} from '@widgets/dashboard/InterviewSummariesPageChrome';
import { InterviewSummariesTable } from '@widgets/dashboard/InterviewSummariesTable';
import { CreateInterviewStartButton } from '@widgets/dashboard/CreateInterviewStartButton';

export function InterviewsPage() {
  const [filters, setFilters] = useState(DEFAULT_INTERVIEW_SUMMARIES_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 300);
  const useMock = env.dashboardMock;

  const queryFilters = toInterviewSummariesQueryFilters({
    ...filters,
    search: debouncedSearch,
  });

  const { data, isLoading, isError, error, refetch } = useCompanyInterviewSummariesQuery(
    queryFilters,
    { skip: useMock },
  );

  const allMockItems = getDashboardMockInterviewSummaries();
  const mockFilteredItems = applyMockInterviewSummariesFilters(allMockItems, {
    ...filters,
    search: debouncedSearch,
  });
  const mockPageSize = filters.pageSize ?? 20;
  const mockPage = filters.page ?? 1;
  const mockSliceStart = (mockPage - 1) * mockPageSize;

  const items = useMock
    ? mockFilteredItems.slice(mockSliceStart, mockSliceStart + mockPageSize)
    : (data?.items ?? []);
  const filteredTotal = useMock ? mockFilteredItems.length : (data?.total ?? 0);
  const facets = useMock
    ? computeMockInterviewSummariesFacets(allMockItems)
    : (data?.facets ?? {
        total: 0,
        active: 0,
        draft: 0,
        archived: 0,
        withAttempts: 0,
      });
  const pageSize = useMock ? mockPageSize : (data?.pageSize ?? mockPageSize);
  const page = useMock ? mockPage : (data?.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const loading = useMock ? false : isLoading;
  const hasFilters = hasActiveInterviewListFilters({
    ...filters,
    search: debouncedSearch,
  });
  const isEmptyCompany = facets.total === 0;
  const isFilteredEmpty = !loading && !isError && items.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Интервью</h2>
          <p className="text-sm text-muted-foreground">
            Каталог скринингов компании — поиск, фильтры и управление списком.
          </p>
        </div>
        <CreateInterviewStartButton />
      </div>

      {!loading && !isError && !isEmptyCompany && (
        <div className="space-y-3">
          <InterviewSummariesSummaryStrip
            facets={facets}
            filteredTotal={filteredTotal}
            filters={{ ...filters, search: debouncedSearch }}
          />
          <InterviewSummariesQuickFilters
            facets={facets}
            filters={filters}
            onChange={setFilters}
          />
        </div>
      )}

      <Card>
        <div className="mb-4 space-y-3">
          <InterviewSummariesFiltersBar
            filters={filters}
            onChange={setFilters}
            onRefresh={() => void refetch()}
          />
          <InterviewSummariesActiveFilterTags filters={filters} onChange={setFilters} />
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Загрузка интервью…
          </div>
        )}

        {!useMock && isError && (
          <Alert variant="error" title="Не удалось загрузить интервью">
            {'message' in (error as object)
              ? String((error as { message: string }).message)
              : 'Unknown error'}
          </Alert>
        )}

        {isFilteredEmpty && isEmptyCompany && (
          <Alert variant="info" title="Интервью пока нет">
            <p className="mb-3">
              Создайте первое интервью и отправьте ссылку кандидатам на прохождение
              AI-скрининга.
            </p>
            <CreateInterviewStartButton size="sm" />
          </Alert>
        )}

        {isFilteredEmpty && !isEmptyCompany && hasFilters && (
          <Alert variant="info" title="По этим фильтрам ничего не найдено">
            <p className="mb-3">Попробуйте изменить условия или сбросить фильтры.</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setFilters({
                  ...DEFAULT_INTERVIEW_SUMMARIES_FILTERS,
                  pageSize: filters.pageSize,
                })
              }
            >
              Сбросить фильтры
            </Button>
          </Alert>
        )}

        {isFilteredEmpty && !isEmptyCompany && !hasFilters && (
          <Alert variant="info" title="Список пуст">
            Интервью в компании есть, но текущая страница не содержит записей.
          </Alert>
        )}

        {!loading && !isError && items.length > 0 && (
          <>
            <InterviewSummariesTable items={items} containerQuery="@container/main" />
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Страница {page} из {totalPages}
                {hasFilters ? ` · найдено ${filteredTotal}` : ` · всего ${facets.total}`}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: Math.max(1, (current.page ?? 1) - 1),
                    }))
                  }
                >
                  Назад
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: (current.page ?? 1) + 1,
                    }))
                  }
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
