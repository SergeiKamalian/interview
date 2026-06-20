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

function checkpointStatusLabel(status: string) {
  switch (status) {
    case 'met':
      return 'закрыт';
    case 'partially_met':
      return 'частично';
    case 'not_met':
      return 'не закрыт';
    default:
      return status;
  }
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
      <Card header="Результаты по критериям">
        <p className="text-sm text-muted-foreground">
          Результаты по критериям пока недоступны.
        </p>
      </Card>
    );
  }

  return (
    <Card header="Результаты по критериям">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <CheckboxField
          label="Только проблемные критерии"
          checked={issuesOnly}
          onCheckedChange={setIssuesOnly}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="success">закрыт</Badge>
          <Badge variant="warning">частично</Badge>
          <Badge variant="destructive">не закрыт</Badge>
        </div>
      </div>

      <div className="space-y-5">
        {filteredGroups.map((group) => (
          <section
            key={group.interviewQuestionId}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-foreground">{group.questionText}</h4>
              {group.needsManualReview && (
                <Badge variant="warning">ручная проверка</Badge>
              )}
            </div>
            <div className="space-y-2">
              {group.checkpoints.map((checkpoint) => (
                <button
                  key={checkpoint.id}
                  type="button"
                  className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                  onClick={() =>
                    onCheckpointClick?.(checkpoint.evidenceQuote ?? checkpoint.checkpointTitle)
                  }
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {checkpoint.checkpointTitle}
                    </span>
                    <Badge variant={checkpointStatusVariant(checkpoint.status)}>
                      {checkpointStatusLabel(checkpoint.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {checkpoint.scoreAwarded}/{checkpoint.maxScore} · {checkpoint.reasoningShort}
                  </p>
                  {checkpoint.evidenceQuote && (
                    <p className="mt-1 text-xs italic text-muted-foreground">
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
