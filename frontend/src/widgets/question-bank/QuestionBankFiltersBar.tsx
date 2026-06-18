import type {
  QuestionBankClientFilters,
  QuestionBankWeightTier,
} from '@entities/question/lib/filterQuestionBankItems';
import type {
  QuestionDifficulty,
  QuestionLevel,
} from '@entities/question/model/types';
import { Button, Input } from '@shared/ui';

const selectClassName =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-blue-200';

type QuestionBankFiltersBarProps = {
  filters: QuestionBankClientFilters;
  onChange: (filters: QuestionBankClientFilters) => void;
  onRefresh: () => void;
  onReset: () => void;
  showReset: boolean;
};

export function QuestionBankFiltersBar({
  filters,
  onChange,
  onRefresh,
  onReset,
  showReset,
}: QuestionBankFiltersBarProps) {
  const patch = (partial: Partial<QuestionBankClientFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="md:col-span-2 xl:col-span-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Поиск
          </label>
          <Input
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder="Текст, тема, технология…"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Уровень
          </label>
          <select
            className={selectClassName}
            value={filters.level}
            onChange={(event) =>
              patch({ level: event.target.value as QuestionLevel | '' })
            }
          >
            <option value="">Все уровни</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Сложность
          </label>
          <select
            className={selectClassName}
            value={filters.difficulty}
            onChange={(event) =>
              patch({ difficulty: event.target.value as QuestionDifficulty | '' })
            }
          >
            <option value="">Вся сложность</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Weight
          </label>
          <select
            className={selectClassName}
            value={filters.weightTier}
            onChange={(event) =>
              patch({
                weightTier: event.target.value as QuestionBankWeightTier,
              })
            }
          >
            <option value="">Любой weight</option>
            <option value="low">1–3 (низкий)</option>
            <option value="medium">4–6 (средний)</option>
            <option value="high">7–10 (высокий)</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button variant="secondary" onClick={onRefresh} className="flex-1">
            Обновить
          </Button>
          {showReset && (
            <Button variant="ghost" onClick={onReset} className="shrink-0">
              Сбросить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
