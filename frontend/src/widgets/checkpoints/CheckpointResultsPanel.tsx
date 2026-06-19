import { useMemo, useState } from 'react';
import { Badge, Card, CheckboxField } from '@shared/ui';

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

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'destructive' | 'muted'> = {
  met: 'success',
  partially_met: 'warning',
  not_met: 'destructive',
};

function checkpointStatusVariant(status: string) {
  return STATUS_VARIANTS[status] ?? 'muted';
}

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
        <CheckboxField
          label="Только проблемные checkpoints"
          checked={issuesOnly}
          onCheckedChange={setIssuesOnly}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="success">met</Badge>
          <Badge variant="warning">partially</Badge>
          <Badge variant="destructive">not met</Badge>
        </div>
      </div>

      <div className="space-y-5">
        {filteredGroups.map((group) => (
          <section key={group.interviewQuestionId} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-slate-900">{group.questionText}</h4>
              {group.needsManualReview && (
                <Badge variant="warning">manual review</Badge>
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
                    <Badge variant={checkpointStatusVariant(checkpoint.status)}>
                      {checkpoint.status}
                    </Badge>
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
