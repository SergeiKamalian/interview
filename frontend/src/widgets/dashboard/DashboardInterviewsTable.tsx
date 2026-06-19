import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
} from 'lucide-react';

import { useCompanyInterviewSummariesQuery } from '@entities/interview/api/interviewsApi';
import {
  applyMockInterviewSummariesFilters,
  DEFAULT_INTERVIEW_SUMMARIES_FILTERS,
  isDefaultInterviewSummariesFilters,
  toInterviewSummariesQueryFilters,
} from '@entities/interview/lib/interviewSummariesFilters';
import type { CompanyInterviewSummaryItem } from '@entities/interview/model/interview.types';
import { env } from '@shared/config/env';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { getDashboardMockInterviewSummaries } from '@shared/mocks/dashboard-overview.mock';
import { Button } from '@shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Skeleton } from '@shared/ui/skeleton';
import { InterviewSummariesFiltersBar } from '@widgets/dashboard/InterviewSummariesFiltersBar';
import { InterviewSummariesTable } from '@widgets/dashboard/InterviewSummariesTable';
import { CreateInterviewStartButton } from '@widgets/dashboard/CreateInterviewStartButton';

const DASHBOARD_TABLE_FILTERS: typeof DEFAULT_INTERVIEW_SUMMARIES_FILTERS = {
  ...DEFAULT_INTERVIEW_SUMMARIES_FILTERS,
  pageSize: 10,
};

type DashboardInterviewsTableProps = {
  interviews?: CompanyInterviewSummaryItem[];
  total?: number;
  activeTotal?: number;
  isLoading?: boolean;
  isError?: boolean;
};

export function DashboardInterviewsTable({
  interviews: interviewsProp,
  total: totalProp,
  activeTotal,
  isLoading: isLoadingProp,
  isError: isErrorProp,
}: DashboardInterviewsTableProps = {}) {
  const [filters, setFilters] = useState(DASHBOARD_TABLE_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 300);
  const useMock = env.dashboardMock;
  const filtersActive = !isDefaultInterviewSummariesFilters(filters);
  const useOverviewData =
    interviewsProp !== undefined && !filtersActive && !useMock;

  const queryFilters = toInterviewSummariesQueryFilters({
    ...filters,
    search: debouncedSearch,
  });

  const { data, isLoading, isError, refetch } = useCompanyInterviewSummariesQuery(
    queryFilters,
    { skip: useOverviewData || useMock },
  );

  const mockItems = applyMockInterviewSummariesFilters(
    getDashboardMockInterviewSummaries(),
    { ...filters, search: debouncedSearch },
  );

  const items = useOverviewData
    ? interviewsProp
    : useMock
      ? mockItems.slice(0, filters.pageSize ?? 10)
      : (data?.items ?? []);
  const total = useOverviewData
    ? (totalProp ?? items.length)
    : useMock
      ? mockItems.length
      : (data?.total ?? 0);
  const tableLoading =
    isLoadingProp ?? (!useOverviewData && !useMock && isLoading);
  const tableError =
    isErrorProp ?? (!useOverviewData && !useMock && isError);

  return (
    <Card className="@container/card mx-4 lg:mx-6">
      <CardHeader>
        <CardTitle>Интервью</CardTitle>
        <CardDescription>
          {total} в компании
          {activeTotal != null ? ` · ${activeTotal} активны` : ''}
        </CardDescription>
        <CardAction className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link to="/dashboard/interviews" />}>
            Все интервью
            <ArrowUpRightIcon className="size-3.5" />
          </Button>
          <CreateInterviewStartButton label="Создать" size="sm" />
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <div className="mb-4 px-6">
          <InterviewSummariesFiltersBar
            compact
            filters={filters}
            onChange={setFilters}
            onRefresh={() => void refetch()}
          />
        </div>

        {tableLoading ? (
          <div className="space-y-3 px-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : tableError ? (
          <p className="px-6 text-sm text-destructive">
            Не удалось загрузить список интервью.
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-8 text-center text-sm">
            <p className="text-muted-foreground">
              {filtersActive
                ? 'По этим фильтрам интервью не найдены.'
                : 'Интервью ещё нет. Создайте первое и отправьте ссылку кандидатам.'}
            </p>
            {!filtersActive && (
              <CreateInterviewStartButton size="sm" />
            )}
          </div>
        ) : (
          <InterviewSummariesTable items={items} />
        )}
      </CardContent>
    </Card>
  );
}
