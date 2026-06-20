import { CalendarIcon } from 'lucide-react';
import { Input, Label } from '@shared/ui';
import { Button } from '@shared/ui/button';
import { Switch } from '@shared/ui/switch';
import { Calendar } from '@shared/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/ui/popover';
import type { WizardStepProps } from './types';

function formatDate(iso: string | null): string {
  if (!iso) {
    return 'Без дедлайна';
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'Без дедлайна'
    : date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
}

function ToggleRow(props: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Label className="flex items-center justify-between gap-4 rounded-lg border border-input p-3">
      <span className="space-y-0.5">
        <span className="block text-sm font-medium">{props.label}</span>
        <span className="block text-xs text-muted-foreground">
          {props.description}
        </span>
      </span>
      <Switch checked={props.checked} onCheckedChange={props.onChange} />
    </Label>
  );
}

export function Step5Access({ data, update }: WizardStepProps) {
  const selectedDate = data.expiresAt ? new Date(data.expiresAt) : undefined;

  const handleMaxCompletions = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      update({ maxCompletions: null });
      return;
    }
    const parsed = Number(trimmed);
    update({
      maxCompletions: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Дедлайн прохождения</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="secondary"
                  className="w-full justify-start font-normal"
                >
                  <CalendarIcon className="size-4" />
                  {formatDate(data.expiresAt)}
                </Button>
              }
            />
            <PopoverContent className="w-auto" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) =>
                  update({ expiresAt: date ? date.toISOString() : null })
                }
              />
              {data.expiresAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => update({ expiresAt: null })}
                >
                  Сбросить дедлайн
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <Input
          label="Макс. число завершённых прохождений"
          type="number"
          min={1}
          value={data.maxCompletions ?? ''}
          onChange={(event) => handleMaxCompletions(event.target.value)}
          placeholder="Без ограничения"
        />
      </div>

      <ToggleRow
        label="Разрешить пересдачу"
        description="Если выключено — один email = одна попытка."
        checked={data.allowRetake}
        onChange={(checked) => update({ allowRetake: checked })}
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Обязательные поля кандидата
        </Label>
        <p className="text-xs text-muted-foreground">
          Email обязателен всегда. Дополнительно можно требовать:
        </p>
        <div className="grid gap-2 md:grid-cols-3">
          <ToggleRow
            label="Телефон"
            description="phone"
            checked={data.requirePhone}
            onChange={(checked) => update({ requirePhone: checked })}
          />
          <ToggleRow
            label="LinkedIn"
            description="linkedin"
            checked={data.requireLinkedin}
            onChange={(checked) => update({ requireLinkedin: checked })}
          />
          <ToggleRow
            label="GitHub"
            description="github"
            checked={data.requireGithub}
            onChange={(checked) => update({ requireGithub: checked })}
          />
        </div>
      </div>
    </div>
  );
}
