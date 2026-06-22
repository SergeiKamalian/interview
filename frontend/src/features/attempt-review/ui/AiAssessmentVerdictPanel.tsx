import { useState } from 'react';
import {
  useSetAttemptAiVerdictMutation,
} from '@entities/candidate/api/attemptReviewApi';
import { Badge, Button, Card, Input } from '@shared/ui';
import { formatUnixDate } from '@shared/lib/format';
import { cn } from '@shared/lib/utils';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

type AiAssessmentVerdictPanelProps = {
  attemptId: string;
  aiAssessmentVerdict: string;
  reviewedAt?: number | null;
  evaluationReady: boolean;
};

function verdictLabel(value: string): string {
  if (value === 'agree') {
    return 'Согласны с ИИ';
  }

  if (value === 'disagree') {
    return 'Не согласны с ИИ';
  }

  return 'Ожидает вашей оценки';
}

function verdictVariant(value: string): 'success' | 'destructive' | 'warning' {
  if (value === 'agree') {
    return 'success';
  }

  if (value === 'disagree') {
    return 'destructive';
  }

  return 'warning';
}

export function AiAssessmentVerdictPanel({
  attemptId,
  aiAssessmentVerdict,
  reviewedAt,
  evaluationReady,
}: AiAssessmentVerdictPanelProps) {
  const [reason, setReason] = useState('');
  const [setVerdict, { isLoading }] = useSetAttemptAiVerdictMutation();
  const hasVerdict =
    aiAssessmentVerdict === 'agree' || aiAssessmentVerdict === 'disagree';

  const handleVerdict = async (verdict: 'agree' | 'disagree') => {
    await setVerdict({
      attemptId,
      verdict,
      reason: reason.trim() || undefined,
    }).unwrap();
  };

  return (
    <Card header="Ваша оценка ИИ">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={verdictVariant(aiAssessmentVerdict)}>
            {verdictLabel(aiAssessmentVerdict)}
          </Badge>
          {reviewedAt ? (
            <span className="text-xs text-muted-foreground">
              Обновлено {formatUnixDate(reviewedAt)}
            </span>
          ) : null}
        </div>
        {!evaluationReady ? (
          <p className="text-sm text-muted-foreground">
            Оценка ИИ ещё не готова — согласие или несогласие можно будет
            указать после финальной оценки.
          </p>
        ) : hasVerdict ? (
          <p className="text-sm text-muted-foreground">
            Ваша оценка сохранена. Можно изменить, выбрав другой вариант ниже.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Подтвердите, согласны ли вы с оценкой и рекомендацией ИИ по этому
            кандидату.
          </p>
        )}
        {evaluationReady ? (
          <>
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Комментарий (опционально, особенно при несогласии)"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={isLoading}
                className={cn(
                  aiAssessmentVerdict === 'agree' && 'ring-2 ring-ring',
                )}
                onClick={() => void handleVerdict('agree')}
              >
                <ThumbsUp className="size-4" />
                Согласен с ИИ
              </Button>
              <Button
                variant="ghost"
                disabled={isLoading}
                className={cn(
                  aiAssessmentVerdict === 'disagree' &&
                    'ring-2 ring-destructive/40',
                )}
                onClick={() => void handleVerdict('disagree')}
              >
                <ThumbsDown className="size-4" />
                Не согласен с ИИ
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </Card>
  );
}

export function AiAssessmentVerdictBadge({
  verdict,
}: {
  verdict: string;
}) {
  if (verdict !== 'agree' && verdict !== 'disagree') {
    return null;
  }

  return (
    <Badge variant={verdictVariant(verdict)} className="gap-1">
      {verdict === 'agree' ? (
        <ThumbsUp className="size-3" />
      ) : (
        <ThumbsDown className="size-3" />
      )}
      {verdict === 'agree' ? 'Согласен' : 'Не согласен'}
    </Badge>
  );
}
