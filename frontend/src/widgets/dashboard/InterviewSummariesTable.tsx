import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, CopyIcon, ExternalLinkIcon, Loader2Icon, SaveIcon } from 'lucide-react';

import { useCreateInterviewTemplateFromInterviewMutation } from '@entities/interview-template/api/interviewTemplatesApi';
import type { CompanyInterviewSummaryItem } from '@entities/interview/model/interview.types';
import { formatUnixDate } from '@shared/lib/format';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui/tooltip';
import {
  PaginatedTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TablePaginationConfig,
} from '@shared/ui/table';

const interviewStatusLabels: Record<string, string> = {
  active: 'Активно',
  draft: 'Черновик',
  archived: 'Архив',
};

const interviewStatusVariants: Record<
  string,
  'success' | 'muted' | 'outline'
> = {
  active: 'success',
  draft: 'muted',
  archived: 'outline',
};

const levelLabels: Record<string, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

function InterviewStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={interviewStatusVariants[status] ?? 'outline'}>
      {interviewStatusLabels[status] ?? status}
    </Badge>
  );
}

function InterviewTitleCell({ item }: { item: CompanyInterviewSummaryItem }) {
  const level = levelLabels[item.level] ?? item.level;
  const language = item.interviewLanguage.toUpperCase();

  return (
    <div className="space-y-1">
      <Link
        to={`/dashboard/interviews/${item.interviewId}`}
        className="font-medium hover:underline"
      >
        {item.title}
      </Link>
      <p className="text-xs text-muted-foreground">
        {item.jobRole} · {level} · {language} · {item.questionCount} вопросов
      </p>
    </div>
  );
}

function AttemptsSummary({ item }: { item: CompanyInterviewSummaryItem }) {
  if (item.attemptsTotal === 0) {
    return <span className="text-muted-foreground">Нет кандидатов</span>;
  }

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
      <span>
        <span className="text-muted-foreground">всего </span>
        <span className="font-medium tabular-nums">{item.attemptsTotal}</span>
      </span>
      <span>
        <span className="text-muted-foreground">заверш. </span>
        <span className="font-medium tabular-nums text-green-700 dark:text-green-400">
          {item.attemptsCompleted}
        </span>
      </span>
      {item.attemptsInProgress > 0 && (
        <span>
          <span className="text-muted-foreground">в процессе </span>
          <span className="font-medium tabular-nums">{item.attemptsInProgress}</span>
        </span>
      )}
      {item.attemptsAbandoned > 0 && (
        <span>
          <span className="text-muted-foreground">прервано </span>
          <span className="font-medium tabular-nums text-destructive">
            {item.attemptsAbandoned}
          </span>
        </span>
      )}
    </div>
  );
}

function ResultBadges({ item }: { item: CompanyInterviewSummaryItem }) {
  const hasBadges =
    item.shortlistedCount > 0 ||
    item.strongInviteCount > 0 ||
    item.needsManualReviewCount > 0;

  if (!hasBadges) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {item.shortlistedCount > 0 && (
        <Badge variant="success">{item.shortlistedCount} избранных</Badge>
      )}
      {item.strongInviteCount > 0 && (
        <Badge variant="info">{item.strongInviteCount} сильн. рекомендация</Badge>
      )}
      {item.needsManualReviewCount > 0 && (
        <Badge variant="destructive">{item.needsManualReviewCount} проверка</Badge>
      )}
    </div>
  );
}

function ActionTooltip({
  label,
  children,
  open,
}: {
  label: string;
  children: React.ReactElement;
  open?: boolean;
}) {
  return (
    <Tooltip open={open}>
      <TooltipTrigger render={children} />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }

  return 'Не удалось сохранить template. Попробуйте ещё раз.';
}

function CopyLinkButton({ publicUrl }: { publicUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}${publicUrl}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ActionTooltip
      open={copied ? true : undefined}
      label={copied ? 'Скопировано' : 'Скопировать ссылку для кандидата'}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => void handleCopy()}
        disabled={!publicUrl}
      >
        {copied ? (
          <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
      </Button>
    </ActionTooltip>
  );
}

