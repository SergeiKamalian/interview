import { Badge, Card } from '@shared/ui';
import type { VariantProps } from 'class-variance-authority';

import { badgeVariants } from '@shared/ui/badge';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

const LABELS: Record<string, { label: string; variant: BadgeVariant }> = {
  strong_invite: { label: 'Strong Hire', variant: 'success' },
  invite: { label: 'Hire', variant: 'success' },
  maybe: { label: 'Hold', variant: 'warning' },
  reject: { label: 'No Hire', variant: 'orange' },
  strong_reject: { label: 'No Hire', variant: 'destructive' },
};

type RecommendationCardProps = {
  hireRecommendation?: string | null;
  summary?: string | null;
  needsManualReview?: boolean;
  loading?: boolean;
};

export function RecommendationCard({
  hireRecommendation,
  summary,
  needsManualReview = false,
  loading = false,
}: RecommendationCardProps) {
  if (loading) {
    return (
      <Card header="Recommendation">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </Card>
    );
  }

  if (!hireRecommendation) {
    return (
      <Card header="Recommendation">
        <p className="text-sm text-muted-foreground">
          Рекомендация появится после AI-оценки.
        </p>
      </Card>
    );
  }

  const badge = LABELS[hireRecommendation] ?? {
    label: hireRecommendation,
    variant: 'muted' as BadgeVariant,
  };

  return (
    <Card header="Recommendation">
      <div className="space-y-3">
        <Badge variant={badge.variant} className="h-auto px-3 py-1 text-sm font-semibold">
          {badge.label}
        </Badge>
        {needsManualReview && (
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            ⚠ Требуется manual review
          </p>
        )}
        {summary && <p className="text-sm text-foreground">{summary}</p>}
        <p className="text-xs text-muted-foreground">
          Recommendation основана на checkpoint coverage, а не на свободной
          интерпретации ответа.
        </p>
      </div>
    </Card>
  );
}
