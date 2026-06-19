import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, XIcon } from 'lucide-react';

import type { CompanyInterviewSummariesFilters } from '@entities/interview/model/interview.types';
import type { InterviewSummariesFacets } from '@entities/interview/model/interview.types';
import {
  clearInterviewFilterTag,
  DEFAULT_INTERVIEW_SUMMARIES_FILTERS,
  getActiveInterviewFilterTags,
  hasActiveInterviewListFilters,
} from '@entities/interview/lib/interviewSummariesFilters';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';

type InterviewSummariesSummaryStripProps = {
  facets: InterviewSummariesFacets;
  filteredTotal: number;
  filters: CompanyInterviewSummariesFilters;
};

export function InterviewSummariesSummaryStrip({
  facets,
  filteredTotal,
  filters,
}: InterviewSummariesSummaryStripProps) {
  const hasFilters = hasActiveInterviewListFilters(filters);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">{facets.total}</span> интервью
        <span className="mx-1.5 text-border">·</span>
        <span>{facets.active} активны</span>
        <span className="mx-1.5 text-border">·</span>
        <span>{facets.draft} черновиков</span>
        <span className="mx-1.5 text-border">·</span>
        <span>{facets.archived} в архиве</span>
        {hasFilters && (
          <>
            <span className="mx-1.5 text-border">·</span>
            <span>
              найдено <span className="font-medium text-foreground">{filteredTotal}</span> из{' '}
              {facets.total}
            </span>
          </>
        )}
      </p>
      <Button variant="ghost" size="sm" render={<Link to="/dashboard/attempts" />}>
        Все кандидаты
        <ArrowUpRightIcon className="size-3.5" />
      </Button>
    </div>
  );
}

type InterviewSummariesQuickFiltersProps = {
  facets: InterviewSummariesFacets;
  filters: CompanyInterviewSummariesFilters;
  onChange: (filters: CompanyInterviewSummariesFilters) => void;
};

export function InterviewSummariesQuickFilters({
  facets,
  filters,
  onChange,
}: InterviewSummariesQuickFiltersProps) {
  const patch = (partial: Partial<CompanyInterviewSummariesFilters>) => {
    onChange({ ...filters, ...partial, page: 1 });
  };

  const toggleStatus = (status: CompanyInterviewSummariesFilters['status']) => {
    patch({ status: filters.status === status ? undefined : status });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={filters.status === 'active' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => toggleStatus('active')}
      >
        Активные
        <Badge variant="muted" className="ml-1 px-1.5 py-0">
          {facets.active}
        </Badge>
      </Button>
      <Button
        type="button"
        variant={filters.status === 'draft' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => toggleStatus('draft')}
      >
        Черновики
        <Badge variant="muted" className="ml-1 px-1.5 py-0">
          {facets.draft}
        </Badge>
      </Button>
      <Button
        type="button"
        variant={filters.status === 'archived' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => toggleStatus('archived')}
      >
        Архив
        <Badge variant="muted" className="ml-1 px-1.5 py-0">
          {facets.archived}
        </Badge>
      </Button>
      <Button
        type="button"
        variant={filters.hasAttemptsOnly ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => patch({ hasAttemptsOnly: !filters.hasAttemptsOnly })}
      >
        С кандидатами
        <Badge variant="muted" className="ml-1 px-1.5 py-0">
          {facets.withAttempts}
        </Badge>
      </Button>
    </div>
  );
}

type InterviewSummariesActiveFilterTagsProps = {
  filters: CompanyInterviewSummariesFilters;
  onChange: (filters: CompanyInterviewSummariesFilters) => void;
};

export function InterviewSummariesActiveFilterTags({
  filters,
  onChange,
}: InterviewSummariesActiveFilterTagsProps) {
  const tags = getActiveInterviewFilterTags(filters);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="outline" className="gap-1 pr-1">
          {tag.label}
          <button
            type="button"
            className="rounded-sm p-0.5 hover:bg-muted"
            onClick={() => onChange(clearInterviewFilterTag(filters, tag.id))}
            aria-label={`Убрать фильтр ${tag.label}`}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={() =>
          onChange({
            ...DEFAULT_INTERVIEW_SUMMARIES_FILTERS,
            pageSize: filters.pageSize,
          })
        }
      >
        Сбросить все
      </Button>
    </div>
  );
}
