import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon } from 'lucide-react';
import { Alert, Badge, Spinner } from '@shared/ui';
import { Button } from '@shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { ScrollArea } from '@shared/ui/scroll-area';
import { formatUnixDate } from '@shared/lib/format';
import type {
  MatchingCandidatesForLevelQuery,
  QuestionLevel,
} from '@shared/api/graphql/generated/graphql';
import { useMatchingCandidatesForLevelQuery } from '../../api/talentPoolApi';

type TalentPoolCandidate =
  MatchingCandidatesForLevelQuery['matchingCandidatesForLevel'][number];

const LEVEL_LABELS: Record<string, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

function levelLabel(level?: string | null): string {
  if (!level) {
    return '—';
  }
  return LEVEL_LABELS[level] ?? level;
}

/**
 * Russian pluralization for «{N} подходящ{ий|их} кандидат{|а|ов}».
 */
function candidatesPhrase(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} подходящий кандидат`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} подходящих кандидата`;
  }
  return `${count} подходящих кандидатов`;
}

function CandidateRow({ candidate }: { candidate: TalentPoolCandidate }) {
  const isEstimate = candidate.achievedLevelMethod === 'estimate';
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">
            {candidate.fullName}
          </span>
          <Badge variant="success">{levelLabel(candidate.achievedLevel)}</Badge>
          {isEstimate && <Badge variant="warning">приблизительно</Badge>}
          <Badge variant="secondary">{candidate.professionName}</Badge>
        </div>
        {candidate.matchedSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {candidate.matchedSkills.map((skill) => (
              <Badge key={skill} variant="info">
                {skill}
              </Badge>
            ))}
          </div>
        )}
        <p className="truncate text-xs text-muted-foreground">
          {candidate.email}
        </p>
        <p className="text-xs text-muted-foreground">
          Из интервью «{candidate.sourceInterviewTitle}» ·{' '}
          {formatUnixDate(candidate.completedAt)}
        </p>
      </div>
      <Link
        to={`/dashboard/candidates/${candidate.candidateId}/report`}
        className="shrink-0 text-sm font-medium text-primary hover:underline"
      >
        Открыть отчёт
      </Link>
    </li>
  );
}

type TalentPoolMatchesProps = {
  level: QuestionLevel;
  professionId: string;
  skillIds: string[];
};

/**
 * Compact talent-pool entry point on the «Вакансия» step. After a profession is
 * chosen we show a counter button «Есть N подходящих кандидатов из архива»; the
 * full list (past candidates of the company who already demonstrated a level >=
 * the wizard's target level within the selected profession) opens in a Dialog.
 * Selected skills only rank/highlight matches. The query re-runs when level /
 * profession / skills change, so the count and list stay reactive.
 */
export function TalentPoolMatches({
  level,
  professionId,
  skillIds,
}: TalentPoolMatchesProps) {
  const [open, setOpen] = useState(false);
  const hasProfession = professionId.length > 0;

  const {
    data: candidates = [],
    isLoading,
    isFetching,
    isError,
  } = useMatchingCandidatesForLevelQuery(
    { level, professionId, skillIds: skillIds.length > 0 ? skillIds : null },
    { skip: !hasProfession },
  );

  // No profession selected yet — nothing to offer.
  if (!hasProfession) {
    return null;
  }

  if (isError) {
    return (
      <Alert variant="error" title="Не удалось загрузить кандидатов из архива">
        Попробуйте сменить уровень или повторить позже.
      </Alert>
    );
  }

  const count = candidates.length;
  const isSearching = isLoading || isFetching;

  return (
    <>
      <div className="flex min-h-9 items-center">
        {isSearching ? (
          <Button variant="outline" size="sm" disabled className="gap-2">
            <Spinner />
            Поиск кандидатов из архива…
          </Button>
        ) : count === 0 ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5 shrink-0" />
            Подходящих кандидатов из архива пока нет.
          </p>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setOpen(true)}
          >
            <UsersIcon className="size-4 text-primary" />
            Есть {candidatesPhrase(count)} из архива
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Кандидаты, уже показавшие уровень ≥ {levelLabel(level)}
            </DialogTitle>
            <DialogDescription>
              Прошлые кандидаты этой профессии, чей подтверждённый уровень не ниже
              выбранного. Их можно предложить на эту роль сразу.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-3">
            <ul className="space-y-2">
              {candidates.map((candidate) => (
                <CandidateRow
                  key={candidate.candidateId}
                  candidate={candidate}
                />
              ))}
            </ul>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
