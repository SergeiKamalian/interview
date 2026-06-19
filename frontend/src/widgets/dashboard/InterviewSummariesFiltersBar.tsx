import type { CompanyInterviewSummariesFilters } from "@entities/interview/model/interview.types";
import { DEFAULT_INTERVIEW_SUMMARIES_FILTERS } from "@entities/interview/lib/interviewSummariesFilters";
import { Button, CheckboxField, Input, SelectField } from "@shared/ui";

type InterviewSummariesFiltersBarProps = {
  filters: CompanyInterviewSummariesFilters;
  onChange: (filters: CompanyInterviewSummariesFilters) => void;
  onRefresh: () => void;
  compact?: boolean;
};

export function InterviewSummariesFiltersBar({
  filters,
  onChange,
  onRefresh,
  compact = false,
}: InterviewSummariesFiltersBarProps) {
  const patch = (partial: Partial<CompanyInterviewSummariesFilters>) => {
    onChange({
      ...filters,
      ...partial,
      page: partial.page ?? 1,
    });
  };

  const reset = () => {
    onChange({
      ...DEFAULT_INTERVIEW_SUMMARIES_FILTERS,
      pageSize: filters.pageSize,
    });
  };

  const showReset =
    filters.search?.trim() ||
    filters.status ||
    filters.level ||
    filters.interviewLanguage ||
    filters.hasAttemptsOnly ||
    filters.sort !== DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sort ||
    filters.sortDirection !== DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sortDirection;

  return (
    <div className="space-y-3">
      <div
        className={
          compact
            ? "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
            : "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        }
      >
        <div className={compact ? "" : "md:col-span-2 xl:col-span-1"}>
          <Input
            label="Поиск"
            value={filters.search ?? ""}
            onChange={(event) => patch({ search: event.target.value, page: 1 })}
            placeholder="Название, роль…"
          />
        </div>

        <SelectField
          label="Статус"
          value={filters.status ?? ""}
          onValueChange={(value) =>
            patch({
              status: (value ||
                undefined) as CompanyInterviewSummariesFilters["status"],
              page: 1,
            })
          }
          placeholder="Все статусы"
          options={[
            { value: "", label: "Все статусы" },
            { value: "active", label: "Активно" },
            { value: "draft", label: "Черновик" },
            { value: "archived", label: "Архив" },
          ]}
        />

        <SelectField
          label="Уровень"
          value={filters.level ?? ""}
          onValueChange={(value) =>
            patch({
              level: (value ||
                undefined) as CompanyInterviewSummariesFilters["level"],
              page: 1,
            })
          }
          placeholder="Все уровни"
          options={[
            { value: "", label: "Все уровни" },
            { value: "junior", label: "Junior" },
            { value: "middle", label: "Middle" },
            { value: "senior", label: "Senior" },
            { value: "lead", label: "Lead" },
          ]}
        />

        <SelectField
          label="Язык"
          value={filters.interviewLanguage ?? ""}
          onValueChange={(value) =>
            patch({ interviewLanguage: value || undefined, page: 1 })
          }
          placeholder="Все языки"
          options={[
            { value: "", label: "Все языки" },
            { value: "ru", label: "Русский" },
            { value: "en", label: "English" },
          ]}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label="Сортировать по"
          value={filters.sort ?? "last_activity_at"}
          onValueChange={(value) => patch({ sort: value, page: 1 })}
          options={[
            { value: "last_activity_at", label: "Последняя активность" },
            { value: "created_at", label: "Дата создания" },
            { value: "attempts_total", label: "Количество кандидатов" },
            { value: "avg_score", label: "Средний балл" },
            { value: "completion_rate", label: "Доля завершения" },
          ]}
        />

        <SelectField
          label="Порядок"
          value={filters.sortDirection ?? "desc"}
          onValueChange={(value) => patch({ sortDirection: value, page: 1 })}
          options={[
            { value: "desc", label: "По убыванию" },
            { value: "asc", label: "По возрастанию" },
          ]}
        />

        {!compact && (
          <SelectField
            label="На странице"
            value={String(filters.pageSize ?? 20)}
            onValueChange={(value) =>
              patch({ pageSize: Number(value), page: 1 })
            }
            options={[
              { value: "10", label: "10 строк" },
              { value: "20", label: "20 строк" },
              { value: "50", label: "50 строк" },
            ]}
          />
        )}

        <div className="flex flex-wrap items-end gap-2 pb-1.5">
          <Button variant="secondary" onClick={onRefresh}>
            Обновить
          </Button>
          {showReset && (
            <Button variant="ghost" onClick={reset}>
              Сбросить
            </Button>
          )}
        </div>
      </div>

      <CheckboxField
        label="Только с кандидатами"
        checked={filters.hasAttemptsOnly ?? false}
        onCheckedChange={(checked) =>
          patch({ hasAttemptsOnly: checked, page: 1 })
        }
      />
    </div>
  );
}
