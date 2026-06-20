import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import {
  useCompareInterviewCandidatesMutation,
  useInterviewAttemptsPageQuery,
  useInterviewDetailsQuery,
} from "@entities/interview/api/interviewDetailsApi";
import { HIRE_RECOMMENDATION_FILTER_OPTIONS } from "@entities/candidate/lib/hireRecommendationMeta";
import { HireRecommendationBadge } from "@entities/candidate/ui/HireRecommendationBadge";
import { AiAssessmentVerdictBadge } from "@features/attempt-review/ui/AiAssessmentVerdictPanel";
import { AttemptQuickActions } from "@features/attempt-review/ui/AttemptQuickActions";
import { AttemptTeamNotesIndicator } from "@features/attempt-review/ui/AttemptTeamNotesPanel";
import { AttemptExportMenu } from "@features/attempt-export/ui/AttemptExportMenu";
import type { AttemptExportInterviewMeta } from "@features/attempt-export/lib/attemptExport.types";
import { InterviewManagePanel } from "@widgets/interview/InterviewManagePanel";
import type {
  CompareInterviewCandidatesMutation,
  InterviewDetailsQuery,
} from "@shared/api/graphql/generated/graphql";
import type { InterviewAttemptsPageItem } from "@entities/interview/model/interview.types";
import { formatScore, formatUnixDate } from "@shared/lib/format";
import { useDebouncedValue } from "@shared/lib/useDebouncedValue";
import { cn } from "@shared/lib/utils";
import { Alert, Badge, Button, Card, CheckboxField, SelectField, Spinner } from "@shared/ui";
import { Checkbox } from "@shared/ui/checkbox";
import { Input } from "@shared/ui/input";
import { ScrollArea } from "@shared/ui/scroll-area";
import { buttonVariants } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/ui/table";

type InterviewAttempt =
  InterviewDetailsQuery["interviewDetails"]["attempts"][number];
type TableAttemptItem = InterviewAttemptsPageItem;
type CandidateComparisonAdvice =
  CompareInterviewCandidatesMutation["compareInterviewCandidates"];

function getReviewStatusLabel(value: string): string {
  if (value === "in_review") {
    return "В работе";
  }

  if (value === "reviewed") {
    return "Просмотрено";
  }

  return "Не смотрели";
}

function getReviewStatusVariant(
  value: string,
): "muted" | "warning" | "success" {
  if (value === "in_review") {
    return "warning";
  }

  if (value === "reviewed") {
    return "success";
  }

  return "muted";
}

function getCompanyDecisionLabel(value: string): string {
  if (value === "reject") {
    return "Отклонён";
  }

  if (value === "invite_live") {
    return "На live";
  }

  if (value === "shortlist") {
    return "Shortlist";
  }

  if (value === "hold") {
    return "На паузе";
  }

  return "";
}

function getShortlistStatusLabel(value: string): string {
  if (value === "shortlisted") {
    return "Shortlist";
  }

  if (value === "removed") {
    return "Убран";
  }

  return "—";
}

function getEvaluationStatusLabel(value: string): string {
  if (value === "ready") {
    return "Оценка готова";
  }

  if (value === "evaluation_pending") {
    return "Нужна ИИ-оценка";
  }

  return value;
}

function getInterviewStatusLabel(value: string): string {
  if (value === "active") {
    return "Активно";
  }

  if (value === "draft") {
    return "Черновик";
  }

  if (value === "paused") {
    return "На паузе";
  }

  if (value === "closed") {
    return "Закрыто";
  }

  return value;
}

function getLevelLabel(value: string): string {
  const labels: Record<string, string> = {
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
    lead: "Lead",
  };

  return labels[value] ?? value;
}

