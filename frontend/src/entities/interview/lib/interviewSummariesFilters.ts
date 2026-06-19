import type { CompanyInterviewSummaryItem } from '@entities/interview/model/interview.types';
import type { CompanyInterviewSummariesFilters } from '@entities/interview/model/interview.types';
import type { InterviewSummariesFacets } from '@entities/interview/model/interview.types';

export const DEFAULT_INTERVIEW_SUMMARIES_FILTERS: CompanyInterviewSummariesFilters = {
  search: '',
  status: undefined,
  level: undefined,
  interviewLanguage: undefined,
  hasAttemptsOnly: false,
  page: 1,
  pageSize: 20,
  sort: 'last_activity_at',
  sortDirection: 'desc',
};

export function isDefaultInterviewSummariesFilters(
  filters: CompanyInterviewSummariesFilters,
): boolean {
  return (
    !filters.search?.trim() &&
    !filters.status &&
    !filters.level &&
    !filters.interviewLanguage &&
    !filters.hasAttemptsOnly &&
    filters.sort === DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sort &&
    filters.sortDirection === DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sortDirection
  );
}

export function toInterviewSummariesQueryFilters(
  filters: CompanyInterviewSummariesFilters,
): CompanyInterviewSummariesFilters {
  return {
    search: filters.search?.trim() || undefined,
    status: filters.status || undefined,
    level: filters.level || undefined,
    interviewLanguage: filters.interviewLanguage || undefined,
    hasAttemptsOnly: filters.hasAttemptsOnly || undefined,
    page: filters.page,
    pageSize: filters.pageSize,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
  };
}

export function applyMockInterviewSummariesFilters(
  items: CompanyInterviewSummaryItem[],
  filters: CompanyInterviewSummariesFilters,
): CompanyInterviewSummaryItem[] {
  const search = filters.search?.trim().toLowerCase();

  let result = items.filter((item) => {
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    if (filters.level && item.level !== filters.level) {
      return false;
    }

    if (
      filters.interviewLanguage &&
      item.interviewLanguage !== filters.interviewLanguage
    ) {
      return false;
    }

    if (filters.hasAttemptsOnly && item.attemptsTotal === 0) {
      return false;
    }

    if (search) {
      const haystack = `${item.title} ${item.jobRole}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });

  const direction = filters.sortDirection === 'asc' ? 1 : -1;

  result = [...result].sort((left, right) => {
    switch (filters.sort) {
      case 'created_at':
        return (left.createdAt - right.createdAt) * direction;
      case 'attempts_total':
        return (left.attemptsTotal - right.attemptsTotal) * direction;
      case 'avg_score':
        return (
          ((left.avgScore ?? -1) - (right.avgScore ?? -1)) * direction
        );
      case 'completion_rate':
        return (
          ((left.completionRate ?? -1) - (right.completionRate ?? -1)) *
          direction
        );
      case 'last_activity_at':
      default: {
        const leftActivity = left.lastActivityAt ?? left.createdAt;
        const rightActivity = right.lastActivityAt ?? right.createdAt;
        return (leftActivity - rightActivity) * direction;
      }
    }
  });

  return result;
}

export function computeMockInterviewSummariesFacets(
  items: CompanyInterviewSummaryItem[],
): InterviewSummariesFacets {
  return {
    total: items.length,
    active: items.filter((item) => item.status === 'active').length,
    draft: items.filter((item) => item.status === 'draft').length,
    archived: items.filter((item) => item.status === 'archived').length,
    withAttempts: items.filter((item) => item.attemptsTotal > 0).length,
  };
}

const sortLabels: Record<string, string> = {
  last_activity_at: 'Последняя активность',
  created_at: 'Дата создания',
  attempts_total: 'Количество кандидатов',
  avg_score: 'Средний балл',
  completion_rate: 'Доля завершения',
};

const statusLabels: Record<string, string> = {
  active: 'Активно',
  draft: 'Черновик',
  archived: 'Архив',
};

const levelLabels: Record<string, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

const languageLabels: Record<string, string> = {
  ru: 'Русский',
  en: 'English',
};

export type ActiveInterviewFilterTag = {
  id: string;
  label: string;
};

export function getActiveInterviewFilterTags(
  filters: CompanyInterviewSummariesFilters,
): ActiveInterviewFilterTag[] {
  const tags: ActiveInterviewFilterTag[] = [];

  if (filters.search?.trim()) {
    tags.push({
      id: 'search',
      label: `Поиск: ${filters.search.trim()}`,
    });
  }

  if (filters.status) {
    tags.push({
      id: 'status',
      label: `Статус: ${statusLabels[filters.status] ?? filters.status}`,
    });
  }

  if (filters.level) {
    tags.push({
      id: 'level',
      label: `Уровень: ${levelLabels[filters.level] ?? filters.level}`,
    });
  }

  if (filters.interviewLanguage) {
    tags.push({
      id: 'language',
      label: `Язык: ${languageLabels[filters.interviewLanguage] ?? filters.interviewLanguage}`,
    });
  }

  if (filters.hasAttemptsOnly) {
    tags.push({
      id: 'hasAttemptsOnly',
      label: 'Только с кандидатами',
    });
  }

  if (filters.sort && filters.sort !== DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sort) {
    tags.push({
      id: 'sort',
      label: `Сортировка: ${sortLabels[filters.sort] ?? filters.sort}`,
    });
  }

  if (
    filters.sortDirection &&
    filters.sortDirection !== DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sortDirection
  ) {
    tags.push({
      id: 'sortDirection',
      label:
        filters.sortDirection === 'asc' ? 'Порядок: по возрастанию' : 'Порядок: по убыванию',
    });
  }

  return tags;
}

export function clearInterviewFilterTag(
  filters: CompanyInterviewSummariesFilters,
  tagId: string,
): CompanyInterviewSummariesFilters {
  switch (tagId) {
    case 'search':
      return { ...filters, search: '', page: 1 };
    case 'status':
      return { ...filters, status: undefined, page: 1 };
    case 'level':
      return { ...filters, level: undefined, page: 1 };
    case 'language':
      return { ...filters, interviewLanguage: undefined, page: 1 };
    case 'hasAttemptsOnly':
      return { ...filters, hasAttemptsOnly: false, page: 1 };
    case 'sort':
      return {
        ...filters,
        sort: DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sort,
        page: 1,
      };
    case 'sortDirection':
      return {
        ...filters,
        sortDirection: DEFAULT_INTERVIEW_SUMMARIES_FILTERS.sortDirection,
        page: 1,
      };
    default:
      return filters;
  }
}

export function hasActiveInterviewListFilters(
  filters: CompanyInterviewSummariesFilters,
): boolean {
  return getActiveInterviewFilterTags(filters).length > 0;
}
