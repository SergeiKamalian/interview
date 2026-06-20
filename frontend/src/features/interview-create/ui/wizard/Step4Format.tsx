import { Input, Label } from '@shared/ui';
import { RadioGroup, RadioGroupItem } from '@shared/ui/radio-group';
import { cn } from '@shared/lib/utils';
import type { InterviewMode } from '../../model/interviewWizard';
import type { WizardStepProps } from './types';

const MODE_OPTIONS: { value: InterviewMode; title: string; description: string }[] =
  [
    {
      value: 'text',
      title: 'Текст',
      description: 'Кандидат отвечает текстом.',
    },
    {
      value: 'voice',
      title: 'Голос',
      description: 'Голосовые ответы + запись аудио.',
    },
    {
      value: 'video',
      title: 'Видео',
      description: 'Видеоинтервью с записью.',
    },
  ];

export function Step4Format({ data, update }: WizardStepProps) {
  const handleTimeLimit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      update({ timeLimitMinutes: null });
      return;
    }
    const parsed = Number(trimmed);
    update({
      timeLimitMinutes: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold text-foreground">
            Режим интервью
          </Label>
          <p className="text-xs text-muted-foreground">
            Как кандидат отвечает на вопросы.
          </p>
        </div>
        <RadioGroup
          value={data.mode}
          onValueChange={(value) => update({ mode: value as InterviewMode })}
          className="grid gap-2 md:grid-cols-3"
        >
          {MODE_OPTIONS.map((option) => {
            const selected = option.value === data.mode;
            return (
              <Label
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors',
                  selected
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-input hover:bg-accent/40',
                )}
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium">
                    {option.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Лимит времени на интервью (минуты)"
          type="number"
          min={1}
          value={data.timeLimitMinutes ?? ''}
          onChange={(event) => handleTimeLimit(event.target.value)}
          placeholder="Без лимита"
        />
      </div>
    </div>
  );
}
