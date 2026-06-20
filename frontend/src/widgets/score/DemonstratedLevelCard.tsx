import { Badge, Card } from '@shared/ui';

type LevelBreakdownItem = {
  level: string;
  earned: number;
  maxScore: number;
  ratio: number;
  passed: boolean;
};

type DemonstratedLevelCardProps = {
  targetLevel?: string | null;
  achievedLevel?: string | null;
  achievedLevelMethod?: string | null;
  achievedLevelNote?: string | null;
  levelBreakdown?: LevelBreakdownItem[];
};

const LEVEL_LABELS: Record<string, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

function levelLabel(level?: string | null): string {
  if (!level) {
    return '—';
  }
  return LEVEL_LABELS[level] ?? level;
}

export function DemonstratedLevelCard({
  targetLevel,
  achievedLevel,
  achievedLevelMethod,
  achievedLevelNote,
  levelBreakdown = [],
}: DemonstratedLevelCardProps) {
  const isEstimate = achievedLevelMethod === 'estimate';

  return (
    <Card header="Demonstrated level">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Target</span>
          <Badge variant="muted">{levelLabel(targetLevel)}</Badge>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">Demonstrated</span>
          <Badge variant={achievedLevel ? 'success' : 'warning'}>
            {levelLabel(achievedLevel)}
          </Badge>
          {isEstimate && (
            <Badge variant="warning">оценка приблизительная</Badge>
          )}
        </div>

        {isEstimate && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {achievedLevelNote ??
              'Точный уровень не подтверждён. Добавьте вопросы нижнего уровня для калибровки.'}
          </p>
        )}

        {levelBreakdown.length > 0 ? (
          <div className="space-y-3">
            {levelBreakdown.map((item) => (
              <div key={item.level}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-800">
                    {levelLabel(item.level)}
                    {item.passed ? (
                      <Badge variant="success" className="ml-2">
                        passed
                      </Badge>
                    ) : (
                      <Badge variant="muted" className="ml-2">
                        not passed
                      </Badge>
                    )}
                  </span>
                  <span className="text-slate-600">
                    {item.earned.toFixed(1)} / {item.maxScore.toFixed(1)} ·{' '}
                    {Math.round(item.ratio * 100)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={
                      item.passed
                        ? 'h-full rounded-full bg-green-500'
                        : 'h-full rounded-full bg-amber-400'
                    }
                    style={{
                      width: `${Math.min(Math.max(item.ratio * 100, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Разбивка по уровням пока недоступна.
          </p>
        )}
      </div>
    </Card>
  );
}
