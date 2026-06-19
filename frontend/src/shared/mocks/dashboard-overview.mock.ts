import type { DashboardOverview } from '@entities/dashboard/api/dashboardApi';
import type { CompanyInterviewSummaryItem } from '@entities/interview/model/interview.types';
import type {
  InterviewActivityPoint,
  InterviewActivityTimeRange,
} from '@shared/hooks/use-interview-activity-timeline';

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildDateBuckets(start: Date, end: Date): InterviewActivityPoint[] {
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

export const dashboardMockMetrics = {
  interviews: 5,
  activeInterviews: 3,
  candidates: 128,
  completed: 84,
  inProgress: 6,
  shortlisted: 23,
} as const;

/** Демо-данные для превью графика активности на дашборде. */
export function buildMockInterviewActivityTimeline(
  _timeRange: InterviewActivityTimeRange,
  start: Date,
  end: Date,
): InterviewActivityPoint[] {
  const buckets = buildDateBuckets(start, end);
  const length = buckets.length;

  for (let i = 0; i < length; i++) {
    const dayOfWeek = new Date(`${buckets[i].date}T12:00:00`).getDay();
    const weekendDip = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 1;
    const trend = 0.8 + (i / Math.max(length - 1, 1)) * 0.4;
    const wave = Math.sin((i / length) * Math.PI * 3) * 2;
    const noise = ((i * 7 + 3) % 5) - 2;

    const started = Math.max(
      1,
      Math.round((6 + trend * 8 + wave + noise) * weekendDip),
    );
    const completed = Math.max(
      0,
      Math.round(started * (0.68 + ((i % 5) * 0.04)) * weekendDip),
    );
    const abandoned = Math.max(
      0,
      Math.round((started - completed) * (0.35 + ((i % 3) * 0.08)) * weekendDip),
    );

    buckets[i].started = started;
    buckets[i].completed = completed;
    buckets[i].abandoned = abandoned;
  }

  return buckets;
}

const mockNow = Math.floor(Date.now() / 1000);
const mockDay = 86400;

export const dashboardMockInterviewSummaries: CompanyInterviewSummaryItem[] = [
  {
    interviewId: '101',
    title: 'Frontend React — весна 2026',
    jobRole: 'Frontend React Developer',
    status: 'active',
    level: 'middle',
    interviewLanguage: 'ru',
    questionCount: 12,
    publicUrl: '/i/demo-frontend-react',
    createdAt: mockNow - mockDay * 45,
    attemptsTotal: 34,
    attemptsCompleted: 28,
    attemptsInProgress: 2,
    attemptsAbandoned: 4,
    attemptsPending: 0,
    completionRate: 82.4,
    shortlistedCount: 5,
    strongInviteCount: 6,
    needsManualReviewCount: 2,
    avgScore: 7.2,
    lastActivityAt: mockNow - mockDay,
  },
  {
    interviewId: '102',
    title: 'Backend Node.js',
    jobRole: 'Backend Node.js Developer',
    status: 'active',
    level: 'senior',
    interviewLanguage: 'en',
    questionCount: 10,
    publicUrl: '/i/demo-backend-node',
    createdAt: mockNow - mockDay * 30,
    attemptsTotal: 18,
    attemptsCompleted: 14,
    attemptsInProgress: 1,
    attemptsAbandoned: 2,
    attemptsPending: 1,
    completionRate: 82.4,
    shortlistedCount: 2,
    strongInviteCount: 3,
    needsManualReviewCount: 1,
    avgScore: 6.8,
    lastActivityAt: mockNow - mockDay * 2,
  },
  {
    interviewId: '103',
    title: 'Fullstack Middle',
    jobRole: 'Fullstack Developer',
    status: 'active',
    level: 'middle',
    interviewLanguage: 'ru',
    questionCount: 15,
    publicUrl: '/i/demo-fullstack',
    createdAt: mockNow - mockDay * 20,
    attemptsTotal: 22,
    attemptsCompleted: 19,
    attemptsInProgress: 0,
    attemptsAbandoned: 3,
    attemptsPending: 0,
    completionRate: 86.4,
    shortlistedCount: 4,
    strongInviteCount: 5,
    needsManualReviewCount: 0,
    avgScore: 7.6,
    lastActivityAt: mockNow - mockDay * 3,
  },
  {
    interviewId: '104',
    title: 'QA Automation',
    jobRole: 'QA Engineer',
    status: 'draft',
    level: 'junior',
    interviewLanguage: 'ru',
    questionCount: 8,
    publicUrl: '/i/demo-qa',
    createdAt: mockNow - mockDay * 5,
    attemptsTotal: 0,
    attemptsCompleted: 0,
    attemptsInProgress: 0,
    attemptsAbandoned: 0,
    attemptsPending: 0,
    completionRate: null,
    shortlistedCount: 0,
    strongInviteCount: 0,
    needsManualReviewCount: 0,
    avgScore: null,
    lastActivityAt: null,
  },
  {
    interviewId: '105',
    title: 'Mobile React Native',
    jobRole: 'Mobile Developer',
    status: 'archived',
    level: 'middle',
    interviewLanguage: 'en',
    questionCount: 11,
    publicUrl: '/i/demo-mobile',
    createdAt: mockNow - mockDay * 90,
    attemptsTotal: 41,
    attemptsCompleted: 38,
    attemptsInProgress: 0,
    attemptsAbandoned: 3,
    attemptsPending: 0,
    completionRate: 92.7,
    shortlistedCount: 8,
    strongInviteCount: 7,
    needsManualReviewCount: 0,
    avgScore: 6.4,
    lastActivityAt: mockNow - mockDay * 25,
  },
];

export function getDashboardMockInterviewSummaries(): CompanyInterviewSummaryItem[] {
  return dashboardMockInterviewSummaries;
}

export function getDashboardMockOverview(): DashboardOverview {
  const interviews = getDashboardMockInterviewSummaries();

  return {
    metrics: {
      interviewsTotal: dashboardMockMetrics.interviews,
      activeInterviewsTotal: dashboardMockMetrics.activeInterviews,
      candidatesTotal: dashboardMockMetrics.candidates,
      completedTotal: dashboardMockMetrics.completed,
      inProgressTotal: dashboardMockMetrics.inProgress,
      shortlistedTotal: dashboardMockMetrics.shortlisted,
      abandonedTotal: 12,
      needsReviewTotal: 3,
      strongInviteTotal: 16,
      completionRate: 84.2,
    },
    interviewsTotal: interviews.length,
    interviews: interviews as DashboardOverview['interviews'],
    attentionItems: [
      {
        kind: 'needs_review',
        attemptId: 'a-501',
        interviewId: '101',
        interviewTitle: 'Frontend React — весна 2026',
        jobRole: 'Frontend React Developer',
        candidateId: 'c-11',
        candidateName: 'Алексей Смирнов',
        overallScore: 6.4,
        hireRecommendation: 'strong_invite',
        occurredAt: mockNow - mockDay,
      },
      {
        kind: 'strong_candidate',
        attemptId: 'a-502',
        interviewId: '103',
        interviewTitle: 'Fullstack Middle',
        jobRole: 'Fullstack Developer',
        candidateId: 'c-22',
        candidateName: 'Мария Козлова',
        overallScore: 8.7,
        hireRecommendation: 'strong_invite',
        occurredAt: mockNow - mockDay * 2,
      },
      {
        kind: 'abandoned',
        attemptId: 'a-503',
        interviewId: '102',
        interviewTitle: 'Backend Node.js',
        jobRole: 'Backend Node.js Developer',
        candidateId: 'c-33',
        candidateName: 'Иван Петров',
        overallScore: null,
        hireRecommendation: null,
        occurredAt: mockNow - mockDay * 3,
      },
      {
        kind: 'in_progress',
        attemptId: 'a-504',
        interviewId: '101',
        interviewTitle: 'Frontend React — весна 2026',
        jobRole: 'Frontend React Developer',
        candidateId: 'c-44',
        candidateName: 'Елена Волкова',
        overallScore: null,
        hireRecommendation: null,
        occurredAt: mockNow - 3600 * 4,
      },
    ],
    shortlistTotal: dashboardMockMetrics.shortlisted,
    shortlistPreview: [
      {
        candidateId: 'c-22',
        fullName: 'Мария Козлова',
        email: 'maria.kozlova@example.com',
        interviewsCount: 2,
        avgScore: 8.1,
        lastInterviewDate: mockNow - mockDay * 2,
      },
      {
        candidateId: 'c-55',
        fullName: 'Дмитрий Орлов',
        email: 'dmitry.orlov@example.com',
        interviewsCount: 1,
        avgScore: 7.8,
        lastInterviewDate: mockNow - mockDay * 5,
      },
      {
        candidateId: 'c-66',
        fullName: 'Анна Соколова',
        email: 'anna.sokolova@example.com',
        interviewsCount: 3,
        avgScore: 7.4,
        lastInterviewDate: mockNow - mockDay * 7,
      },
    ],
    weakTopics: [
      {
        topicName: 'React Performance',
        avgScore: 5.2,
        passRate: 42.5,
        sampleCount: 28,
      },
      {
        topicName: 'Node.js Streams',
        avgScore: 5.8,
        passRate: 48.0,
        sampleCount: 14,
      },
      {
        topicName: 'SQL Indexing',
        avgScore: 6.1,
        passRate: 51.3,
        sampleCount: 19,
      },
    ],
  };
}
