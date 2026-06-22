import { Badge } from '@shared/ui';
import { cn } from '@shared/lib/utils';
import { COMPANY_SCOPE_BADGE_LABEL } from '../lib/questionScopeLabels';

type CustomScopeBadgeProps = {
  className?: string;
};

export function CustomScopeBadge({ className }: CustomScopeBadgeProps) {
  return (
    <Badge variant="info" className={cn('shrink-0', className)}>
      {COMPANY_SCOPE_BADGE_LABEL}
    </Badge>
  );
}
