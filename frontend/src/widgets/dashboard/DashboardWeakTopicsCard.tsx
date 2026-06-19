import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, TrendingDownIcon } from 'lucide-react';

import type { DashboardOverview } from '@entities/dashboard/api/dashboardApi';
import { formatCompletionRate, formatScore } from '@shared/lib/format';
import { cn } from '@shared/lib/utils';
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

type DashboardWeakTopicsCardProps = {
  topics?: DashboardOverview['weakTopics'];
  isLoading?: boolean;
};

function TopicStat({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string;
  accentClass?: string;
}) {
  return (
    <div className="rounded-md border bg-background/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 text-sm font-semibold tabular-nums', accentClass)}>
        {value}
      </p>
    </div>
  );
}

export function DashboardWeakTopicsCard({
  topics = [],
  isLoading = false,
}: DashboardWeakTopicsCardProps) {
  return (
    <Card className="@container/card mx-4 lg:mx-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDownIcon className="size-4" />
          Слабые темы
        </CardTitle>
        <CardDescription>
          Темы, где кандидаты чаще не закрывают критерии оценки
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" render={<Link to="/dashboard/analytics" />}>
            Аналитика
            <ArrowUpRightIcon className="size-3.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Недостаточно завершённых интервью для анализа тем.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.topicName}
                className="rounded-lg border bg-muted/30 p-4"
              >
                <p className="font-medium">{topic.topicName}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <TopicStat
                    label="Средний балл"
                    value={formatScore(topic.avgScore)}
                    accentClass="text-foreground"
                  />
                  <TopicStat
                    label="Закрыли критерии"
                    value={formatCompletionRate(topic.passRate)}
                    accentClass="text-amber-700 dark:text-amber-400"
                  />
                  <TopicStat
                    label="Оценок по теме"
                    value={topic.sampleCount.toLocaleString('ru-RU')}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
