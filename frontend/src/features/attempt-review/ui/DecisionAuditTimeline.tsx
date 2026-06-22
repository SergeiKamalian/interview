import { useState } from 'react';
import { useAttemptReviewDecisionHistoryQuery } from '@entities/candidate/api/attemptReviewApi';
import {
  formatDecisionAuditAction,
  formatDecisionAuditActor,
} from '@entities/candidate/lib/decisionAuditEventLabels';
import { Badge, Card, Spinner } from '@shared/ui';
import { TablePagination } from '@shared/ui/TablePagination';
import { formatUnixDate } from '@shared/lib/format';

type DecisionAuditTimelineProps = {
  attemptId: string;
};

export function DecisionAuditTimeline({ attemptId }: DecisionAuditTimelineProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError, isFetching } =
    useAttemptReviewDecisionHistoryQuery(
      { attemptId, page, pageSize },
      { skip: !attemptId },
    );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <Card header="История решений">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Загрузка истории…
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Не удалось загрузить историю решений.
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока нет записей о решениях по этой попытке.
        </p>
      ) : (
        <div className="space-y-4">
          <ol className="relative space-y-4 border-l border-border pl-4">
            {items.map((event) => (
              <li key={event.eventId} className="relative">
                <span className="absolute -left-[1.125rem] top-1.5 size-2 rounded-full bg-brand-primary" />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDecisionAuditAction(event)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDecisionAuditActor(event.actorName, event.actorEmail)}
                      {event.actorEmail && event.actorName
                        ? ` · ${event.actorEmail}`
                        : null}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {formatUnixDate(event.occurredAt)}
                  </time>
                </div>
                {event.reason?.trim() && (
                  <p className="mt-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    {event.reason.trim()}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline">
                    {event.source === 'shortlist' ? 'Избранные' : 'Проверка'}
                  </Badge>
                  {event.previousValue && event.newValue && (
                    <Badge variant="secondary">
                      {event.previousValue} → {event.newValue}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {total > pageSize && (
            <TablePagination
              className="border-t border-border pt-3 text-xs"
              page={page}
              pageSize={pageSize}
              total={total}
              isLoading={isFetching}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </Card>
  );
}
