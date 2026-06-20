import type { ReactNode } from 'react';
import { Badge } from '@shared/ui';
import { levelBadgeVariant } from '@entities/question/lib/questionBadgeVariants';
import { SaveAsTemplateDialog } from '../SaveAsTemplateDialog';
import type { WizardStepProps } from './types';

const TONE_LABELS: Record<string, string> = {
  friendly: 'Дружелюбный',
  neutral: 'Нейтральный',
  strict: 'Строгий',
};
const DEPTH_LABELS: Record<string, string> = {
  shallow: 'Поверхностная',
  balanced: 'Сбалансированная',
  deep: 'Глубокая',
};
const STRICTNESS_LABELS: Record<string, string> = {
  lenient: 'Мягкая',
  balanced: 'Сбалансированная',
  strict: 'Строгая',
};
const MODE_LABELS: Record<string, string> = {
  text: 'Текст',
  voice: 'Голос',
  video: 'Видео',
};
const TONE_VARIANTS: Record<string, 'success' | 'secondary' | 'orange'> = {
  friendly: 'success',
  neutral: 'secondary',
  strict: 'orange',
};

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

export function Step7Review({ data }: WizardStepProps) {
  const required = [
    'email',
    data.requirePhone ? 'phone' : null,
    data.requireLinkedin ? 'linkedin' : null,
    data.requireGithub ? 'github' : null,
  ].filter(Boolean) as string[];

  const canSaveTemplate =
    data.title.trim().length > 0 &&
    data.jobRole.trim().length > 0 &&
    data.questionIds.length > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Проверьте настройки. После публикации сгенерируется публичная ссылка для
        кандидатов.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Вакансия">
          <Row label="Название" value={data.title || '—'} />
          <Row label="Роль" value={data.jobRole || '—'} />
          <Row
            label="Уровень"
            value={
              <Badge variant={levelBadgeVariant(data.level)}>{data.level}</Badge>
            }
          />
          <Row label="Язык" value={data.interviewLanguage} />
          <Row
            label="Навыки"
            value={
              data.skillIds.length > 0 ? `${data.skillIds.length} выбрано` : '—'
            }
          />
          <Row
            label="Вопросов"
            value={
              <Badge variant={data.questionIds.length > 0 ? 'success' : 'muted'}>
                {data.questionIds.length}
              </Badge>
            }
          />
        </Section>

        <Section title="Поведение AI">
          <Row
            label="Тон"
            value={
              <Badge variant={TONE_VARIANTS[data.aiTone] ?? 'secondary'}>
                {TONE_LABELS[data.aiTone] ?? data.aiTone}
              </Badge>
            }
          />
          <Row
            label="Глубина"
            value={DEPTH_LABELS[data.probingDepth] ?? data.probingDepth}
          />
          <Row
            label="Строгость"
            value={
              STRICTNESS_LABELS[data.scoringStrictness] ??
              data.scoringStrictness
            }
          />
          <Row
            label="Интервьюер"
            value={data.interviewerName || 'AI-интервьюер'}
          />
        </Section>

        <Section title="Формат и доступ">
          <Row
            label="Режим"
            value={
              <Badge variant="info">
                {MODE_LABELS[data.mode] ?? data.mode}
              </Badge>
            }
          />
          <Row
            label="Лимит времени"
            value={
              data.timeLimitMinutes
                ? `${data.timeLimitMinutes} мин`
                : 'Без лимита'
            }
          />
          <Row
            label="Дедлайн"
            value={
              data.expiresAt
                ? new Date(data.expiresAt).toLocaleDateString('ru-RU')
                : 'Без дедлайна'
            }
          />
          <Row
            label="Кап прохождений"
            value={data.maxCompletions ?? 'Без ограничения'}
          />
          <Row
            label="Пересдача"
            value={data.allowRetake ? 'Разрешена' : 'Запрещена'}
          />
        </Section>

        <Section title="Результаты и кандидат">
          <Row
            label="Проходной балл"
            value={
              data.passingScore != null ? `${data.passingScore} / 10` : '—'
            }
          />
          <Row
            label="Обязательные поля"
            value={
              <span className="flex flex-wrap justify-end gap-1">
                {required.map((field) => (
                  <Badge key={field} variant="secondary">
                    {field}
                  </Badge>
                ))}
              </span>
            }
          />
        </Section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <div className="max-w-md space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Переиспользовать эти настройки?
          </p>
          <p className="text-xs text-muted-foreground">
            Сохраните набор как шаблон — потом создавайте интервью «Из шаблона» в
            один клик. Шаблон не создаёт интервью, только предзаполняет визард.
          </p>
        </div>
        <SaveAsTemplateDialog data={data} disabled={!canSaveTemplate} />
      </div>
    </div>
  );
}