function SaveAsTemplateButton({
  interviewId,
  isSaving,
  saved,
  onSave,
}: {
  interviewId: string;
  isSaving: boolean;
  saved: boolean;
  onSave: (interviewId: string) => void;
}) {
  return (
    <ActionTooltip
      open={saved ? true : undefined}
      label={saved ? 'Template сохранён' : 'Сохранить как template'}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isSaving}
        onClick={() => onSave(interviewId)}
      >
        {isSaving ? (
          <Loader2Icon className="size-3.5 animate-spin" />
        ) : saved ? (
          <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <SaveIcon className="size-3.5" />
        )}
      </Button>
    </ActionTooltip>
  );
}

function OpenInterviewButton({ interviewId }: { interviewId: string }) {
  return (
    <ActionTooltip label="Открыть интервью">
      <Button
        variant="ghost"
        size="icon-sm"
        render={<Link to={`/dashboard/interviews/${interviewId}`} />}
      >
        <ExternalLinkIcon className="size-3.5" />
      </Button>
    </ActionTooltip>
  );
}

type InterviewSummariesTableProps = {
  items: CompanyInterviewSummaryItem[];
  containerQuery?: string;
  pagination?: TablePaginationConfig;
};

export function InterviewSummariesTable({
  items,
  containerQuery = '@container/card',
  pagination,
}: InterviewSummariesTableProps) {
  const [createTemplateFromInterview, { error, reset }] =
    useCreateInterviewTemplateFromInterviewMutation();
  const [savingInterviewId, setSavingInterviewId] = useState<string | null>(null);
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null);

  const handleSaveAsTemplate = async (interviewId: string) => {
    reset();
    setSavingInterviewId(interviewId);

    try {
      await createTemplateFromInterview({ interviewId }).unwrap();
      setSavedInterviewId(interviewId);
      window.setTimeout(() => setSavedInterviewId(null), 2500);
    } catch {
      // RTK Query exposes the error state above; keep the row action quiet.
    } finally {
      setSavingInterviewId(null);
    }
  };

  return (
    <div className={containerQuery}>
      {error && (
        <p className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}
      <PaginatedTable pagination={pagination}>
      <Table className="min-w-[920px] table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[168px]">Интервью</TableHead>
            <TableHead className="w-[96px]">Статус</TableHead>
            <TableHead className="hidden w-[200px] @[900px]/card:table-cell @[900px]/main:table-cell">
              Кандидаты
            </TableHead>
            <TableHead className="hidden w-[88px] @[750px]/card:table-cell @[750px]/main:table-cell">
              Ждут оценки
            </TableHead>
            <TableHead className="hidden w-[220px] @[680px]/card:table-cell @[680px]/main:table-cell">
              Результат
            </TableHead>
            <TableHead className="hidden w-[140px] @[1000px]/card:table-cell @[1000px]/main:table-cell">
              Активность
            </TableHead>
            <TableHead className="w-[80px] text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.interviewId} className="hover:bg-muted/40">
              <TableCell className="whitespace-normal align-middle">
                <InterviewTitleCell item={item} />
              </TableCell>
              <TableCell className="align-middle whitespace-normal">
                <InterviewStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="hidden align-middle whitespace-normal @[900px]/card:table-cell @[900px]/main:table-cell">
                <AttemptsSummary item={item} />
              </TableCell>
              <TableCell className="hidden align-middle font-medium tabular-nums @[750px]/card:table-cell @[750px]/main:table-cell">
                {item.attemptsPending > 0 ? (
                  <Badge variant="warning">{item.attemptsPending}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="hidden align-middle whitespace-normal @[680px]/card:table-cell @[680px]/main:table-cell">
                <ResultBadges item={item} />
              </TableCell>
              <TableCell className="hidden align-middle whitespace-normal text-muted-foreground @[1000px]/card:table-cell @[1000px]/main:table-cell">
                {formatUnixDate(item.lastActivityAt ?? item.createdAt)}
              </TableCell>
              <TableCell className="align-middle text-right">
                <TooltipProvider delay={200}>
                  <div className="flex items-center justify-end gap-0.5">
                    {item.status === 'active' && (
                      <CopyLinkButton publicUrl={item.publicUrl} />
                    )}
                    <SaveAsTemplateButton
                      interviewId={item.interviewId}
                      isSaving={savingInterviewId === item.interviewId}
                      saved={savedInterviewId === item.interviewId}
                      onSave={(id) => void handleSaveAsTemplate(id)}
                    />
                    <OpenInterviewButton interviewId={item.interviewId} />
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </PaginatedTable>
    </div>
  );
}
