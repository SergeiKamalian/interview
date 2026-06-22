import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PlayIcon,
} from 'lucide-react';
import type {
  AiTone,
  InterviewStatus,
  ProbingDepth,
  QuestionLevel,
  ScoringStrictness,
} from '@shared/api/graphql/generated/graphql';
import {
  useArchiveInterviewMutation,
  useManagedInterviewQuery,
  usePauseInterviewMutation,
  useResumeInterviewMutation,
} from '@entities/interview/api/interviewManageApi';
import { usePublishInterviewMutation } from '@features/interview-create/api/interviewCreateApi';
import { useStartInterviewPreviewMutation } from '@features/public-interview/api/publicInterviewApi';
import { useCreateInterviewTemplateFromInterviewMutation } from '@entities/interview-template/api/interviewTemplatesApi';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Skeleton } from '@shared/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@shared/ui/collapsible';

const STATUS_LABELS: Record<InterviewStatus, string> = {
  draft: 'Черновик',
  active: 'Активно',
  paused: 'На паузе',
  archived: 'В архиве',
};

const STATUS_VARIANTS: Record<
  InterviewStatus,
  'muted' | 'success' | 'warning' | 'secondary'
> = {
  draft: 'muted',
  active: 'success',
  paused: 'warning',
  archived: 'secondary',
};

const TONE_LABELS: Record<AiTone, string> = {
  friendly: 'Дружелюбный',
  neutral: 'Нейтральный',
  strict: 'Строгий',
};

const DEPTH_LABELS: Record<ProbingDepth, string> = {
  shallow: 'Поверхностная',
  balanced: 'Сбалансированная',
  deep: 'Глубокая',
};

const STRICTNESS_LABELS: Record<ScoringStrictness, string> = {
  lenient: 'Мягкая',
  balanced: 'Сбалансированная',
  strict: 'Строгая',
};

const LEVEL_LABELS: Record<QuestionLevel, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

