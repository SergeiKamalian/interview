import type { QuestionListItem } from '@entities/question/model/types';
import { Button } from '@shared/ui';

type QuestionPickerProps = {
  items: QuestionListItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
  isLoading?: boolean;
};

function truncate(text: string, max = 64): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function QuestionPicker({
  items,
  selectedIds,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
  isLoading,
}: QuestionPickerProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Загрузка вопросов…</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-2 text-sm font-medium text-slate-800">
          Доступные вопросы
        </h3>
        <ul className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="mt-1"
              />
              <div>
                <p className="text-slate-900">{truncate(item.questionText)}</p>
                <p className="text-xs text-slate-500">
                  {item.topic.name} · {item.level} · {item.difficulty}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-slate-800">
          Выбранные ({selectedIds.length})
        </h3>
        {selectedIds.length === 0 ? (
          <p className="text-sm text-slate-500">Выберите вопросы из банка.</p>
        ) : (
          <ul className="space-y-2">
            {selectedIds.map((id, index) => {
              const item = items.find((q) => q.id === id);
              if (!item) {
                return null;
              }

              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="text-slate-800">
                    {index + 1}. {truncate(item.questionText, 48)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveUp(id)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveDown(id)}
                      disabled={index === selectedIds.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(id)}
                    >
                      ✕
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
