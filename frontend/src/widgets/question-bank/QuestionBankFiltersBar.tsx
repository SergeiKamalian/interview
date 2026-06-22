import type {
  QuestionBankClientFilters,
  QuestionBankWeightTier,
} from '@entities/question/lib/filterQuestionBankItems';
import type {
  QuestionDifficulty,
  QuestionLevel,
} from '@entities/question/model/types';
import { Button, Input, SelectField } from '@shared/ui';

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
          <Input
            label="Поиск"
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder="Текст, стек, технология…"
          />
        </div>

        <SelectField
          label="Уровень"
          value={filters.level}
          onValueChange={(value) =>
            patch({ level: value as QuestionLevel | '' })
          }
          placeholder="Все уровни"
          options={[
            { value: '', label: 'Все уровни' },
            { value: 'junior', label: 'Junior' },
            { value: 'middle', label: 'Middle' },
            { value: 'senior', label: 'Senior' },
            { value: 'lead', label: 'Lead' },
          ]}
        />

        <SelectField
          label="Сложность"
          value={filters.difficulty}
          onValueChange={(value) =>
            patch({ difficulty: value as QuestionDifficulty | '' })
          }
          placeholder="Вся сложность"
          options={[
            { value: '', label: 'Вся сложность' },
            { value: 'basic', label: 'Базовый' },
            { value: 'intermediate', label: 'Средний' },
            { value: 'advanced', label: 'Продвинутый' },
          ]}
        />

        <SelectField
          label="Приоритет"
          value={filters.weightTier}
          onValueChange={(value) =>
            patch({ weightTier: value as QuestionBankWeightTier })
          }
          placeholder="Любой приоритет"
          options={[
            { value: '', label: 'Любой приоритет' },
            { value: 'low', label: '1–3 (низкий)' },
            { value: 'medium', label: '4–6 (средний)' },
            { value: 'high', label: '7–10 (высокий)' },
          ]}
        />

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