function buildShareUrl(publicUrl: string): string {
  if (/^https?:\/\//.test(publicUrl)) {
    return publicUrl;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${publicUrl}`;
  }
  return publicUrl;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

interface InterviewManagePanelProps {
  interviewId: string;
  /** Number of completed attempts (used to compute the "full" state). */
  completedCount?: number;
  defaultDetailsOpen?: boolean;
  headerActions?: ReactNode;
}

export function InterviewManagePanel({
  interviewId,
  completedCount = 0,
  defaultDetailsOpen = false,
  headerActions,
}: InterviewManagePanelProps) {
  const { data, isLoading, isError } = useManagedInterviewQuery(interviewId, {
    skip: !interviewId,
  });

  const [publish, { isLoading: isPublishing }] = usePublishInterviewMutation();
  const [pause, { isLoading: isPausing }] = usePauseInterviewMutation();
  const [resume, { isLoading: isResuming }] = useResumeInterviewMutation();
  const [archive, { isLoading: isArchiving }] = useArchiveInterviewMutation();
  const [saveAsTemplate, { isLoading: isSavingTemplate }] =
    useCreateInterviewTemplateFromInterviewMutation();
  const [startPreview, { isLoading: isStartingPreview }] =
    useStartInterviewPreviewMutation();

  const [copied, setCopied] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [nowMs] = useState(() => Date.now());

  const isMutating =
    isPublishing ||
    isPausing ||
    isResuming ||
    isArchiving ||
    isSavingTemplate ||
    isStartingPreview;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return null;
  }

  const interview = data;
  const shareUrl = buildShareUrl(interview.publicUrl);

  const isExpired = interview.expiresAt
    ? new Date(interview.expiresAt).getTime() < nowMs
    : false;
  const isFull =
    interview.maxCompletions != null &&
    completedCount >= interview.maxCompletions;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Ссылка скопирована');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    fallbackError: string,
  ) => {
    try {
      await action();
      toast.success(successMessage);
    } catch (err) {
      toast.error(extractErrorMessage(err, fallbackError));
    }
  };

  const handlePublish = () =>
    runAction(
      () => publish(interviewId).unwrap(),
      'Интервью опубликовано',
      'Не удалось опубликовать интервью',
    );

  const handlePause = () =>
    runAction(
      () => pause(interviewId).unwrap(),
      'Интервью поставлено на паузу',
      'Не удалось поставить на паузу',
    );

  const handleResume = () =>
    runAction(
      () => resume(interviewId).unwrap(),
      'Интервью возобновлено',
      'Не удалось возобновить интервью',
    );

  const handleArchive = () =>
    runAction(
      () => archive(interviewId).unwrap(),
      'Интервью отправлено в архив',
      'Не удалось архивировать интервью',
    );

  const handleSaveAsTemplate = () =>
    runAction(
      () => saveAsTemplate({ interviewId }).unwrap(),
      'Шаблон сохранён',
      'Не удалось сохранить шаблон',
    );

  // Owner dry run: launches the candidate session in a new tab. Preview attempts
  // apply interview settings (even on draft) but never count toward limits/analytics.
  const handleTryAsCandidate = async () => {
    try {
      const result = await startPreview(interviewId).unwrap();
      const url = `/i/${result.publicToken}/session?attemptId=${result.attemptId}&preview=1`;
      window.open(url, '_blank', 'noopener');
      toast.success('Превью запущено в новой вкладке');
    } catch (err) {
      toast.error(
        extractErrorMessage(err, 'Не удалось запустить превью'),
      );
    }
  };

  const canPublish = interview.status === 'draft';
  const canPause = interview.status === 'active';
  const canResume = interview.status === 'paused';
  const canArchive = interview.status !== 'archived';

  return (
    <Card size="sm">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2">
          {interview.title}
          <Badge variant={STATUS_VARIANTS[interview.status]}>
            {STATUS_LABELS[interview.status]}
          </Badge>
          {interview.status === 'active' && isExpired && (
            <Badge variant="destructive">Истекло</Badge>
          )}
          {interview.status === 'active' && isFull && (
            <Badge variant="orange">Лимит исчерпан</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {interview.jobRole} · {LEVEL_LABELS[interview.level]} ·{' '}
          {interview.questionCount} вопросов
        </CardDescription>
        <CardAction>
          <TooltipProvider>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {headerActions}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isMutating}
                      onClick={() => void handleTryAsCandidate()}
                    />
                  }
                >
                  <PlayIcon />
                  Попробовать как кандидат
                </TooltipTrigger>
                <TooltipContent>
                  Пробное прохождение в заданном тоне/глубине/строгости. Не
                  влияет на лимиты и аналитику.
                </TooltipContent>
              </Tooltip>
              {canPublish && (
                <Button
                  size="sm"
                  disabled={isMutating}
                  onClick={() => void handlePublish()}
                >
                  Опубликовать
                </Button>
              )}
              {canPause && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => void handlePause()}
                >
                  Пауза
                </Button>
              )}
              {canResume && (
                <Button
                  size="sm"
                  disabled={isMutating}
                  onClick={() => void handleResume()}
                >
                  Возобновить
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="icon-sm" />}
                  aria-label="Действия"
                  disabled={isMutating}
                >
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={isSavingTemplate}
                    onClick={() => void handleSaveAsTemplate()}
                  >
                    Сохранить как шаблон
                  </DropdownMenuItem>
                  {canArchive && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setArchiveOpen(true)}
                      >
                        Архивировать
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipProvider>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 pt-3">
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs">
            {shareUrl}
          </code>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Скопировать ссылку"
                    onClick={() => void handleCopy()}
                  />
                }
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </TooltipTrigger>
              <TooltipContent>
                {copied ? 'Скопировано' : 'Скопировать ссылку'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Collapsible defaultOpen={defaultDetailsOpen}>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ChevronDownIcon className="size-3.5 transition-transform in-data-panel-open:rotate-180" />
            Настройки и лимиты
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  ИИ-настройки
                </p>
                <dl className="text-sm">
                  <MetaRow label="Тон" value={TONE_LABELS[interview.aiTone]} />
                  <MetaRow
                    label="Глубина уточнений"
                    value={DEPTH_LABELS[interview.probingDepth]}
                  />
                  <MetaRow
                    label="Строгость оценки"
                    value={STRICTNESS_LABELS[interview.scoringStrictness]}
                  />
                </dl>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Лимиты доступа
                </p>
                <dl className="text-sm">
                  <MetaRow
                    label="Завершений"
                    value={
                      interview.maxCompletions != null
                        ? `${completedCount} / ${interview.maxCompletions}`
                        : `${completedCount} / ∞`
                    }
                  />
                  <MetaRow
                    label="Срок действия"
                    value={
                      interview.expiresAt
                        ? new Date(interview.expiresAt).toLocaleString('ru-RU')
                        : 'Без ограничений'
                    }
                  />
                  <MetaRow
                    label="Повторные попытки"
                    value={interview.allowRetake ? 'Разрешены' : 'Запрещены'}
                  />
                  <MetaRow
                    label="Лимит времени"
                    value={
                      interview.timeLimitMinutes != null
                        ? `${interview.timeLimitMinutes} мин`
                        : 'Без ограничений'
                    }
                  />
                  <MetaRow
                    label="Проходной балл"
                    value={
                      interview.passingScore != null
                        ? interview.passingScore
                        : 'Не задан'
                    }
                  />
                </dl>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Архивировать интервью?</AlertDialogTitle>
            <AlertDialogDescription>
              Интервью станет недоступно для кандидатов. Уже собранные данные и
              отчёты сохранятся. Это действие можно отменить только через
              поддержку.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isArchiving}
              onClick={() => void handleArchive()}
            >
              Архивировать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
