import { Card } from '@shared/ui';

type OverallScoreCardProps = {
  score?: number | null;
  maxScore?: number;
  loading?: boolean;
};

function scoreZone(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

export function OverallScoreCard({
  score,
  maxScore = 100,
  loading = false,
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

  const normalized = (score / maxScore) * 100;

  return (
    <Card header="Overall score">
      <div
        className={[
          'inline-flex items-baseline gap-2 rounded-lg border px-4 py-3',
          scoreZone(normalized),
        ].join(' ')}
      >
        <span className="text-3xl font-semibold">{normalized.toFixed(0)}</span>
        <span className="text-sm">/ 100</span>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Score рассчитан по structured checkpoints из question bank, не по
        свободному тексту AI.
      </p>
    </Card>
  );
}
