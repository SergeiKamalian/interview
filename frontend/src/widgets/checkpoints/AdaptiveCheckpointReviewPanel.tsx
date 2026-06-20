import { useState } from 'react';
import {
  Badge,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@shared/ui';
import type { VariantProps } from 'class-variance-authority';

import { badgeVariants } from '@shared/ui/badge';

type CheckpointItem = {
  checkpointKey: string;
  checkpointTitle: string;
  status: string;
  scoreAwarded: number;
  maxScore: number;
  rationale?: string | null;
  evidenceSummary?: string | null;
  confidence?: number | null;
  needsManualReview: boolean;
  depthLabel: string;
  coveragePercent: number;
  accuracyPercent: number;
};

type QuestionGroup = {
  interviewQuestionId: string;
  questionText: string;
  idealAnswer?: string | null;
  needsManualReview: boolean;
  checkpoints: CheckpointItem[];
};

type RedFlag = {
  checkpointKey: string;
  checkpointTitle: string;
  summary: string;
  candidateQuote?: string | null;
  severity: string;
};

type AdaptiveCheckpointReviewPanelProps = {
  review: {
    needsManualReview: boolean;
    redFlags: RedFlag[];
    questionGroups: QuestionGroup[];
  };
};

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  covered: 'success',
  partial: 'warning',
  missed: 'destructive',
  unclear: 'muted',
  unseen: 'muted',
};

const STATUS_LABELS: Record<string, string> = {
  covered: 'закрыт',
  partial: 'частично',
  missed: 'не закрыт',
  unclear: 'неясно',
  unseen: 'не затронут',
};

const DEPTH_VARIANTS: Record<string, BadgeVariant> = {
  Упомянул: 'muted',
  Слышал: 'yellow',
  'Знает поверхностно': 'orange',
  Понимает: 'info',
  Знает: 'success',
  'Ошибается уверенно': 'destructive',
  'Не затронул': 'muted',
};

/** depthLabel from API when checkpoint was not addressed in the answer. */
function resolveDepthLabel(checkpoint: CheckpointItem): string {
  if (
    checkpoint.depthLabel === 'Не оценено' &&
    (checkpoint.status === 'missed' || checkpoint.status === 'unclear')
  ) {
    return 'Не затронул';
  }

  return checkpoint.depthLabel;
}

type AiConfidenceLevel = 'high' | 'medium' | 'low';

function resolveAiConfidenceLevel(
  confidence: number | null | undefined,
): AiConfidenceLevel | null {
  if (confidence === null || confidence === undefined) {
    return null;
  }

  if (confidence >= 0.85) {
    return 'high';
  }

  if (confidence >= 0.6) {
    return 'medium';
  }

  return 'low';
}

function aiConfidenceVariant(level: AiConfidenceLevel): BadgeVariant {
  switch (level) {
    case 'high':
      return 'muted';
    case 'medium':
      return 'warning';
    case 'low':
      return 'orange';
  }
}

function formatAiEvaluationConfidence(confidence: number): string {
  const percent = (confidence * 100).toFixed(0);
  const level = resolveAiConfidenceLevel(confidence);

  switch (level) {
    case 'high':
      return `Уверенность ИИ в оценке: ${percent}% (высокая)`;
    case 'medium':
      return `Уверенность ИИ в оценке: ${percent}% (средняя)`;
    case 'low':
      return `Уверенность ИИ в оценке: ${percent}% (низкая)`;
    default:
      return `Уверенность ИИ в оценке: ${percent}%`;
  }
}

function AxisBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CheckpointEvaluationCard({ checkpoint }: { checkpoint: CheckpointItem }) {
  const [expanded, setExpanded] = useState(false);
  const depthLabel = resolveDepthLabel(checkpoint);
  const aiConfidenceLevel = resolveAiConfidenceLevel(checkpoint.confidence);

  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-foreground">{checkpoint.checkpointTitle}</span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANTS[checkpoint.status] ?? 'muted'}>
              {STATUS_LABELS[checkpoint.status] ?? checkpoint.status}
            </Badge>
            <Badge variant={DEPTH_VARIANTS[depthLabel] ?? 'muted'}>{depthLabel}</Badge>
          </div>
        </div>

        <div className="mb-2 grid gap-2 sm:grid-cols-2">
          <AxisBar
            label="Покрытие темы"
            value={checkpoint.coveragePercent}
            tone="bg-sky-500"
          />
          <AxisBar
            label="Точность объяснения"
            value={checkpoint.accuracyPercent}
            tone="bg-emerald-500"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Балл: {checkpoint.scoreAwarded}/{checkpoint.maxScore}
          {aiConfidenceLevel !== null &&
            checkpoint.confidence !== null &&
            checkpoint.confidence !== undefined && (
            <Badge
              variant={aiConfidenceVariant(aiConfidenceLevel)}
              className="ml-2"
              title="Насколько ИИ уверен в выставленном статусе и балле — не уровень знаний кандидата."
            >
              {formatAiEvaluationConfidence(checkpoint.confidence)}
            </Badge>
          )}
          {checkpoint.needsManualReview && (
            <Badge variant="warning" className="ml-2">ручная проверка</Badge>
          )}
        </p>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 border-t border-border pt-2 text-xs text-muted-foreground">
          {checkpoint.rationale && <p>{checkpoint.rationale}</p>}
          {checkpoint.evidenceSummary && (
            <p className="italic text-muted-foreground">“{checkpoint.evidenceSummary}”</p>
          )}
        </div>
      )}
    </div>
  );
}

export function AdaptiveCheckpointReviewPanel({
  review,
}: AdaptiveCheckpointReviewPanelProps) {
  if (review.questionGroups.length === 0) {
    return (
      <Card header="Оценка по критериям">
        <p className="text-sm text-muted-foreground">
          Отчёт по критериям появится после ответов кандидата.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {review.redFlags.length > 0 && (
        <Card header={`Красные флаги (${review.redFlags.length})`}>
          <ul className="space-y-2 text-sm">
            {review.redFlags.map((flag) => (
              <li
                key={`${flag.checkpointKey}-${flag.summary}`}
                className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2"
              >
                <p className="font-medium text-foreground">
                  {flag.checkpointTitle}: {flag.summary}
                </p>
                {flag.candidateQuote && (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    “{flag.candidateQuote}”
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card header="Оценка по критериям">
        {review.needsManualReview && (
          <p className="mb-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
            Рекомендуется ручная проверка: у части критериев низкая уверенность ИИ в
            оценке.
          </p>
        )}

        <div className="mb-4 space-y-1 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Глубина ответа:</span> Упомянул ·
            Слышал · Знает поверхностно · Понимает · Знает · Ошибается уверенно · Не
            затронул
          </p>
          <p>
            <span className="font-medium text-foreground">Уверенность ИИ</span> — насколько
            модель уверена в своей оценке критерия (статус и балл), а не насколько
            хорошо кандидат знает тему. Высокая уверенность при незакрытом критерии означает «ИИ
            уверен, что критерий не выполнен».
          </p>
        </div>

        <div className="space-y-5">
          {review.questionGroups.map((group) => (
            <section
              key={group.interviewQuestionId}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-foreground">{group.questionText}</h4>
                {group.needsManualReview && (
                  <Badge variant="warning">ручная проверка</Badge>
                )}
              </div>

              <Collapsible className="mb-3 rounded-md border border-border bg-card px-3 py-2 text-sm">
                <CollapsibleTrigger className="cursor-pointer font-medium text-foreground">
                  Эталонный ответ
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 whitespace-pre-wrap text-muted-foreground">
                  {group.idealAnswer || 'Эталонный ответ недоступен.'}
                </CollapsibleContent>
              </Collapsible>

              <div className="space-y-2">
                {group.checkpoints.map((checkpoint) => (
                  <CheckpointEvaluationCard
                    key={checkpoint.checkpointKey}
                    checkpoint={checkpoint}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}
