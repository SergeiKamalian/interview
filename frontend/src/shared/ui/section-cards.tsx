import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CheckCircle2Icon,
  LoaderIcon,
  StarIcon,
  ListIcon,
} from 'lucide-react';

import type { DashboardOverview } from '@entities/dashboard/api/dashboardApi';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Skeleton } from '@shared/ui/skeleton';

type SectionCardsProps = {
  metrics?: DashboardOverview['metrics'];
  isLoading?: boolean;
  isError?: boolean;
};

type MetricCardProps = {
  title: string;
  value: number | null;
  footerTitle: string;
  footerDescription: string;
  href?: string;
  icon: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
};

function MetricCard({
  title,
  value,
  footerTitle,
  footerDescription,
  href,
  icon,
  isLoading,
  isError,
}: MetricCardProps) {
  const displayValue =
    isError ? '—' : value != null ? value.toLocaleString('ru-RU') : '0';

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? <Skeleton className="h-8 w-20" /> : displayValue}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {icon}
          {href && !isLoading ? (
            <Link to={href} className="hover:underline">
              {footerTitle}
            </Link>
          ) : (
            footerTitle
          )}
        </div>
        <div className="text-muted-foreground">{footerDescription}</div>
      </CardFooter>
    </Card>
  );
}

export function SectionCards({
  metrics,
  isLoading = false,
  isError = false,
}: SectionCardsProps) {
  const cards = [
    {
      title: 'Интервью',
      value: metrics?.interviewsTotal ?? null,
      footerTitle:
        metrics?.activeInterviewsTotal != null
          ? `${metrics.activeInterviewsTotal.toLocaleString('ru-RU')} активны`
          : 'Активные интервью',
      footerDescription: 'Всего скринингов в компании',
      href: '/dashboard/interviews',
      icon: <ListIcon className="size-4" />,
    },
    {
      title: 'Кандидаты',
      value: metrics?.candidatesTotal ?? null,
      footerTitle: 'Все кандидаты',
      footerDescription: 'Уникальные кандидаты со скринингами',
      href: '/dashboard/candidates',
      icon: <UsersIcon className="size-4" />,
    },
    {
      title: 'Завершённые скрининги',
      value: metrics?.completedTotal ?? null,
      footerTitle: 'Завершённые интервью',
      footerDescription: 'Пройденные AI-интервью',
      href: '/dashboard/attempts',
      icon: <CheckCircle2Icon className="size-4" />,
    },
    {
      title: 'В процессе',
      value: metrics?.inProgressTotal ?? null,
      footerTitle: 'Активные сессии',
      footerDescription: 'Кандидаты проходят интервью сейчас',
      href: '/dashboard/attempts?status=in_progress',
      icon: <LoaderIcon className="size-4" />,
    },
    {
      title: 'Шортлист',
      value: metrics?.shortlistedTotal ?? null,
      footerTitle: 'Открыть шортлист',
      footerDescription: 'Отмечены для следующего этапа',
      href: '/dashboard/candidates?shortlist=1',
      icon: <StarIcon className="size-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-5 dark:*:data-[slot=card]:bg-card">
      {cards.map((metric) => (
        <MetricCard
          key={metric.title}
          {...metric}
          isLoading={isLoading}
          isError={isError}
        />
      ))}
    </div>
  );
}
