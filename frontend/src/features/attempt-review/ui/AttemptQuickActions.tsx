import { useState } from 'react';
import {
  useSetAttemptCompanyDecisionMutation,
} from '@entities/candidate/api/attemptReviewApi';
import {
  useAddToShortlistMutation,
  useRemoveFromShortlistMutation,
} from '@entities/candidate/api/shortlistApi';
import { Button } from '@shared/ui';
import { Copy, Star, StarOff, Video, XCircle } from 'lucide-react';

type AttemptQuickActionsProps = {
  attemptId: string;
  candidateId: string;
  candidateName: string;
  shortlistStatus: string;
  overallScore?: number | null;
  hireRecommendation?: string | null;
  summary?: string | null;
  layout?: 'row' | 'stack';
};

export function AttemptQuickActions({
  attemptId,
  candidateId,
  candidateName,
  shortlistStatus,
  overallScore,
  hireRecommendation,
  summary,
  layout = 'row',
}: AttemptQuickActionsProps) {
  const [addToShortlist, { isLoading: isAdding }] = useAddToShortlistMutation();
  const [removeFromShortlist, { isLoading: isRemoving }] =
    useRemoveFromShortlistMutation();
  const [setDecision, { isLoading: isDeciding }] =
    useSetAttemptCompanyDecisionMutation();
  const [copied, setCopied] = useState(false);

  const isShortlisted = shortlistStatus === 'shortlisted';
  const isPending = isAdding || isRemoving || isDeciding;

  const handleShortlistToggle = async () => {
    if (isShortlisted) {
      await removeFromShortlist({ candidateId }).unwrap();
      return;
    }

    await addToShortlist({ candidateId }).unwrap();
    await setDecision({ attemptId, decision: 'shortlist' }).unwrap();
  };

  const handleReject = async () => {
    if (!window.confirm(`Отклонить ${candidateName}?`)) {
      return;
    }

    await setDecision({ attemptId, decision: 'reject' }).unwrap();
  };

  const handleInviteLive = async () => {
    await setDecision({ attemptId, decision: 'invite_live' }).unwrap();
  };

  const handleCopySummary = async () => {
    const text = [
      candidateName,
      `Балл: ${overallScore ?? '—'}`,
      `Рекомендация: ${hireRecommendation ?? '—'}`,
      summary?.trim() || 'Summary пока нет.',
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={
        layout === 'row' ? 'flex flex-wrap gap-1.5' : 'flex flex-col gap-2'
      }
    >
      <Button
        size="sm"
        variant={isShortlisted ? 'secondary' : 'ghost'}
        disabled={isPending}
        onClick={() => void handleShortlistToggle()}
      >
        {isShortlisted ? (
          <StarOff className="size-3.5" />
        ) : (
          <Star className="size-3.5" />
        )}
        {isShortlisted ? 'Убрать' : 'Shortlist'}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => void handleInviteLive()}
      >
        <Video className="size-3.5" />
        На live
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => void handleReject()}
      >
        <XCircle className="size-3.5" />
        Отклонить
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => void handleCopySummary()}
      >
        <Copy className="size-3.5" />
        {copied ? 'Скопировано' : 'Summary'}
      </Button>
    </div>
  );
}
