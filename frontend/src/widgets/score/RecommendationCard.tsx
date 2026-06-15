import { Card } from '@shared/ui';

const LABELS: Record<string, { label: string; className: string }> = {
  strong_invite: { label: 'Strong Hire', className: 'bg-green-100 text-green-800' },
  invite: { label: 'Hire', className: 'bg-emerald-100 text-emerald-800' },
  maybe: { label: 'Hold', className: 'bg-amber-100 text-amber-800' },
  reject: { label: 'No Hire', className: 'bg-orange-100 text-orange-800' },
  strong_reject: { label: 'No Hire', className: 'bg-red-100 text-red-800' },
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
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
      </Card>
    );
  }

  if (!hireRecommendation) {
    return (
      <Card header="Recommendation">
        <p className="text-sm text-slate-500">Рекомендация появится после AI-оценки.</p>
      </Card>
    );
  }

  const badge = LABELS[hireRecommendation] ?? {
    label: hireRecommendation,
    className: 'bg-slate-100 text-slate-700',
  };

  return (
    <Card header="Recommendation">
      <div className="space-y-3">
        <span
          className={[
            'inline-flex rounded-full px-3 py-1 text-sm font-semibold',
            badge.className,
          ].join(' ')}
        >
          {badge.label}
        </span>
        {needsManualReview && (
          <p className="text-sm font-medium text-amber-700">
            ⚠ Требуется manual review
          </p>
        )}
        {summary && <p className="text-sm text-slate-700">{summary}</p>}
        <p className="text-xs text-slate-500">
          Recommendation основана на checkpoint coverage, а не на свободной
          интерпретации ответа.
        </p>
      </div>
    </Card>
  );
}
