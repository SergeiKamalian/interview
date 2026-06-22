import { PlusIcon, Trash2Icon } from 'lucide-react';
import {
  CHECKPOINT_WEIGHT_TARGET,
  formatCheckpointWeightTotal,
  isCheckpointWeightValid,
  sumCheckpointWeights,
} from '../lib/checkpointWeights';
import type { CheckpointFieldErrors } from '../lib/validateQuestionEditorForm';
import type { CheckpointFormRow } from '../model/types';
import { TagInput } from './TagInput';
import { Alert, Button, Input, Textarea } from '@shared/ui';
import { cn } from '@shared/lib/utils';

type CheckpointEditorProps = {
  checkpoints: CheckpointFormRow[];
  onChange: (checkpoints: CheckpointFormRow[]) => void;
  disabled?: boolean;
  fieldErrors?: Record<number, CheckpointFieldErrors>;
  weightError?: string;
};

export function CheckpointEditor({
  checkpoints,
  onChange,
  disabled = false,
  fieldErrors = {},
  weightError,
}: CheckpointEditorProps) {
  const total = sumCheckpointWeights(checkpoints);
  const weightValid = isCheckpointWeightValid(total);

  const patchCheckpoint = (
    index: number,
    partial: Partial<CheckpointFormRow>,
  ) => {
    onChange(
      checkpoints.map((checkpoint, checkpointIndex) =>
        checkpointIndex === index
          ? { ...checkpoint, ...partial }
          : checkpoint,
      ),
    );
  };

  const addCheckpoint = () => {
    onChange([
      ...checkpoints,
      {
        checkpointKey: '',
        title: '',
        expected: '',
        score: 0,
        sortOrder: checkpoints.length,
        mustConcepts: [],
        falseClaims: [],
      },
    ]);
  };

  const removeCheckpoint = (index: number) => {
    if (checkpoints.length <= 1) {
      return;
    }

    onChange(
      checkpoints
        .filter((_, checkpointIndex) => checkpointIndex !== index)
        .map((checkpoint, sortOrder) => ({ ...checkpoint, sortOrder })),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-foreground">Checkpoints</h3>
          <p className="text-xs text-muted-foreground">
            Сумма весов должна быть {CHECKPOINT_WEIGHT_TARGET.toFixed(0)}.
          </p>
        </div>
        <div
          className={cn(
            'rounded-md px-2.5 py-1 text-sm font-medium',
            weightValid
              ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-100'
              : 'bg-destructive/10 text-destructive',
          )}
        >
          Σ = {formatCheckpointWeightTotal(total)} / {CHECKPOINT_WEIGHT_TARGET}
        </div>
      </div>

      {!weightValid && (
        <Alert variant="error" title="Неверная сумма весов">
          {weightError ??
            `Сумма checkpoint weights должна быть равна ${CHECKPOINT_WEIGHT_TARGET}.`}
        </Alert>
      )}

      <div className="space-y-4">
        {checkpoints.map((checkpoint, index) => {
          const rowErrors = fieldErrors[index];
          return (
          <div
            key={`checkpoint-${index}`}
            className={cn(
              'space-y-3 rounded-lg border bg-card p-4',
              rowErrors ? 'border-destructive/50' : 'border-border',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                Checkpoint #{index + 1}
              </p>
              {!disabled && checkpoints.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCheckpoint(index)}
                >
                  <Trash2Icon className="size-4" />
                  Удалить
                </Button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Key (snake_case)"
                value={checkpoint.checkpointKey}
                onChange={(event) =>
                  patchCheckpoint(index, { checkpointKey: event.target.value })
                }
                placeholder="core_concept"
                disabled={disabled}
                error={rowErrors?.checkpointKey}
              />
              <Input
                label="Weight"
                type="number"
                min={0}
                step={0.1}
                value={String(checkpoint.score)}
                onChange={(event) =>
                  patchCheckpoint(index, {
                    score: Number(event.target.value) || 0,
                  })
                }
                disabled={disabled}
              />
            </div>

            <Input
              label="Title"
              value={checkpoint.title}
              onChange={(event) =>
                patchCheckpoint(index, { title: event.target.value })
              }
              disabled={disabled}
              error={rowErrors?.title}
            />

            <Textarea
              label="Expected"
              value={checkpoint.expected}
              onChange={(event) =>
                patchCheckpoint(index, { expected: event.target.value })
              }
              rows={2}
              disabled={disabled}
              error={rowErrors?.expected}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <TagInput
                label="Must concepts (green flags)"
                values={checkpoint.mustConcepts}
                onChange={(mustConcepts) =>
                  patchCheckpoint(index, { mustConcepts })
                }
                placeholder="redux, immutability"
                disabled={disabled}
              />
              <TagInput
                label="False claims (red flags)"
                values={checkpoint.falseClaims}
                onChange={(falseClaims) =>
                  patchCheckpoint(index, { falseClaims })
                }
                placeholder="react is a database"
                disabled={disabled}
              />
            </div>
          </div>
          );
        })}
      </div>

      {!disabled && (
        <Button type="button" variant="secondary" onClick={addCheckpoint}>
          <PlusIcon className="size-4" />
          Добавить checkpoint
        </Button>
      )}
    </div>
  );
}
