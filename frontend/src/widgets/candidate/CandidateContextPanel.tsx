import { Link } from 'react-router-dom';
import {
  ExternalLinkIcon,
  Link2Icon,
  MailIcon,
  PhoneIcon,
} from 'lucide-react';
import { useCandidateReportQuery } from '@entities/candidate/api/candidateReportApi';
import { Badge, Card, Spinner } from '@shared/ui';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { cn } from '@shared/lib/utils';

type CandidateContextPanelProps = {
  candidateId: string;
  currentAttemptId?: string;
  currentInterviewId?: string;
  className?: string;
};

const LEVEL_LABELS: Record<string, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

function levelLabel(level?: string | null): string {
  if (!level) {
    return '—';
  }

  return LEVEL_LABELS[level] ?? level;
}

function normalizeExternalUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function attemptStatusLabel(value?: string | null): string {
  switch (value) {
    case 'completed':
      return 'завершено';
    case 'in_progress':
      return 'в процессе';
    case 'abandoned':
      return 'прервано';
    default:
      return value ?? '—';
  }
}

function shortlistLabel(value?: string | null): string {
  switch (value) {
    case 'shortlisted':
      return 'В shortlist';
    case 'not_shortlisted':
      return 'Не в shortlist';
    default:
      return value ?? '—';
  }
}

function ContactLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof MailIcon;
}) {
  return (
    <a
      href={normalizeExternalUrl(href)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:underline"
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
      <ExternalLinkIcon className="size-3 opacity-60" />
    </a>
  );
}

export function CandidateContextPanel({
  candidateId,
  currentAttemptId,
  currentInterviewId,
  className,
}: CandidateContextPanelProps) {
  const { data, isLoading, isError } = useCandidateReportQuery(candidateId, {
    skip: !candidateId,
  });

  if (!candidateId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={className} header="Контекст кандидата">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Загрузка профиля…
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={className} header="Контекст кандидата">
        <p className="text-sm text-muted-foreground">
          Не удалось загрузить профиль кандидата.
        </p>
      </Card>
    );
  }

  const evaluation = data.latestFinalEvaluation;
  const otherInterviews = data.interviewHistory.filter(
    (item) =>
      item.attemptId !== currentAttemptId &&
      item.status === 'completed',
  );
  const visibleInterviews = otherInterviews.slice(0, 4);
  const hiddenInterviewCount = Math.max(
    0,
    otherInterviews.length - visibleInterviews.length,
  );

  return (
    <Card className={className} header="Контекст кандидата">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Контакты
            </p>
            <div className="space-y-1.5">
              <a
                href={`mailto:${data.email}`}
                className="inline-flex items-center gap-1.5 text-foreground hover:text-brand-primary"
              >
                <MailIcon className="size-3.5 shrink-0 text-muted-foreground" />
                {data.email}
              </a>
              {data.phone ? (
                <a
                  href={`tel:${data.phone}`}
                  className="flex items-center gap-1.5 text-foreground hover:text-brand-primary"
                >
                  <PhoneIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  {data.phone}
                </a>
              ) : (
                <p className="text-muted-foreground">Телефон не указан</p>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Профили
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {data.linkedinUrl ? (
                <ContactLink
                  href={data.linkedinUrl}
                  label="LinkedIn"
                  icon={Link2Icon}
                />
              ) : null}
              {data.githubUrl ? (
                <ContactLink
                  href={data.githubUrl}
                  label="GitHub"
                  icon={Link2Icon}
                />
              ) : null}
              {!data.linkedinUrl && !data.githubUrl ? (
                <p className="text-muted-foreground">Ссылки не указаны</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Talent pool
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                data.shortlistStatus === 'shortlisted' ? 'success' : 'muted'
              }
            >
              {shortlistLabel(data.shortlistStatus)}
            </Badge>
            {evaluation?.achievedLevel ? (
              <Badge variant="secondary">
                Уровень: {levelLabel(evaluation.achievedLevel)}
                {evaluation.achievedLevelMethod === 'estimate' ? ' ≈' : ''}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">
                Уровень пока не определён
              </span>
            )}
          </div>
          {evaluation?.achievedLevelNote ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {evaluation.achievedLevelNote}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Другие интервью компании
            </p>
            {otherInterviews.length > 0 ? (
              <Badge variant="outline">{otherInterviews.length}</Badge>
            ) : null}
          </div>
          {visibleInterviews.length > 0 ? (
            <ul className="space-y-2">
              {visibleInterviews.map((item) => (
                <li
                  key={item.attemptId}
                  className={cn(
                    'rounded-lg border border-border px-3 py-2 text-sm',
                    item.interviewId === currentInterviewId &&
                      'border-brand-primary/30 bg-brand-primary/5',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/dashboard/interviews/${item.interviewId}/attempts/${item.attemptId}/review`}
                        className="font-medium text-brand-primary hover:underline"
                      >
                        {item.interviewTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {item.jobRole} · {attemptStatusLabel(item.status)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{formatUnixDate(item.completedAt)}</p>
                      <p>{formatScore(item.totalScore)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Других завершённых интервью у этой компании пока нет.
            </p>
          )}
          {hiddenInterviewCount > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Ещё {hiddenInterviewCount} в полном отчёте.
            </p>
          ) : null}
        </div>

        <div className="border-t border-border pt-3">
          <Link
            to={`/dashboard/candidates/${data.candidateId}/report`}
            className="text-sm text-brand-primary hover:underline"
          >
            Полный отчёт кандидата →
          </Link>
        </div>
      </div>
    </Card>
  );
}
