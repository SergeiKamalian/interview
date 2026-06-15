import { useState } from 'react';
import {
  useAddToShortlistMutation,
  useRemoveFromShortlistMutation,
} from '@entities/candidate/api/shortlistApi';
import { Button, Input } from '@shared/ui';

type ShortlistToggleButtonProps = {
  candidateId: string;
  shortlistStatus: string;
};

export function ShortlistToggleButton({
  candidateId,
  shortlistStatus,
}: ShortlistToggleButtonProps) {
  const [reason, setReason] = useState('');
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [addToShortlist, { isLoading: isAdding }] = useAddToShortlistMutation();
  const [removeFromShortlist, { isLoading: isRemoving }] =
    useRemoveFromShortlistMutation();

  const isShortlisted = shortlistStatus === 'shortlisted';
  const isPending = isAdding || isRemoving;

  const handleAdd = async () => {
    await addToShortlist({ candidateId, reason: reason.trim() || undefined }).unwrap();
    setReason('');
  };

  const handleRemove = async () => {
    await removeFromShortlist({
      candidateId,
      reason: reason.trim() || undefined,
    }).unwrap();
    setShowConfirmRemove(false);
    setReason('');
  };

  return (
    <div className="space-y-3">
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Причина / recruiter note (optional)"
      />
      {isShortlisted ? (
        <div className="flex flex-wrap gap-2">
          {!showConfirmRemove ? (
            <Button
              variant="secondary"
              disabled={isPending}
              onClick={() => setShowConfirmRemove(true)}
            >
              Remove from shortlist
            </Button>
          ) : (
            <>
              <Button variant="primary" disabled={isPending} onClick={() => void handleRemove()}>
                Confirm remove
              </Button>
              <Button variant="ghost" onClick={() => setShowConfirmRemove(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button variant="primary" disabled={isPending} onClick={() => void handleAdd()}>
          {isPending ? 'Saving…' : 'Add to shortlist'}
        </Button>
      )}
    </div>
  );
}
