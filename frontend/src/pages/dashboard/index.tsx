import { env } from '@shared/config/env';
import { ChartAreaInteractive } from '@shared/ui/chart-area-interactive';
import { SectionCards } from '@shared/ui/section-cards';
import { useCompanyDashboardOverviewQuery } from '@entities/dashboard/api/dashboardApi';
import { getDashboardMockOverview } from '@shared/mocks/dashboard-overview.mock';
import { DashboardInterviewsTable } from '@widgets/dashboard/DashboardInterviewsTable';
import { DashboardSecondaryMetrics } from '@widgets/dashboard/DashboardSecondaryMetrics';
import { DashboardWeakTopicsCard } from '@widgets/dashboard/DashboardWeakTopicsCard';

export function DashboardOverviewPage() {
  const useMock = env.dashboardMock;
  const { data, isLoading, isError } = useCompanyDashboardOverviewQuery(undefined, {
    skip: useMock,
  });

  const overview = useMock ? getDashboardMockOverview() : data;
  const loading = useMock ? false : isLoading;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards
        metrics={overview?.metrics}
        isLoading={loading}
        isError={useMock ? false : isError}
      />
      <DashboardSecondaryMetrics metrics={overview?.metrics} isLoading={loading} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DashboardWeakTopicsCard topics={overview?.weakTopics} isLoading={loading} />
      <DashboardInterviewsTable
        interviews={overview?.interviews}
        total={overview?.interviewsTotal}
        activeTotal={overview?.metrics?.activeInterviewsTotal}
        isLoading={loading}
        isError={useMock ? false : isError}
      />
    </div>
  );
}
