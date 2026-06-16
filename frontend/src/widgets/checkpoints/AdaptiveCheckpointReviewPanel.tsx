import { useState } from 'react';
import { Card } from '@shared/ui';

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

const STATUS_STYLES: Record<string, string> = {
  covered: 'bg-green-100 text-green-800',
  partial: 'bg-amber-100 text-amber-800',
  missed: 'bg-red-100 text-red-800',
  unclear: 'bg-slate-100 text-slate-700',
  unseen: 'bg-slate-100 text-slate-600',
};

const DEPTH_STYLES: Record<string, string> = {
  Упомянул: 'bg-slate-100 text-slate-700',
  Слышал: 'bg-yellow-100 text-yellow-800',
  'Знает поверхностно': 'bg-orange-100 text-orange-800',
  Понимает: 'bg-blue-100 text-blue-800',
  Знает: 'bg-green-100 text-green-800',
  'Ошибается уверенно': 'bg-red-100 text-red-800',
};

function confidenceStyle(confidence: number | null | undefined): string {
  if (confidence === null || confidence === undefined) {
    return 'text-slate-500';
  }

  if (confidence >= 0.85) {
    return 'text-green-700';
  }

  if (confidence >= 0.6) {
    return 'text-amber-700';
  }

  return 'text-red-700';
}

function AxisBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CheckpointEvaluationCard({ checkpoint }: { checkpoint: CheckpointItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-slate-800">{checkpoint.checkpointTitle}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                'rounded-full px-2 py-0.5 text-xs font-medium',
                STATUS_STYLES[checkpoint.status] ?? 'bg-slate-100 text-slate-700',
              ].join(' ')}
            >
              {checkpoint.status}
            </span>
            <span
              className={[
                'rounded-full px-2 py-0.5 text-xs font-medium',
                DEPTH_STYLES[checkpoint.depthLabel] ?? 'bg-slate-100 text-slate-700',
              ].join(' ')}
            >
              {checkpoint.depthLabel}
            </span>
          </div>
        </div>

        <div className="mb-2 grid gap-2 sm:grid-cols-2">
          <AxisBar label="Coverage" value={checkpoint.coveragePercent} tone="bg-sky-500" />
          <AxisBar label="Accuracy" value={checkpoint.accuracyPercent} tone="bg-emerald-500" />
        </div>

        <p className="text-xs text-slate-600">
          {checkpoint.scoreAwarded}/{checkpoint.maxScore}
          {checkpoint.confidence !== null && checkpoint.confidence !== undefined && (
            <span className={`ml-2 ${confidenceStyle(checkpoint.confidence)}`}>
              confidence {(checkpoint.confidence * 100).toFixed(0)}%
            </span>
          )}
          {checkpoint.needsManualReview && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
              ручная проверка
            </span>
          )}
        </p>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 border-t border-slate-200 pt-2 text-xs text-slate-600">
          {checkpoint.rationale && <p>{checkpoint.rationale}</p>}
          {checkpoint.evidenceSummary && (
            <p className="italic text-slate-500">“{checkpoint.evidenceSummary}”</p>
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
        <p className="text-sm text-slate-500">
          Per-checkpoint отчёт появится после ответов кандидата.
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
                className="rounded-md border border-red-100 bg-red-50 px-3 py-2"
              >
                <p className="font-medium text-red-900">
                  {flag.checkpointTitle}: {flag.summary}
                </p>
                {flag.candidateQuote && (
                  <p className="mt-1 text-xs italic text-red-700">
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
          <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Рекомендуется ручная проверка: есть checkpoints с низкой уверенностью AI.
          </p>
        )}

        <p className="mb-4 text-xs text-slate-500">
          Легенда глубины: Упомянул · Слышал · Знает поверхностно · Понимает · Знает ·
          Ошибается уверенно
        </p>

        <div className="space-y-5">
          {review.questionGroups.map((group) => (
            <section
              key={group.interviewQuestionId}
              className="rounded-lg border border-slate-200 p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-slate-900">{group.questionText}</h4>
                {group.needsManualReview && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    manual review
                  </span>
                )}
              </div>

              <details className="mb-3 rounded-md border border-slate-100 bg-white px-3 py-2 text-sm">
                <summary className="cursor-pointer font-medium text-slate-700">
                  Эталонный ответ
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">
                  {group.idealAnswer || 'Эталонный ответ недоступен.'}
                </p>
              </details>

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
