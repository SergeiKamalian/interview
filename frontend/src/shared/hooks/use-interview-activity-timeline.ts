import { useEffect, useMemo, useState } from 'react';

import { useAppDispatch } from '@app/store/hooks';
import { interviewsApi } from '@entities/interview/api/interviewsApi';
import type { CompanyInterviewListItem } from '@entities/interview/model/interview.types';
import { env } from '@shared/config/env';
import { buildMockInterviewActivityTimeline } from '@shared/mocks/dashboard-overview.mock';

export type InterviewActivityTimeRange = '7d' | '30d' | '90d';

export type InterviewActivityPoint = {
  date: string;
  started: number;
  completed: number;
  abandoned: number;
};

type TimelineState = {
  points: InterviewActivityPoint[];
  isLoading: boolean;
  isError: boolean;
};

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRange(timeRange: InterviewActivityTimeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return {
    dateFrom: formatDateKey(start),
    dateTo: formatDateKey(end),
    start,
    end,
  };
}

function buildEmptyBuckets(start: Date, end: Date): InterviewActivityPoint[] {
  const buckets: InterviewActivityPoint[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    buckets.push({
      date: formatDateKey(cursor),
      started: 0,
      completed: 0,
      abandoned: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return buckets;
}

function aggregateAttempts(
  items: CompanyInterviewListItem[],
  start: Date,
  end: Date,
): InterviewActivityPoint[] {
  const buckets = buildEmptyBuckets(start, end);
  const indexByDate = new Map(buckets.map((point, index) => [point.date, index]));

  for (const item of items) {
    if (item.startedAt) {
      const startedDate = new Date(item.startedAt * 1000);
      const key = formatDateKey(startedDate);
      const index = indexByDate.get(key);

      if (index != null) {
        buckets[index].started += 1;
      }
    }

    if (item.status === 'completed' && item.completedAt) {
      const completedDate = new Date(item.completedAt * 1000);
      const key = formatDateKey(completedDate);
      const index = indexByDate.get(key);

      if (index != null) {
        buckets[index].completed += 1;
      }
    }

    if (item.status === 'abandoned' && item.completedAt) {
      const abandonedDate = new Date(item.completedAt * 1000);
      const key = formatDateKey(abandonedDate);
      const index = indexByDate.get(key);

      if (index != null) {
        buckets[index].abandoned += 1;
      }
    }
  }

  return buckets;
}

async function fetchAttemptsForRange(
  dispatch: ReturnType<typeof useAppDispatch>,
  dateFrom: string,
  dateTo: string,
): Promise<CompanyInterviewListItem[]> {
  const pageSize = 100;
  const allItems: CompanyInterviewListItem[] = [];
  let page = 1;
  let total = 0;

  while (true) {
    const result = await dispatch(
      interviewsApi.endpoints.companyInterviews.initiate({
        dateFrom,
        dateTo,
        page,
        pageSize,
        sort: 'created_at',
        sortDirection: 'asc',
      }),
    ).unwrap();

    allItems.push(...result.items);
    total = result.total;

    if (allItems.length >= total || result.items.length === 0) {
      break;
    }

    page += 1;
  }

  return allItems;
}

export function useInterviewActivityTimeline(
  timeRange: InterviewActivityTimeRange,
): TimelineState {
  const dispatch = useAppDispatch();
  const range = useMemo(() => getRange(timeRange), [timeRange]);
  const useMock = env.dashboardMock;

  const mockState = useMemo(
    () => ({
      points: buildMockInterviewActivityTimeline(
        timeRange,
        range.start,
        range.end,
      ),
      isLoading: false,
      isError: false,
    }),
    [timeRange, range.start, range.end],
  );

  const [state, setState] = useState<TimelineState>(() =>
    useMock
      ? mockState
      : {
          points: [],
          isLoading: true,
          isError: false,
        },
  );

  useEffect(() => {
    if (useMock) {
      return;
    }

    let cancelled = false;

    async function loadTimeline() {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        const items = await fetchAttemptsForRange(
          dispatch,
          range.dateFrom,
          range.dateTo,
        );

        if (cancelled) {
          return;
        }

        setState({
          points: aggregateAttempts(items, range.start, range.end),
          isLoading: false,
          isError: false,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          points: buildEmptyBuckets(range.start, range.end),
          isLoading: false,
          isError: true,
        });
      }
    }

    void loadTimeline();

    return () => {
      cancelled = true;
    };
  }, [dispatch, range.dateFrom, range.dateTo, range.start, range.end, useMock]);

  return useMock ? mockState : state;
}
