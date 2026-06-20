import { Card } from "@shared/ui";

type BreakdownItem = {
  categoryKey: string;
  categoryLabel: string;
  scoreNormalized: number;
  contribution: number;
};

type CategoryBreakdownChartProps = {
  items: BreakdownItem[];
};

export function CategoryBreakdownChart({ items }: CategoryBreakdownChartProps) {
  if (items.length === 0) {
    return (
      <Card header="Category breakdown">
        <p className="text-sm text-slate-500">Нет данных для разбивки.</p>
      </Card>
    );
  }

  return (
    <Card header="Category breakdown">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.categoryKey}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-slate-800">
                {item.categoryLabel}
              </span>
              <span className="text-slate-600 whitespace-nowrap">
                {item.scoreNormalized.toFixed(0)}% · +
                {item.contribution.toFixed(1)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-primary"
                style={{ width: `${Math.min(item.scoreNormalized, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