function getDifficultyLabel(value: string): string {
  const labels: Record<string, string> = {
    basic: "Базовый",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  return labels[value] ?? value;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function pluralCandidate(value: number): string {
  if (value % 10 === 1 && value % 100 !== 11) {
    return "кандидат";
  }

  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) {
    return "кандидата";
  }

  return "кандидатов";
}

function isGoodResult(attempt: InterviewAttempt): boolean {
  return (
    attempt.hireRecommendation === "strong_invite" ||
    attempt.hireRecommendation === "invite" ||
    (attempt.overallScore ?? 0) >= 8
  );
}

function getScoreForSort(attempt: InterviewAttempt): number {
  return attempt.overallScore ?? Number.NEGATIVE_INFINITY;
}

const CANDIDATE_SORT_OPTIONS = [
  { value: "score", label: "Сначала по баллу" },
  { value: "completed_at", label: "Сначала новые" },
  { value: "name", label: "По имени (А–Я)" },
] as const;

const MAX_COMPARE_SELECTION = 5;

type CandidateSortKey = (typeof CANDIDATE_SORT_OPTIONS)[number]["value"];
type CompareModalMode = "pairwise" | "multi";

function isComparableTableAttempt(attempt: TableAttemptItem): boolean {
  return (
    attempt.status === "completed" &&
    attempt.evaluationStatus === "ready" &&
    attempt.overallScore !== null
  );
}

function compareAttemptsBySort(
  left: InterviewAttempt,
  right: InterviewAttempt,
  sortBy: CandidateSortKey,
): number {
  if (sortBy === "score") {
    const scoreDiff = getScoreForSort(right) - getScoreForSort(left);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return (right.completedAt ?? 0) - (left.completedAt ?? 0);
  }

  if (sortBy === "completed_at") {
    return (right.completedAt ?? 0) - (left.completedAt ?? 0);
  }

  return (left.candidateName ?? "").localeCompare(
    right.candidateName ?? "",
    "ru",
  );
}

function matchesCandidateSearch(
  attempt: InterviewAttempt,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return (
    attempt.candidateName.toLowerCase().includes(query) ||
    attempt.candidateEmail.toLowerCase().includes(query)
  );
}

function getCandidateNameByAttemptId(
  attempts: InterviewAttempt[],
  attemptId?: string | null,
): string {
  if (!attemptId) {
    return "нет однозначного выбора";
  }

  return (
    attempts.find((attempt) => attempt.attemptId === attemptId)
      ?.candidateName ?? "кандидат"
  );
}

function TopRankBadge({ index }: { index: number }) {
  const variants = ["success", "info", "warning"] as const;

  return (
    <Badge variant={variants[index] ?? "muted"} className="shrink-0">
      #{index + 1}
    </Badge>
  );
}

function CandidateComparisonAdvicePanel({
  advice,
  comparedAttempts,
  candidateNotes,
}: {
  advice: CandidateComparisonAdvice;
  comparedAttempts: InterviewAttempt[];
  candidateNotes: Map<
    string,
    CandidateComparisonAdvice["candidateNotes"][number]
  >;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Совет ИИ</Badge>
          <span className="text-sm font-semibold text-foreground">
            {advice.recommendationTitle}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-foreground">
          {advice.recommendationSummary}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Итог:{" "}
          {getCandidateNameByAttemptId(
            comparedAttempts,
            advice.recommendedAttemptId,
          )}
        </p>
      </div>

      {advice.decisionRationale.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            Почему такой совет
          </h4>
          <ul className="space-y-2">
            {advice.decisionRationale.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {advice.useCases.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            Для какого кейса кто лучше
          </h4>
          <div className="space-y-2">
            {advice.useCases.map((useCase) => (
              <div
                key={`${useCase.title}-${useCase.recommendedAttemptId ?? "none"}`}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {useCase.title}
                  </p>
                  <Badge variant="secondary">
                    {getCandidateNameByAttemptId(
                      comparedAttempts,
                      useCase.recommendedAttemptId,
                    )}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {useCase.rationale}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h4 className="mb-2 text-sm font-semibold text-foreground">
          Риски и вопросы для live-интервью
        </h4>
        <div className="space-y-3">
          {comparedAttempts.map((attempt) => {
            const note = candidateNotes.get(attempt.attemptId);

            return (
              <div
                key={attempt.attemptId}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="font-medium text-foreground">
                  {attempt.candidateName}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {note?.bestFor ??
                    "ИИ не выделил отдельный fit для этого кандидата."}
                </p>
                <ComparisonList
                  title="Сильные стороны"
                  items={note?.strengths ?? []}
                />
                <ComparisonList title="Риски" items={note?.risks ?? []} />
                <ComparisonList
                  title="Что спросить дальше"
                  items={note?.followUpQuestions ?? []}
                />
              </div>
            );
          })}
        </div>
      </section>

      {advice.caveats.length > 0 && (
        <Alert variant="info" title="Что не стоит переоценивать">
          <ul className="space-y-1">
            {advice.caveats.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
}

function ComparisonList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CandidateComparisonSummaryTable({
  attempts,
  ranking,
}: {
  attempts: InterviewAttempt[];
  ranking?: CandidateComparisonAdvice["ranking"];
}) {
  const rankingByAttemptId = useMemo(
    () => new Map((ranking ?? []).map((entry) => [entry.attemptId, entry])),
    [ranking],
  );

  const rows = useMemo(() => {
    const sorted = [...attempts].sort((left, right) => {
      const leftRank =
        rankingByAttemptId.get(left.attemptId)?.rank ?? Number.MAX_SAFE_INTEGER;
      const rightRank =
        rankingByAttemptId.get(right.attemptId)?.rank ?? Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return getScoreForSort(right) - getScoreForSort(left);
    });

    return sorted;
  }, [attempts, rankingByAttemptId]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Кандидат</TableHead>
            <TableHead>Балл</TableHead>
            <TableHead>Рекомендация</TableHead>
            {ranking && ranking.length > 0 ? (
              <>
                <TableHead>ИИ: позиция</TableHead>
                <TableHead>Trade-off</TableHead>
              </>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((attempt, index) => {
            const rankEntry = rankingByAttemptId.get(attempt.attemptId);

            return (
              <TableRow key={attempt.attemptId}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {rankEntry?.rank ?? index + 1}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {attempt.candidateName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.candidateEmail}
                  </p>
                </TableCell>
                <TableCell className="tabular-nums font-medium">
                  {formatScore(attempt.overallScore)}
                </TableCell>
                <TableCell>
                  <HireRecommendationBadge
                    value={attempt.hireRecommendation}
                    size="sm"
                  />
                </TableCell>
                {ranking && ranking.length > 0 ? (
                  <>
                    <TableCell className="max-w-[200px] text-sm leading-6 text-muted-foreground">
                      {rankEntry?.headline ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] text-sm leading-6 text-muted-foreground">
                      {rankEntry?.tradeOff ?? "—"}
                    </TableCell>
                  </>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function CompareSelectionTray({
  selectedAttempts,
  comparableCount,
  canCompare,
  onCompare,
  onClear,
  onRemove,
}: {
  selectedAttempts: TableAttemptItem[];
  comparableCount: number;
  canCompare: boolean;
  onCompare: () => void;
  onClear: () => void;
  onRemove: (attemptId: string) => void;
}) {
  if (selectedAttempts.length === 0) {
    return null;
  }

  const nonComparableCount = selectedAttempts.length - comparableCount;

  return (
    <div className="rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Выбрано {selectedAttempts.length} из {MAX_COMPARE_SELECTION}
          </p>
          <p className="text-xs text-muted-foreground">
            {comparableCount >= 2
              ? `${comparableCount} готовы для сравнения с советом ИИ`
              : comparableCount === 1
                ? "Выберите ещё одного кандидата с готовой оценкой"
                : "Нужны кандидаты с готовой ИИ-оценкой"}
            {nonComparableCount > 0
              ? ` · ${nonComparableCount} без готовой оценки`
              : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={onClear}>
            Сбросить
          </Button>
          <Button size="sm" disabled={!canCompare} onClick={onCompare}>
            Сравнить с ИИ
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {selectedAttempts.map((attempt) => (
          <div
            key={attempt.attemptId}
            className="flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-sm"
          >
            <span className="truncate font-medium text-foreground">
              {attempt.candidateName}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="tabular-nums text-muted-foreground">
              {formatScore(attempt.overallScore)}
            </span>
            <button
              type="button"
              className="rounded-full px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onRemove(attempt.attemptId)}
              aria-label={`Убрать ${attempt.candidateName} из выбора`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareCandidateChip({ attempt }: { attempt: InterviewAttempt }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <span className="truncate font-medium text-foreground">
        {attempt.candidateName}
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="shrink-0 tabular-nums font-medium text-foreground">
        {formatScore(attempt.overallScore)}
      </span>
      <span className="hidden shrink-0 text-muted-foreground sm:inline">·</span>
      <span className="hidden sm:inline">
        <HireRecommendationBadge
          value={attempt.hireRecommendation}
          size="sm"
        />
      </span>
    </div>
  );
}

function CompareCandidatePickerRow({
  attempt,
  isSelected,
  onSelect,
}: {
  attempt: InterviewAttempt;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0",
        isSelected ? "bg-brand-primary/8" : "hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "size-4 shrink-0 rounded-full border-2",
          isSelected
            ? "border-brand-primary bg-brand-primary"
            : "border-muted-foreground/40",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {attempt.candidateName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {attempt.candidateEmail}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {formatScore(attempt.overallScore)}
        </p>
        <div className="mt-0.5 flex justify-end">
          <HireRecommendationBadge
            value={attempt.hireRecommendation}
            size="sm"
          />
        </div>
      </div>
    </button>
  );
}

function CandidateComparisonModal({
  open,
  onOpenChange,
  mode,
  primaryAttempt,
  comparePool,
  secondaryAttemptId,
  onSelectSecondary,
  comparedAttempts,
  comparisonAdvice,
  comparisonCandidateNotes,
  isComparisonLoading,
  isComparisonError,
  onRequestComparison,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CompareModalMode;
  primaryAttempt: InterviewAttempt | null;
  comparePool: InterviewAttempt[];
  secondaryAttemptId: string | null;
  onSelectSecondary: (attemptId: string) => void;
  comparedAttempts: InterviewAttempt[];
  comparisonAdvice?: CandidateComparisonAdvice;
  comparisonCandidateNotes: Map<
    string,
    CandidateComparisonAdvice["candidateNotes"][number]
  >;
  isComparisonLoading: boolean;
  isComparisonError: boolean;
  onRequestComparison: () => void;
}) {
  const [compareSearch, setCompareSearch] = useState("");
  const debouncedCompareSearch = useDebouncedValue(compareSearch, 200);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCompareSearch("");
    }

    onOpenChange(nextOpen);
  };

  const sortedComparePool = useMemo(
    () =>
      [...comparePool].sort(
        (left, right) => getScoreForSort(right) - getScoreForSort(left),
      ),
    [comparePool],
  );

  const filteredComparePool = useMemo(
    () =>
      sortedComparePool.filter((attempt) =>
        matchesCandidateSearch(attempt, debouncedCompareSearch),
      ),
    [sortedComparePool, debouncedCompareSearch],
  );

  const secondaryAttempt = useMemo(
    () =>
      comparePool.find((attempt) => attempt.attemptId === secondaryAttemptId) ??
      null,
    [comparePool, secondaryAttemptId],
  );

  const canRequestAiComparison =
    comparedAttempts.length >= 2 &&
    comparedAttempts.every((attempt) => attempt.evaluationStatus === "ready");

  const isMultiMode = mode === "multi";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-2xl flex-col overflow-hidden p-0">
        <div className="border-b border-border px-5 py-4">
          <DialogHeader>
            <DialogTitle>
              {isMultiMode ? "Сравнение финального пула" : "Сравнение кандидатов"}
            </DialogTitle>
            <DialogDescription>
              {isMultiMode
                ? "ИИ ранжирует пул и подскажет, кого звать первым, trade-offs и что проверить на live."
                : "Выберите второго кандидата — ИИ подскажет, кого звать дальше и что проверить на live-интервью."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {isMultiMode ? (
          <div className="space-y-4 px-5 py-4">
            <CandidateComparisonSummaryTable
              attempts={comparedAttempts}
              ranking={comparisonAdvice?.ranking}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!canRequestAiComparison || isComparisonLoading}
                onClick={onRequestComparison}
              >
                {isComparisonLoading ? "ИИ сравнивает…" : "Совет ИИ"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {primaryAttempt ? (
              <div className="border-b border-border bg-muted/15 px-5 py-2.5">
                <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                  <span className="shrink-0 uppercase tracking-wide">Базовый</span>
                  <CompareCandidateChip attempt={primaryAttempt} />
                </div>
              </div>
            ) : null}

            <div className="space-y-3 px-5 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    С кем сравнить
                  </h3>
                  {comparePool.length > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {debouncedCompareSearch.trim()
                        ? `Найдено ${filteredComparePool.length} из ${comparePool.length}`
                        : `${comparePool.length} доступно`}
                    </span>
                  ) : null}
                </div>

                {comparePool.length > 0 ? (
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={compareSearch}
                      onChange={(event) => setCompareSearch(event.target.value)}
                      placeholder="Поиск по имени или email…"
                      className="h-9 pl-8"
                    />
                  </div>
                ) : null}
              </div>

              {comparePool.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <ScrollArea className="max-h-56">
                    {filteredComparePool.length > 0 ? (
                      <div>
                        {filteredComparePool.map((attempt) => (
                          <CompareCandidatePickerRow
                            key={attempt.attemptId}
                            attempt={attempt}
                            isSelected={secondaryAttemptId === attempt.attemptId}
                            onSelect={() => onSelectSecondary(attempt.attemptId)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        По запросу «{compareSearch.trim()}» никого не нашли.
                      </p>
                    )}
                  </ScrollArea>
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                  {primaryAttempt?.evaluationStatus !== "ready"
                    ? "Сначала дождитесь ИИ-оценки этого кандидата."
                    : "Нет других кандидатов с готовой оценкой для сравнения."}
                </p>
              )}
            </div>

            {secondaryAttempt && primaryAttempt ? (
              <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/15 px-5 py-3">
                <p className="min-w-0 truncate text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {primaryAttempt.candidateName}
                  </span>
                  {" vs "}
                  <span className="font-medium text-foreground">
                    {secondaryAttempt.candidateName}
                  </span>
                </p>
                <Button
                  size="sm"
                  disabled={!canRequestAiComparison || isComparisonLoading}
                  onClick={onRequestComparison}
                >
                  {isComparisonLoading ? "ИИ сравнивает…" : "Совет ИИ"}
                </Button>
              </div>
            ) : null}
          </>
        )}

        {(isComparisonError || comparisonAdvice) && (
          <ScrollArea className="min-h-0 flex-1 border-t border-border">
            <div className="space-y-4 px-5 py-4">
              {isComparisonError ? (
                <Alert variant="error" title="Не удалось получить совет ИИ">
                  Проверьте, что у всех кандидатов готова итоговая оценка, и
                  попробуйте ещё раз.
                </Alert>
              ) : null}

              {comparisonAdvice ? (
                <CandidateComparisonAdvicePanel
                  advice={comparisonAdvice}
                  comparedAttempts={comparedAttempts}
                  candidateNotes={comparisonCandidateNotes}
                />
              ) : null}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function InterviewDetailsPage() {
  const { interviewId = "" } = useParams();
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareModalMode, setCompareModalMode] =
    useState<CompareModalMode>("pairwise");
  const [primaryAttemptId, setPrimaryAttemptId] = useState<string | null>(null);
  const [secondaryAttemptId, setSecondaryAttemptId] = useState<string | null>(
    null,
  );
  const [candidateSearch, setCandidateSearch] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState<CandidateSortKey>("score");
  const [candidatePage, setCandidatePage] = useState(1);
  const [unreviewedOnly, setUnreviewedOnly] = useState(false);
  const [disagreeOnly, setDisagreeOnly] = useState(false);
  const [selectedAttempts, setSelectedAttempts] = useState<
    Map<string, TableAttemptItem>
  >(() => new Map());
  const debouncedCandidateSearch = useDebouncedValue(candidateSearch, 300);
  const candidatePageSize = 20;

  const attemptsPageFilters = useMemo(
    () => ({
      search: debouncedCandidateSearch.trim() || undefined,
      hireRecommendation:
        recommendationFilter === "all" ? undefined : recommendationFilter,
      unreviewedOnly: unreviewedOnly || undefined,
      disagreeOnly: disagreeOnly || undefined,
      page: candidatePage,
      pageSize: candidatePageSize,
      sort: candidateSort,
      sortDirection: candidateSort === "name" ? "asc" : "desc",
    }),
    [
      candidatePage,
      candidateSort,
      debouncedCandidateSearch,
      recommendationFilter,
      unreviewedOnly,
      disagreeOnly,
    ],
  );

  const { data, isLoading, isError, error, refetch } = useInterviewDetailsQuery(
    interviewId,
    { skip: !interviewId },
  );
  const {
    data: attemptsPage,
    isLoading: isAttemptsPageLoading,
    isFetching: isAttemptsPageFetching,
  } = useInterviewAttemptsPageQuery(
    { interviewId, filters: attemptsPageFilters },
    { skip: !interviewId },
  );
  const [
    compareInterviewCandidates,
    {
      data: comparisonAdvice,
      isLoading: isComparisonLoading,
      isError: isComparisonError,
      reset: resetComparisonAdvice,
    },
  ] = useCompareInterviewCandidatesMutation();

  const completedAttempts = useMemo(
    () =>
      ((data?.attempts ?? []) as InterviewAttempt[]).filter(
        (attempt) => attempt.status === "completed",
      ),
    [data?.attempts],
  );

  const evaluatedAttempts = useMemo(
    () =>
      completedAttempts.filter(
        (attempt) =>
          attempt.evaluationStatus === "ready" && attempt.overallScore !== null,
      ),
    [completedAttempts],
  );

  const pendingEvaluationCount = completedAttempts.filter(
    (attempt) => attempt.evaluationStatus !== "ready",
  ).length;
  const goodResultAttempts = evaluatedAttempts.filter(isGoodResult);
  const averageScore =
    evaluatedAttempts.length > 0
      ? evaluatedAttempts.reduce(
          (sum, attempt) => sum + (attempt.overallScore ?? 0),
          0,
        ) / evaluatedAttempts.length
      : null;
  const completionRate =
    data?.attempts.length && data.attempts.length > 0
      ? (completedAttempts.length / data.attempts.length) * 100
      : 0;

  const topCandidates = useMemo(
    () =>
      [...evaluatedAttempts]
        .filter(
          (attempt) =>
            attempt.hireRecommendation === "strong_invite" ||
            attempt.hireRecommendation === "invite",
        )
        .sort((left, right) =>
          compareAttemptsBySort(left, right, "score"),
        )
        .slice(0, 3),
    [evaluatedAttempts],
  );

  const tableAttempts = attemptsPage?.items ?? [];
  const tableTotal = attemptsPage?.total ?? 0;
  const tableTotalPages = Math.max(
    1,
    Math.ceil(tableTotal / (attemptsPage?.pageSize ?? candidatePageSize)),
  );
  const pageAttemptIds = tableAttempts.map((attempt) => attempt.attemptId);
  const allPageSelected =
    pageAttemptIds.length > 0 &&
    pageAttemptIds.every((attemptId) => selectedAttempts.has(attemptId));

  const hasActiveCandidateFilters =
    debouncedCandidateSearch.trim().length > 0 ||
    recommendationFilter !== "all" ||
    candidateSort !== "score" ||
    unreviewedOnly ||
    disagreeOnly;

  const exportInterviewMeta = useMemo<AttemptExportInterviewMeta | null>(() => {
    if (!data) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      jobRole: data.jobRole,
      professionName: data.professionName,
      level: data.level,
      status: data.status,
      questionCount: data.questionCount,
      skills: data.skills ?? [],
    };
  }, [data]);

  const handleToggleAttemptSelection = (
    attempt: TableAttemptItem,
    checked: boolean,
  ) => {
    setSelectedAttempts((current) => {
      const next = new Map(current);

      if (checked) {
        if (
          next.size >= MAX_COMPARE_SELECTION &&
          !next.has(attempt.attemptId)
        ) {
          return current;
        }

        next.set(attempt.attemptId, attempt);
      } else {
        next.delete(attempt.attemptId);
      }

      return next;
    });
  };

  const handleToggleAllPageSelection = (checked: boolean) => {
    setSelectedAttempts((current) => {
      const next = new Map(current);

      if (checked) {
        tableAttempts.forEach((attempt) => {
          if (next.size < MAX_COMPARE_SELECTION) {
            next.set(attempt.attemptId, attempt);
          }
        });
      } else {
        pageAttemptIds.forEach((attemptId) => next.delete(attemptId));
      }

      return next;
    });
  };

  const selectedAttemptList = useMemo(
    () => Array.from(selectedAttempts.values()),
    [selectedAttempts],
  );

  const comparableSelectedAttempts = useMemo(
    () => selectedAttemptList.filter(isComparableTableAttempt),
    [selectedAttemptList],
  );

  const canOpenMultiCompare =
    comparableSelectedAttempts.length >= 2 &&
    comparableSelectedAttempts.length <= MAX_COMPARE_SELECTION;

  const bestCandidate = topCandidates[0] ?? null;
  const reviewPriority =
    pendingEvaluationCount > 0
      ? {
          title: "Сначала закрыть ИИ-оценку",
          description: `${pendingEvaluationCount} завершённ${
            pendingEvaluationCount === 1 ? "ая попытка ждёт" : "ые попытки ждут"
          } оценки. Без неё список сильных кандидатов будет неточным.`,
        }
      : goodResultAttempts.length > 0
        ? {
            title: "Сначала смотреть сильных кандидатов",
            description: `${goodResultAttempts.length} ${pluralCandidate(
              goodResultAttempts.length,
            )} ${
              goodResultAttempts.length === 1
                ? "выглядит готовым"
                : "выглядят готовыми"
            } к следующему этапу. Откройте проверку и посмотрите риски.`,
          }
        : completedAttempts.length > 0
          ? {
              title: "Сильных результатов пока нет",
              description:
                "Проверьте кандидатов со статусом «Под вопросом» и решите, снижать ли планку или ждать новых прохождений.",
            }
          : {
              title: "Пока никто не прошёл интервью",
              description:
                "Отправьте публичную ссылку кандидатам и вернитесь сюда после первых завершённых попыток.",
            };

  const primaryCompareAttempt = useMemo(
    () =>
      data?.attempts.find((attempt) => attempt.attemptId === primaryAttemptId) ??
      null,
    [data?.attempts, primaryAttemptId],
  );

  const comparePool = useMemo(
    () =>
      completedAttempts.filter(
        (attempt) =>
          attempt.attemptId !== primaryAttemptId &&
          attempt.evaluationStatus === "ready",
      ),
    [completedAttempts, primaryAttemptId],
  );

  const comparedAttempts = useMemo(() => {
    if (compareModalMode === "multi") {
      return comparableSelectedAttempts.map((attempt) => {
        const detailsAttempt = data?.attempts.find(
          (item) => item.attemptId === attempt.attemptId,
        );

        if (detailsAttempt) {
          return detailsAttempt as InterviewAttempt;
        }

        return {
          attemptId: attempt.attemptId,
          candidateId: attempt.candidateId,
          candidateName: attempt.candidateName,
          candidateEmail: attempt.candidateEmail,
          status: attempt.status,
          completedAt: attempt.completedAt,
          overallScore: attempt.overallScore,
          hireRecommendation: attempt.hireRecommendation,
          evaluationStatus: attempt.evaluationStatus,
          achievedLevel: attempt.achievedLevel,
          achievedLevelMethod: attempt.achievedLevelMethod,
          needsManualReview: attempt.needsManualReview,
        } as InterviewAttempt;
      });
    }

    if (!primaryCompareAttempt || !secondaryAttemptId) {
      return [];
    }

    const secondaryAttempt = comparePool.find(
      (attempt) => attempt.attemptId === secondaryAttemptId,
    );

    return secondaryAttempt
      ? [primaryCompareAttempt, secondaryAttempt]
      : [];
  }, [
    compareModalMode,
    comparableSelectedAttempts,
    data?.attempts,
    primaryCompareAttempt,
    secondaryAttemptId,
    comparePool,
  ]);

  const comparisonCandidateNotes = useMemo(() => {
    const notes = comparisonAdvice?.candidateNotes ?? [];

    return new Map(notes.map((note) => [note.attemptId, note]));
  }, [comparisonAdvice?.candidateNotes]);

  const canOpenCompare =
    completedAttempts.length >= 2 &&
    completedAttempts.some((attempt) => attempt.evaluationStatus === "ready");

  const handleCompareModalOpenChange = (open: boolean) => {
    setCompareModalOpen(open);

    if (!open) {
      setPrimaryAttemptId(null);
      setSecondaryAttemptId(null);
      setCompareModalMode("pairwise");
      resetComparisonAdvice();
    }
  };

  const handleOpenCompareModal = (attemptId: string) => {
    resetComparisonAdvice();
    setCompareModalMode("pairwise");
    setPrimaryAttemptId(attemptId);
    setSecondaryAttemptId(null);
    setCompareModalOpen(true);
  };

  const handleOpenMultiCompareModal = () => {
    resetComparisonAdvice();
    setCompareModalMode("multi");
    setPrimaryAttemptId(null);
    setSecondaryAttemptId(null);
    setCompareModalOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedAttempts(new Map());
  };

  const handleRemoveFromSelection = (attemptId: string) => {
    setSelectedAttempts((current) => {
      const next = new Map(current);
      next.delete(attemptId);
      return next;
    });
  };

  const handleSelectSecondaryCandidate = (attemptId: string) => {
    resetComparisonAdvice();
    setSecondaryAttemptId(attemptId);
  };

  const handleRequestAiComparison = async () => {
    const attemptIds =
      compareModalMode === "multi"
        ? comparableSelectedAttempts.map((attempt) => attempt.attemptId)
        : primaryAttemptId && secondaryAttemptId
          ? [primaryAttemptId, secondaryAttemptId]
          : [];

    if (attemptIds.length < 2) {
      return;
    }

    await compareInterviewCandidates({
      interviewId,
      attemptIds,
    }).unwrap();
  };

  if (!interviewId) {
    return (
      <Alert variant="error" title="Некорректный маршрут">
        Не хватает ID интервью.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Загрузка деталей интервью…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Не удалось загрузить интервью">
        {"message" in (error as object)
          ? String((error as { message: string }).message)
          : "Интервью не найдено или доступ запрещён"}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {data.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.jobRole} · {data.questionCount} вопросов · создано{" "}
            {formatUnixDate(data.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="secondary" />}>
              Детали интервью
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{data.title}</DialogTitle>
                <DialogDescription>
                  Конфигурация, стек и вопросы, по которым кандидаты проходят
                  интервью.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Основное
                  </h3>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <dt className="text-muted-foreground">Статус</dt>
                      <dd className="font-medium text-foreground">
                        {getInterviewStatusLabel(data.status)}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <dt className="text-muted-foreground">Роль</dt>
                      <dd className="font-medium text-foreground">
                        {data.jobRole}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <dt className="text-muted-foreground">Профессия</dt>
                      <dd className="font-medium text-foreground">
                        {data.professionName ?? "Не указана"}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <dt className="text-muted-foreground">Уровень</dt>
                      <dd className="font-medium text-foreground">
                        {getLevelLabel(data.level)}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <dt className="text-muted-foreground">Вопросы</dt>
                      <dd className="font-medium text-foreground">
                        {data.questionCount}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <dt className="text-muted-foreground">Создано</dt>
                      <dd className="font-medium text-foreground">
                        {formatUnixDate(data.createdAt)}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 lg:col-span-2">
                      <dt className="text-muted-foreground">
                        Публичная ссылка
                      </dt>
                      <dd>
                        <a
                          href={data.publicUrl}
                          className="break-all text-brand-primary hover:underline"
                        >
                          {data.publicUrl}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Стек
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {data.skills.length} навыков
                    </span>
                  </div>
                  {data.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                      Стек не указан или вопросы не привязаны к навыкам.
                    </p>
                  )}
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Вопросы интервью
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {data.questions.length} из {data.questionCount}
                    </span>
                  </div>
                  {data.questions.length > 0 ? (
                    <div className="space-y-2">
                      {data.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="rounded-lg border border-border bg-card p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Badge variant="secondary">
                              {getLevelLabel(question.level)}
                            </Badge>
                            <Badge variant="muted">
                              {getDifficultyLabel(question.difficulty)}
                            </Badge>
                            {question.topicName && (
                              <span className="text-xs text-muted-foreground">
                                {question.topicName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium leading-6 text-foreground">
                            {question.questionText}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                      Список вопросов недоступен.
                    </p>
                  )}
                </section>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="secondary" onClick={() => void refetch()}>
            Обновить
          </Button>
        </div>
      </div>

      <InterviewManagePanel
        interviewId={interviewId}
        completedCount={
          data.attempts.filter((attempt) => attempt.status === "completed")
            .length
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <Card header="Сводка отбора">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Всего кандидатов
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {data.attempts.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Все, кто начал или завершил интервью.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Прошли интервью
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {completedAttempts.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {`Конверсия прохождения: ${formatPercent(completionRate)}.`}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Оценены ИИ
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {evaluatedAttempts.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {`Ждут оценки: ${pendingEvaluationCount}.`}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Хорошие результаты
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {goodResultAttempts.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                «Пригласить» или оценка от 8.0.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Средний балл
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {averageScore === null ? "—" : formatScore(averageScore)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Только по кандидатам с готовой оценкой.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Лучший результат
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {bestCandidate ? formatScore(bestCandidate.overallScore) : "—"}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {bestCandidate?.candidateName ??
                  "Появится после первых оценок."}
              </p>
            </div>
          </div>
        </Card>

        <Card header="Что важно сейчас">
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">
                {reviewPriority.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {reviewPriority.description}
              </p>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-3 py-2">
                <dt className="text-muted-foreground">Готовы к сравнению</dt>
                <dd className="font-medium text-foreground">
                  {topCandidates.length >= 2 ? "да" : "нужно 2 кандидата"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-3 py-2">
                <dt className="text-muted-foreground">Кого смотреть первым</dt>
                <dd className="max-w-40 truncate font-medium text-foreground">
                  {bestCandidate?.candidateName ?? "Пока никого"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-3 py-2">
                <dt className="text-muted-foreground">Качество потока</dt>
                <dd className="font-medium text-foreground">
                  {evaluatedAttempts.length > 0
                    ? formatPercent(
                        (goodResultAttempts.length / evaluatedAttempts.length) *
                          100,
                      )
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>

      <Card header="Лучшие кандидаты">
        {topCandidates.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {topCandidates.map((attempt, index) => (
              <div
                key={attempt.attemptId}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <TopRankBadge index={index} />
                  <Badge
                    variant={
                      attempt.evaluationStatus === "ready"
                        ? "success"
                        : "warning"
                    }
                  >
                    {getEvaluationStatusLabel(attempt.evaluationStatus)}
                  </Badge>
                </div>
                <p className="font-medium text-foreground">
                  {attempt.candidateName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {attempt.candidateEmail}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Оценка</p>
                    <p className="font-semibold text-foreground">
                      {formatScore(attempt.overallScore)}
                    </p>
                  </div>
                    <div>
                      <p className="text-muted-foreground">Рекомендация</p>
                      <div className="mt-1">
                        <HireRecommendationBadge
                          value={attempt.hireRecommendation}
                          size="sm"
                        />
                      </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/dashboard/interviews/${interviewId}/attempts/${attempt.attemptId}/review`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    Проверить
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!canOpenCompare}
                    onClick={() => handleOpenCompareModal(attempt.attemptId)}
                  >
                    Сравнить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Пока нет кандидатов с рекомендацией «Пригласить» или «Сильно
            пригласить».
          </p>
        )}
      </Card>

      <Card header="Все кандидаты">
        <div className="mb-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <Input
              value={candidateSearch}
              onChange={(event) => {
                setCandidateSearch(event.target.value);
                setCandidatePage(1);
              }}
              placeholder="Поиск по имени или email"
            />
            <SelectField
              value={recommendationFilter}
              onValueChange={(value) => {
                setRecommendationFilter(value);
                setCandidatePage(1);
              }}
              options={HIRE_RECOMMENDATION_FILTER_OPTIONS}
            />
            <SelectField
              value={candidateSort}
              onValueChange={(value) => {
                setCandidateSort(value as CandidateSortKey);
                setCandidatePage(1);
              }}
              options={[...CANDIDATE_SORT_OPTIONS]}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <CheckboxField
                label="Только непросмотренные"
                checked={unreviewedOnly}
                onCheckedChange={(checked) => {
                  setUnreviewedOnly(checked);
                  setCandidatePage(1);
                }}
              />
              <CheckboxField
                label="Не согласен с ИИ"
                checked={disagreeOnly}
                onCheckedChange={(checked) => {
                  setDisagreeOnly(checked);
                  setCandidatePage(1);
                }}
              />
            </div>
            {exportInterviewMeta ? (
              <AttemptExportMenu
                interview={exportInterviewMeta}
                selectedAttempts={selectedAttempts}
              />
            ) : null}
          </div>
          <CompareSelectionTray
            selectedAttempts={selectedAttemptList}
            comparableCount={comparableSelectedAttempts.length}
            canCompare={canOpenMultiCompare}
            onCompare={handleOpenMultiCompareModal}
            onClear={handleClearSelection}
            onRemove={handleRemoveFromSelection}
          />
          <div className="flex flex-wrap items-center gap-2">
            {HIRE_RECOMMENDATION_FILTER_OPTIONS.filter(
              (option) => option.value !== "all",
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setRecommendationFilter((current) =>
                    current === option.value ? "all" : option.value,
                  );
                  setCandidatePage(1);
                }}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HireRecommendationBadge
                  value={option.value}
                  size="sm"
                  className={cn(
                    "cursor-pointer transition-opacity",
                    recommendationFilter !== "all" &&
                      recommendationFilter !== option.value &&
                      "opacity-45",
                    recommendationFilter === option.value &&
                      "ring-2 ring-ring ring-offset-1 ring-offset-background",
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasActiveCandidateFilters
              ? `Показано ${tableAttempts.length} из ${tableTotal}`
              : `Всего ${tableTotal} · по умолчанию сортировка по баллу`}
            {isAttemptsPageFetching ? " · обновление…" : null}
          </p>
        </div>
        {isAttemptsPageLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Spinner />
            Загрузка списка кандидатов…
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allPageSelected}
                      onCheckedChange={(checked) =>
                        handleToggleAllPageSelection(checked === true)
                      }
                      aria-label="Выбрать всех на странице"
                    />
                  </TableHead>
                  <TableHead>Кандидат</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Оценка ИИ</TableHead>
                  <TableHead>Балл</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Рекомендация</TableHead>
                  <TableHead>Shortlist</TableHead>
                  <TableHead>Завершено</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Нет кандидатов по выбранным фильтрам.
                    </TableCell>
                  </TableRow>
                ) : null}
                {tableAttempts.map((attempt) => (
                  <TableRow key={attempt.attemptId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAttempts.has(attempt.attemptId)}
                        disabled={
                          !selectedAttempts.has(attempt.attemptId) &&
                          selectedAttempts.size >= MAX_COMPARE_SELECTION
                        }
                        onCheckedChange={(checked) =>
                          handleToggleAttemptSelection(
                            attempt,
                            checked === true,
                          )
                        }
                        aria-label={`Выбрать ${attempt.candidateName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {attempt.candidateName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.candidateEmail}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={getReviewStatusVariant(attempt.reviewStatus)}>
                          {getReviewStatusLabel(attempt.reviewStatus)}
                        </Badge>
                        <AiAssessmentVerdictBadge
                          verdict={attempt.aiAssessmentVerdict}
                        />
                        {attempt.companyDecision !== "pending" ? (
                          <Badge variant="secondary">
                            {getCompanyDecisionLabel(attempt.companyDecision)}
                          </Badge>
                        ) : null}
                        <AttemptTeamNotesIndicator
                          hasTeamNotes={attempt.hasTeamNotes}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant={
                            attempt.evaluationStatus === "ready"
                              ? "success"
                              : "warning"
                          }
                        >
                          {getEvaluationStatusLabel(attempt.evaluationStatus)}
                        </Badge>
                        {attempt.needsManualReview ? (
                          <Badge variant="destructive">Ручная проверка</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatScore(attempt.overallScore)}
                    </TableCell>
                    <TableCell>
                      {attempt.achievedLevel ? (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary">
                            {getLevelLabel(attempt.achievedLevel)}
                          </Badge>
                          {attempt.achievedLevelMethod === "estimate" ? (
                            <Badge variant="outline">≈</Badge>
                          ) : null}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <HireRecommendationBadge
                        value={attempt.hireRecommendation}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          attempt.shortlistStatus === "shortlisted"
                            ? "success"
                            : "muted"
                        }
                      >
                        {getShortlistStatusLabel(attempt.shortlistStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatUnixDate(attempt.completedAt)}</TableCell>
                    <TableCell>
                      <div className="flex min-w-[220px] flex-col gap-2">
                        <AttemptQuickActions
                          attemptId={attempt.attemptId}
                          candidateId={attempt.candidateId}
                          candidateName={attempt.candidateName}
                          shortlistStatus={attempt.shortlistStatus}
                          overallScore={attempt.overallScore}
                          hireRecommendation={attempt.hireRecommendation}
                          layout="row"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/dashboard/interviews/${interviewId}/attempts/${attempt.attemptId}/review`}
                            className={buttonVariants({ size: "sm" })}
                          >
                            Проверить
                          </Link>
                          {attempt.status === "completed" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!canOpenCompare}
                              onClick={() =>
                                handleOpenCompareModal(attempt.attemptId)
                              }
                            >
                              Сравнить
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Страница {attemptsPage?.page ?? candidatePage} из {tableTotalPages}{" "}
                · всего {tableTotal}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={candidatePage <= 1}
                  onClick={() =>
                    setCandidatePage((value) => Math.max(1, value - 1))
                  }
                >
                  Назад
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={candidatePage >= tableTotalPages}
                  onClick={() =>
                    setCandidatePage((value) =>
                      Math.min(tableTotalPages, value + 1),
                    )
                  }
                >
                  Вперёд
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <CandidateComparisonModal
        open={compareModalOpen}
        onOpenChange={handleCompareModalOpenChange}
        mode={compareModalMode}
        primaryAttempt={primaryCompareAttempt}
        comparePool={comparePool}
        secondaryAttemptId={secondaryAttemptId}
        onSelectSecondary={handleSelectSecondaryCandidate}
        comparedAttempts={comparedAttempts}
        comparisonAdvice={comparisonAdvice}
        comparisonCandidateNotes={comparisonCandidateNotes}
        isComparisonLoading={isComparisonLoading}
        isComparisonError={isComparisonError}
        onRequestComparison={() => void handleRequestAiComparison()}
      />

      <Alert variant="info" title="Детальный review открыт отдельно">
        Нажмите «Проверить» у кандидата, чтобы открыть отдельную страницу с
        расшифровкой, критериями и карточками оценки. Сравнение с советом ИИ
        доступно через кнопку «Сравнить».
      </Alert>
    </div>
  );
}
