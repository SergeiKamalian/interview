import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';

import type { DashboardOverview } from '@entities/dashboard/api/dashboardApi';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { Badge } from '@shared/ui/badge';
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

const kindLabels: Record<string, string> = {
  needs_review: 'Проверка',
  strong_candidate: 'Сильный кандидат',
  abandoned: 'Прервано',
  in_progress: 'В процессе',
};

const kindVariants: Record<
  string,
  'destructive' | 'info' | 'warning' | 'secondary'
> = {
  needs_review: 'warning',
  strong_candidate: 'info',
  abandoned: 'destructive',
  in_progress: 'secondary',
};

type DashboardAttentionListProps = {
  items?: DashboardOverview['attentionItems'];
  isLoading?: boolean;
};

export function DashboardAttentionList({
  items = [],
  isLoading = false,
}: DashboardAttentionListProps) {
  return (
    <Card className="@container/card h-full">
      <CardHeader>
        <CardTitle>Требует внимания</CardTitle>
        <CardDescription>
          Проверки, сильные кандидаты, прерванные и активные сессии
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" render={<Link to="/dashboard/attempts" />}>
            Все кандидаты
            <ArrowUpRightIcon className="size-3.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Нет срочных задач — всё под контролем.
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={item.attemptId}
              to={`/dashboard/interviews/${item.interviewId}?attemptId=${item.attemptId}`}
              className="flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.candidateName}</span>
                  <Badge variant={kindVariants[item.kind] ?? 'secondary'}>
                    {kindLabels[item.kind] ?? item.kind}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {item.interviewTitle} · {item.jobRole}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatUnixDate(item.occurredAt)}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm font-medium tabular-nums">
                {formatScore(item.overallScore)}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
