import { Input, Label } from '@shared/ui';
import { RadioGroup, RadioGroupItem } from '@shared/ui/radio-group';
import { cn } from '@shared/lib/utils';
import type {
  AiTone,
  ProbingDepth,
  ScoringStrictness,
} from '@shared/api/graphql/generated/graphql';
import type { WizardStepProps } from './types';

type PresetOption<T extends string> = {
  value: T;
  title: string;
  description: string;
};

const TONE_OPTIONS: PresetOption<AiTone>[] = [
  {
    value: 'friendly',
    title: 'Дружелюбный',
    description: 'Подбадривает, снижает стресс кандидата.',
  },
  {
    value: 'neutral',
    title: 'Нейтральный',
    description: 'Ровно и по делу, без эмоций.',
  },
  {
    value: 'strict',
    title: 'Строгий',
    description: 'Challenging, ближе к стресс-интервью.',
  },
];

const DEPTH_OPTIONS: PresetOption<ProbingDepth>[] = [
  {
    value: 'shallow',
    title: 'Поверхностная',
    description: 'Скрининг, минимум уточняющих вопросов.',
  },
  {
    value: 'balanced',
    title: 'Сбалансированная',
    description: '1–2 уточнения на вопрос.',
  },
  {
    value: 'deep',
    title: 'Глубокая',
    description: 'Дожимает кандидата до границ знаний.',
  },
];

const STRICTNESS_OPTIONS: PresetOption<ScoringStrictness>[] = [
  {
    value: 'lenient',
    title: 'Мягкая',
    description: 'Засчитывает частичные ответы охотнее.',
  },
  {
    value: 'balanced',
    title: 'Сбалансированная',
    description: 'Стандартные пороги закрытия checkpoint.',
  },
  {
    value: 'strict',
    title: 'Строгая',
    description: 'Требует полного раскрытия критериев.',
  },
];

function PresetGroup<T extends string>(props: {
  label: string;
  description: string;
  options: PresetOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <Label className="text-sm font-semibold text-foreground">
          {props.label}
        </Label>
        <p className="text-xs text-muted-foreground">{props.description}</p>
      </div>
      <RadioGroup
        value={props.value}
        onValueChange={(value) => props.onChange(value as T)}
        className="grid gap-2 md:grid-cols-3"
      >
        {props.options.map((option) => {
          const selected = option.value === props.value;
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
  );
}

export function Step3Behavior({ data, update }: WizardStepProps) {
  return (
    <div className="space-y-8">
      <PresetGroup
        label="Тон общения"
        description="Как AI разговаривает с кандидатом."
        options={TONE_OPTIONS}
        value={data.aiTone}
        onChange={(value) => update({ aiTone: value })}
      />
      <PresetGroup
        label="Глубина копания"
        description="Сколько уточняющих вопросов задаёт AI."
        options={DEPTH_OPTIONS}
        value={data.probingDepth}
        onChange={(value) => update({ probingDepth: value })}
      />
      <PresetGroup
        label="Строгость оценки"
        description="Влияет на пороги закрытия checkpoint, не на max score."
        options={STRICTNESS_OPTIONS}
        value={data.scoringStrictness}
        onChange={(value) => update({ scoringStrictness: value })}
      />

      <div className="space-y-3 border-t border-border pt-6">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold text-foreground">
            Персона
          </Label>
          <p className="text-xs text-muted-foreground">
            Имя, которым AI представится кандидату.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Имя интервьюера"
            value={data.interviewerName}
            onChange={(event) =>
              update({ interviewerName: event.target.value })
            }
            placeholder="AI-интервьюер"
          />
        </div>
      </div>
    </div>
  );
}
