import { Link } from 'react-router-dom';
import {
  AlertCircleIcon,
  BanIcon,
  CheckCircle2Icon,
  SparklesIcon,
} from 'lucide-react';

import type { DashboardOverview } from '@entities/dashboard/api/dashboardApi';
import { formatCompletionRate } from '@shared/lib/format';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Skeleton } from '@shared/ui/skeleton';
import { cn } from '@shared/lib/utils';

type DashboardSecondaryMetricsProps = {
  metrics?: DashboardOverview['metrics'];
  isLoading?: boolean;
};

type SecondaryMetricConfig = {
  key: 'abandonedTotal' | 'needsReviewTotal' | 'strongInviteTotal' | 'completionRate';
  title: string;
  footerTitle: string;
  footerDescription: string;
  href: string;
  icon: React.ReactNode;
  accentClass: string;
  gradientClass: string;
  formatValue: (metrics: NonNullable<DashboardOverview['metrics']>) => string;
};

const metricConfigs: SecondaryMetricConfig[] = [
  {
    key: 'abandonedTotal',
    title: 'Прервано',
    footerTitle: 'Прерванные сессии',
    footerDescription: 'Кандидаты вышли до завершения',
    href: '/dashboard/attempts?status=abandoned',
    icon: <BanIcon className="size-4" />,
    accentClass: 'text-destructive',
    gradientClass: 'from-destructive/12',
    formatValue: (m) => m.abandonedTotal.toLocaleString('ru-RU'),
  },
  {
    key: 'needsReviewTotal',
    title: 'Нужна проверка',
    footerTitle: 'Ручная проверка',
    footerDescription: 'AI отметил спорные ответы',
    href: '/dashboard/attempts',
    icon: <AlertCircleIcon className="size-4" />,
    accentClass: 'text-amber-600 dark:text-amber-400',
    gradientClass: 'from-amber-500/12',
    formatValue: (m) => m.needsReviewTotal.toLocaleString('ru-RU'),
  },
  {
    key: 'strongInviteTotal',
    title: 'Сильная рекомендация',
    footerTitle: 'Сильные кандидаты',
    footerDescription: 'AI рекомендует на следующий этап',
    href: '/dashboard/candidates',
    icon: <SparklesIcon className="size-4" />,
    accentClass: 'text-sky-600 dark:text-sky-400',
    gradientClass: 'from-sky-500/12',
    formatValue: (m) => m.strongInviteTotal.toLocaleString('ru-RU'),
  },
  {
    key: 'completionRate',
    title: 'Доля завершения',
    footerTitle: 'Завершённые интервью',
    footerDescription: 'Сколько сессий довели до конца',
    href: '/dashboard/attempts?status=completed',
    icon: <CheckCircle2Icon className="size-4" />,
    accentClass: 'text-green-700 dark:text-green-400',
    gradientClass: 'from-green-500/12',
    formatValue: (m) => formatCompletionRate(m.completionRate),
  },
];

function SecondaryMetricCard({
  config,
  metrics,
  isLoading,
}: {
  config: SecondaryMetricConfig;
  metrics?: DashboardOverview['metrics'];
  isLoading: boolean;
}) {
  const displayValue =
    metrics != null ? config.formatValue(metrics) : '—';
  const completionRate =
    config.key === 'completionRate' ? metrics?.completionRate ?? null : null;

  return (
    <Card
      className={cn(
        '@container/card bg-linear-to-t to-card shadow-xs dark:bg-card',
        config.gradientClass,
      )}
    >
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <span className={config.accentClass}>{config.icon}</span>
          {config.title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? <Skeleton className="h-8 w-20" /> : displayValue}
        </CardTitle>
        {config.key === 'completionRate' && !isLoading && completionRate != null && (
          <div className="mt-3 space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-600 transition-all dark:bg-green-500"
                style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {completionRate.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}% сессий
              завершены полностью
            </p>
          </div>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {config.icon}
          {!isLoading ? (
            <Link to={config.href} className="hover:underline">
              {config.footerTitle}
            </Link>
          ) : (
            config.footerTitle
          )}
        </div>
        <div className="text-muted-foreground">{config.footerDescription}</div>
      </CardFooter>
    </Card>
  );
}

export function DashboardSecondaryMetrics({
  metrics,
  isLoading = false,
}: DashboardSecondaryMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {metricConfigs.map((config) => (
        <SecondaryMetricCard
          key={config.key}
          config={config}
          metrics={metrics}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
