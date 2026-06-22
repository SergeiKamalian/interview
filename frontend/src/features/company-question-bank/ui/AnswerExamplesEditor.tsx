import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { AnswerExampleFormRow } from '../model/types';
import { Button, SelectField, Textarea } from '@shared/ui';

type AnswerExamplesEditorProps = {
  examples: AnswerExampleFormRow[];
  onChange: (examples: AnswerExampleFormRow[]) => void;
  disabled?: boolean;
};

export function AnswerExamplesEditor({
  examples,
  onChange,
  disabled = false,
}: AnswerExamplesEditorProps) {
  const patchExample = (
    index: number,
    partial: Partial<AnswerExampleFormRow>,
  ) => {
    onChange(
      examples.map((example, exampleIndex) =>
        exampleIndex === index ? { ...example, ...partial } : example,
      ),
    );
  };

  const addExample = () => {
    onChange([
      ...examples,
      {
        exampleType: 'good',
        exampleText: '',
        sortOrder: examples.length,
      },
    ]);
  };

  const removeExample = (index: number) => {
    onChange(
      examples
        .filter((_, exampleIndex) => exampleIndex !== index)
        .map((example, sortOrder) => ({ ...example, sortOrder })),
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">
          Примеры ответов
        </h3>
        <p className="text-xs text-muted-foreground">
          Good/bad examples для калибровки оценщика.
        </p>
      </div>

      {examples.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Примеры не заданы — можно добавить позже.
        </p>
      )}

      <div className="space-y-3">
        {examples.map((example, index) => (
          <div
            key={`example-${index}`}
            className="space-y-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                Пример #{index + 1}
              </p>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExample(index)}
                >
                  <Trash2Icon className="size-4" />
                  Удалить
                </Button>
              )}
            </div>

            <SelectField
              label="Тип"
              value={example.exampleType}
              onValueChange={(value) =>
                patchExample(index, {
                  exampleType: value as AnswerExampleFormRow['exampleType'],
                })
              }
              options={[
                { value: 'good', label: 'Good' },
                { value: 'bad', label: 'Bad' },
              ]}
            />

            <Textarea
              label="Текст примера"
              value={example.exampleText}
              onChange={(event) =>
                patchExample(index, { exampleText: event.target.value })
              }
              rows={3}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {!disabled && (
        <Button type="button" variant="secondary" onClick={addExample}>
          <PlusIcon className="size-4" />
          Добавить пример
        </Button>
      )}
    </div>
  );
}
