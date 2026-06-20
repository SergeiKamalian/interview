import { useMemo, useState } from 'react';
import {
  useAttemptShareLinkQuery,
  useCreateAttemptShareLinkMutation,
  useRevokeAttemptShareLinkMutation,
} from '@entities/candidate/api/attemptShareApi';
import { buildShareUrl } from '@entities/candidate/api/attemptSharePublicApi';
import {
  Button,
  Input,
  Spinner,
} from '@shared/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { formatUnixDate } from '@shared/lib/format';
import { Copy, Link2, RefreshCw, Share2, Trash2 } from 'lucide-react';

type ExpiryOption = 'never' | '7' | '30';

type AttemptShareDialogProps = {
  attemptId: string;
};

export function AttemptShareDialog({ attemptId }: AttemptShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [expiry, setExpiry] = useState<ExpiryOption>('30');
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: activeLink, isLoading, refetch } = useAttemptShareLinkQuery(
    attemptId,
    { skip: !open || !attemptId },
  );
  const [createLink, { isLoading: isCreating }] =
    useCreateAttemptShareLinkMutation();
  const [revokeLink, { isLoading: isRevoking }] =
    useRevokeAttemptShareLinkMutation();

  const shareUrl = useMemo(() => {
    if (!activeLink?.sharePath) {
      return null;
    }

    return buildShareUrl(activeLink.sharePath);
  }, [activeLink?.sharePath]);

  const isPending = isCreating || isRevoking;

  const handleCreateOrRegenerate = async () => {
    setActionError(null);

    try {
      const expiresInDays =
        expiry === 'never' ? null : Number.parseInt(expiry, 10);

      await createLink({ attemptId, expiresInDays }).unwrap();
      await refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Не удалось создать ссылку',
      );
    }
  };

  const handleRevoke = async () => {
    setActionError(null);

    try {
      await revokeLink(attemptId).unwrap();
      await refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Не удалось отозвать ссылку',
      );
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        <Share2 className="size-3.5" />
        Поделиться
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Поделиться обзором кандидата</DialogTitle>
            <DialogDescription>
              Read-only ссылка для коллег: балл, рекомендация и summary без
              транскрипта и личных данных dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="share-expiry"
                className="text-sm font-medium text-foreground"
              >
                Срок действия
              </label>
              <select
                id="share-expiry"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={expiry}
                onChange={(event) =>
                  setExpiry(event.target.value as ExpiryOption)
                }
              >
                <option value="7">7 дней</option>
                <option value="30">30 дней</option>
                <option value="never">Без срока</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Проверяем активную ссылку…
              </div>
            ) : shareUrl ? (
              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Link2 className="mt-0.5 size-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Активная ссылка</p>
                    {activeLink?.expiresAt ? (
                      <p>
                        Действует до {formatUnixDate(activeLink.expiresAt)}
                      </p>
                    ) : (
                      <p>Без срока действия</p>
                    )}
                  </div>
                </div>
                <Input readOnly value={shareUrl} aria-label="Share URL" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ссылка ещё не создана. Коллеги без dashboard-доступа не смогут
                открыть обзор.
              </p>
            )}

            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {shareUrl ? (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isPending}
                    onClick={() => void handleCopy()}
                  >
                    <Copy className="size-3.5" />
                    {copied ? 'Скопировано' : 'Копировать'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => void handleRevoke()}
                  >
                    <Trash2 className="size-3.5" />
                    Отозвать
                  </Button>
                </>
              ) : null}
            </div>
            <Button
              size="sm"
              variant="primary"
              disabled={isPending}
              onClick={() => void handleCreateOrRegenerate()}
            >
              {isPending ? (
                <Spinner />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              {shareUrl ? 'Пересоздать' : 'Создать ссылку'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
