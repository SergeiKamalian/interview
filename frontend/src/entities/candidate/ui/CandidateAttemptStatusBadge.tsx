import { cn } from '@shared/lib/utils';
import { Badge } from '@shared/ui';
import { getCandidateDecisionMeta } from '../lib/candidateDecisionMeta';

type CandidateAttemptStatusBadgeProps = {
  label: string;
  variant:
    | 'success'
    | 'warning'
    | 'destructive'
    | 'muted'
    | 'info'
    | 'secondary'
    | 'outline'
    | 'default';
  companyDecision?: string;
  size?: 'sm' | 'md';
  className?: string;
};

export function CandidateAttemptStatusBadge({
  label,
  variant,
  companyDecision,
  size = 'sm',
  className,
}: CandidateAttemptStatusBadgeProps) {
  const decisionMeta = companyDecision
    ? getCandidateDecisionMeta(companyDecision)
    : null;

  const displayLabel = decisionMeta?.label ?? label;
  const displayVariant = decisionMeta?.variant ?? variant;
  const Icon = decisionMeta?.Icon;

  return (
    <Badge
      variant={displayVariant}
      className={cn(
        'max-w-full font-medium',
        size === 'sm' && 'h-auto gap-1 px-1.5 py-0.5 text-[11px]',
        size === 'md' && 'h-auto gap-1 px-2 py-0.5 text-xs',
        className,
      )}
    >
      {Icon ? <Icon className={cn(size === 'sm' ? 'size-3' : 'size-3.5')} /> : null}
      <span className="truncate">{displayLabel}</span>
    </Badge>
  );
}
