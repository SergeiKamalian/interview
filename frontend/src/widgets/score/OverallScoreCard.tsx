import { Badge, Card } from '@shared/ui';
import type { VariantProps } from 'class-variance-authority';

import { badgeVariants } from '@shared/ui/badge';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

type OverallScoreCardProps = {
  score?: number | null;
  maxScore?: number;
  loading?: boolean;
  interim?: boolean;
};

function scoreVariant(score: number): BadgeVariant {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'destructive';
}

export function OverallScoreCard({
  score,
  maxScore = 10,
  loading = false,
  interim = false,
}: OverallScoreCardProps) {
  if (loading) {
    return (
      <Card header="Overall score">
        <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
      </Card>
    );
  }

  if (score == null) {
    return (
      <Card header="Overall score">
        <p className="text-sm text-slate-500">Оценка ещё не готова.</p>
      </Card>
    );
  }

  const normalized = Math.min(100, Math.max(0, (score / maxScore) * 100));

  return (
    <Card header={interim ? 'Overall score (промежуточно)' : 'Overall score'}>
      <Badge
        variant={scoreVariant(normalized)}
        className="h-auto gap-2 rounded-lg border px-4 py-3 text-3xl font-semibold"
      >
        <span>{normalized.toFixed(0)}</span>
        <span className="text-sm font-normal">/ 100</span>
        <span className="text-sm font-normal text-muted-foreground">
          ({score.toFixed(1)} / 10)
        </span>
      </Badge>
      <p className="mt-3 text-xs text-slate-500">
        {interim
          ? 'Промежуточный score по уже оценённым checkpoints. Финальная оценка появится после завершения интервью.'
          : 'Score показан по 100-балльной шкале и рассчитан по structured checkpoints из question bank, не по свободному тексту AI.'}
      </p>
    </Card>
  );
}
