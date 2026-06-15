import { useMemo, useState } from 'react';
import { Card } from '@shared/ui';

type CheckpointItem = {
  id: string;
  checkpointKey: string;
  checkpointTitle: string;
  status: string;
  scoreAwarded: number;
  maxScore: number;
  evidenceQuote?: string | null;
  reasoningShort?: string | null;
};

type QuestionGroup = {
  interviewQuestionId: string;
  questionText: string;
  needsManualReview: boolean;
  checkpoints: CheckpointItem[];
};

type CheckpointResultsPanelProps = {
  questionGroups: QuestionGroup[];
  onCheckpointClick?: (messageHint: string) => void;
};

const STATUS_STYLES: Record<string, string> = {
  met: 'bg-green-100 text-green-800',
  partially_met: 'bg-amber-100 text-amber-800',
  not_met: 'bg-red-100 text-red-800',
};

export function CheckpointResultsPanel({
  questionGroups,
  onCheckpointClick,
}: CheckpointResultsPanelProps) {
  const [issuesOnly, setIssuesOnly] = useState(false);

  const filteredGroups = useMemo(() => {
    if (!issuesOnly) return questionGroups;

    return questionGroups
      .map((group) => ({
        ...group,
        checkpoints: group.checkpoints.filter(
          (cp) => cp.status === 'not_met' || cp.status === 'partially_met',
        ),
      }))
      .filter((group) => group.checkpoints.length > 0);
  }, [questionGroups, issuesOnly]);

  if (questionGroups.length === 0) {
    return (
      <Card header="Checkpoint results">
        <p className="text-sm text-slate-500">Результаты checkpoint пока недоступны.</p>
      </Card>
    );
  }

  return (
    <Card header="Checkpoint results">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={issuesOnly}
            onChange={(event) => setIssuesOnly(event.target.checked)}
          />
          Только проблемные checkpoints
        </label>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">met</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">partially</span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">not met</span>
        </div>
      </div>

      <div className="space-y-5">
        {filteredGroups.map((group) => (
          <section key={group.interviewQuestionId} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-slate-900">{group.questionText}</h4>
              {group.needsManualReview && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  manual review
                </span>
              )}
            </div>
            <div className="space-y-2">
              {group.checkpoints.map((checkpoint) => (
                <button
                  key={checkpoint.id}
                  type="button"
                  className="w-full rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100"
                  onClick={() =>
                    onCheckpointClick?.(checkpoint.evidenceQuote ?? checkpoint.checkpointTitle)
                  }
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{checkpoint.checkpointTitle}</span>
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        STATUS_STYLES[checkpoint.status] ?? 'bg-slate-100 text-slate-700',
                      ].join(' ')}
                    >
                      {checkpoint.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {checkpoint.scoreAwarded}/{checkpoint.maxScore} · {checkpoint.reasoningShort}
                  </p>
                  {checkpoint.evidenceQuote && (
                    <p className="mt-1 text-xs italic text-slate-500">
                      “{checkpoint.evidenceQuote}”
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Card>
  );
}
