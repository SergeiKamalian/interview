import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useSetAttemptCompanyDecisionMutation } from '@entities/candidate/api/attemptReviewApi';
import {
  useAddToShortlistMutation,
  useRemoveFromShortlistMutation,
} from '@entities/candidate/api/shortlistApi';
import { getCandidateDecisionMeta } from '@entities/candidate/lib/candidateDecisionMeta';
import { Button } from '@shared/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shared/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui/tooltip';
import { cn } from '@shared/lib/utils';
import { Check, Copy, Star, XCircle } from 'lucide-react';

type AttemptQuickActionsProps = {
  attemptId: string;
  candidateId: string;
  candidateName: string;
  shortlistStatus: string;
  companyDecision?: string;
  overallScore?: number | null;
  hireRecommendation?: string | null;
  summary?: string | null;
  className?: string;
};

function isApprovedDecision(decision?: string): boolean {
  return decision === 'invite_live';
}

function isRejectedDecision(decision?: string): boolean {
  return decision === 'reject';
}

function ActionButton({
  label,
  description,
  disabled,
  onClick,
  variant = 'ghost',
  className,
  children,
}: {
  label: string;
  description: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'ghost' | 'secondary' | 'destructive';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={variant}
            size="icon-sm"
            disabled={disabled}
            aria-label={label}
            className={className}
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom" className="max-w-56">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function AttemptQuickActions({
  attemptId,
  candidateId,
  candidateName,
  shortlistStatus,
  companyDecision,
  overallScore,
  hireRecommendation,
  summary,
  className,
}: AttemptQuickActionsProps) {
  const [addToShortlist, { isLoading: isAdding }] = useAddToShortlistMutation();
  const [removeFromShortlist, { isLoading: isRemoving }] =
    useRemoveFromShortlistMutation();
  const [setDecision, { isLoading: isDeciding }] =
    useSetAttemptCompanyDecisionMutation();
  const [copied, setCopied] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const isShortlisted = shortlistStatus === 'shortlisted';
  const isPending = isAdding || isRemoving || isDeciding;
  const isApproved = isApprovedDecision(companyDecision);
  const isRejected = isRejectedDecision(companyDecision);

  const handleShortlistToggle = async () => {
    if (isShortlisted) {
      await removeFromShortlist({ candidateId }).unwrap();
      toast.success('Кандидат убран из избранных');
      return;
    }

    await addToShortlist({ candidateId }).unwrap();
    await setDecision({ attemptId, decision: 'shortlist' }).unwrap();
    toast.success('Кандидат добавлен в избранные');
  };

  const handleReject = async () => {
    try {
      await setDecision({ attemptId, decision: 'reject' }).unwrap();
      setRejectOpen(false);
      toast.success(isApproved ? 'Решение изменено' : 'Кандидат отклонён', {
        description: `${candidateName} — ${isApproved ? 'теперь отклонён' : 'решение сохранено'}`,
      });
    } catch (error) {
      toast.error('Не удалось отклонить кандидата', {
        description:
          error instanceof Error ? error.message : 'Попробуйте ещё раз',
      });
    }
  };

  const handleInviteLive = async () => {
    try {
      await setDecision({ attemptId, decision: 'invite_live' }).unwrap();
      setApproveOpen(false);
      toast.success(isRejected ? 'Решение изменено' : 'Кандидат одобрен', {
        description: `${candidateName} — ${isRejected ? 'теперь одобрен' : 'решение сохранено'}`,
      });
    } catch (error) {
      toast.error('Не удалось одобрить кандидата', {
        description:
          error instanceof Error ? error.message : 'Попробуйте ещё раз',
      });
    }
  };

  const handleCopySummary = async () => {
    const text = [
      candidateName,
      `Балл: ${overallScore ?? '—'}`,
      `Рекомендация: ${hireRecommendation ?? '—'}`,
      summary?.trim() || 'Краткое резюме пока нет.',
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Резюме скопировано');
    window.setTimeout(() => setCopied(false), 2000);
  };

  const approveLabel =
    getCandidateDecisionMeta('invite_live')?.label ?? 'Одобрить';
  const rejectLabel = getCandidateDecisionMeta('reject')?.label ?? 'Отклонить';

  return (
    <TooltipProvider delay={200}>
      <div className={cn('flex flex-wrap items-center gap-0.5', className)}>
        <ActionButton
          label={isShortlisted ? 'Убрать из избранных' : 'Добавить в избранные'}
          description={
            isShortlisted
              ? 'Кандидат больше не будет в списке сильных кандидатов'
              : 'Сохранить кандидата для следующих этапов отбора'
          }
          disabled={isPending}
          variant={isShortlisted ? 'secondary' : 'ghost'}
          className={cn(isShortlisted && 'text-amber-600 dark:text-amber-400')}
          onClick={() => void handleShortlistToggle()}
        >
          <Star className={cn('size-3.5', isShortlisted && 'fill-current')} />
        </ActionButton>

        <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <AlertDialogTrigger
                  render={
                    <Button
                      variant={isApproved ? 'secondary' : 'ghost'}
                      size="icon-sm"
                      disabled={isPending}
                      aria-label={approveLabel}
                      aria-pressed={isApproved}
                      className={cn(
                        isApproved &&
                          'text-green-600 dark:text-green-400',
                      )}
                    >
                      <Check className="size-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent side="bottom" className="max-w-56">
              <p className="font-medium">
                {isApproved ? 'Одобрен' : approveLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {isApproved
                  ? 'Нажмите, чтобы подтвердить или изменить решение'
                  : isRejected
                    ? 'Изменить решение и одобрить кандидата'
                    : 'Зафиксировать положительное решение по кандидату'}
              </p>
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isRejected
                  ? `Изменить решение и одобрить ${candidateName}?`
                  : isApproved
                    ? `Подтвердить одобрение ${candidateName}?`
                    : `Одобрить ${candidateName}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRejected
                  ? 'Текущий статус «Отказ» будет заменён на «Одобрен». Изменение попадёт в историю решений.'
                  : 'Решение будет сохранено в истории попытки. Кандидат получит статус «Одобрен» в таблице интервью.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={() => void handleInviteLive()}
              >
                Одобрить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <AlertDialogTrigger
                  render={
                    <Button
                      variant={isRejected ? 'secondary' : 'ghost'}
                      size="icon-sm"
                      disabled={isPending}
                      aria-label={rejectLabel}
                      aria-pressed={isRejected}
                      className={cn(
                        isRejected && 'text-destructive',
                      )}
                    >
                      <XCircle className="size-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent side="bottom" className="max-w-56">
              <p className="font-medium">
                {isRejected ? 'Отклонён' : rejectLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRejected
                  ? 'Нажмите, чтобы подтвердить или изменить решение'
                  : isApproved
                    ? 'Изменить решение и отклонить кандидата'
                    : 'Зафиксировать отказ по этой попытке'}
              </p>
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isApproved
                  ? `Изменить решение и отклонить ${candidateName}?`
                  : isRejected
                    ? `Подтвердить отклонение ${candidateName}?`
                    : `Отклонить ${candidateName}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isApproved
                  ? 'Текущий статус «Одобрен» будет заменён на «Отказ». Изменение попадёт в историю решений.'
                  : 'Решение будет сохранено в истории попытки. Его можно увидеть в таблице кандидатов и в истории решений.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isPending}
                onClick={() => void handleReject()}
              >
                Отклонить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ActionButton
          label={copied ? 'Резюме скопировано' : 'Копировать резюме'}
          description="Скопировать имя, балл, рекомендацию и краткое резюме"
          disabled={isPending}
          onClick={() => void handleCopySummary()}
        >
          <Copy className="size-3.5" />
        </ActionButton>
      </div>
    </TooltipProvider>
  );
}
