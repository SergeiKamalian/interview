import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, StarIcon } from 'lucide-react';

import type { DashboardOverview } from '@entities/dashboard/api/dashboardApi';
import { formatScore, formatUnixDate } from '@shared/lib/format';
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

type DashboardShortlistPreviewProps = {
  items?: DashboardOverview['shortlistPreview'];
  total?: number;
  isLoading?: boolean;
};

export function DashboardShortlistPreview({
  items = [],
  total = 0,
  isLoading = false,
}: DashboardShortlistPreviewProps) {
  return (
    <Card className="@container/card h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StarIcon className="size-4" />
          Избранные
        </CardTitle>
        <CardDescription>
          {total > 0 ? `${total} кандидатов отмечены для следующего этапа` : 'Пока пусто'}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" render={<Link to="/dashboard/candidates" />}>
            Открыть
            <ArrowUpRightIcon className="size-3.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Отметьте сильных кандидатов после завершения интервью.
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={item.candidateId}
              to={`/dashboard/candidates/${item.candidateId}/report`}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="font-medium">{item.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.email}</p>
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="font-medium tabular-nums">{formatScore(item.avgScore)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatUnixDate(item.lastInterviewDate)}
                </p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
