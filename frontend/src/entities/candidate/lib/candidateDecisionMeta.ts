import { Check, Clock, Star, X, type LucideIcon } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@shared/ui/badge';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export type CandidateDecisionKey =
  | 'invite_live'
  | 'reject'
  | 'shortlist'
  | 'hold';

export const CANDIDATE_DECISION_META: Record<
  CandidateDecisionKey,
  { label: string; variant: BadgeVariant; Icon: LucideIcon }
> = {
  invite_live: {
    label: 'Одобрен',
    variant: 'success',
    Icon: Check,
  },
  reject: {
    label: 'Отказ',
    variant: 'destructive',
    Icon: X,
  },
  shortlist: {
    label: 'Следующий этап',
    variant: 'info',
    Icon: Star,
  },
  hold: {
    label: 'Отложено',
    variant: 'warning',
    Icon: Clock,
  },
};

export function getCandidateDecisionMeta(value: string) {
  return (
    CANDIDATE_DECISION_META[value as CandidateDecisionKey] ?? null
  );
}
