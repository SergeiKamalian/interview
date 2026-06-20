import { Label } from '@shared/ui';
import { Switch } from '@shared/ui/switch';
import { Slider } from '@shared/ui/slider';
import type { WizardStepProps } from './types';

const DEFAULT_PASSING_SCORE = 6;

export function Step6Results({ data, update }: WizardStepProps) {
  const enabled = data.passingScore != null;
  const value = data.passingScore ?? DEFAULT_PASSING_SCORE;

  return (
    <div className="space-y-6">
      <Label className="flex items-center justify-between gap-4 rounded-lg border border-input p-3">
        <span className="space-y-0.5">
          <span className="block text-sm font-medium">Проходной балл</span>
          <span className="block text-xs text-muted-foreground">
            Кандидаты ниже порога помечаются «не прошли».
          </span>
        </span>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) =>
            update({ passingScore: checked ? DEFAULT_PASSING_SCORE : null })
          }
        />
      </Label>

      {enabled && (
        <div className="space-y-3 rounded-lg border border-input p-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Порог</Label>
            <span className="text-sm font-semibold tabular-nums">
              {value.toFixed(1)} / 10
            </span>
          </div>
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={[value]}
            onValueChange={(next) => {
              const score = Array.isArray(next) ? next[0] : next;
              update({ passingScore: score });
            }}
          />
        </div>
      )}
    </div>
  );
}
