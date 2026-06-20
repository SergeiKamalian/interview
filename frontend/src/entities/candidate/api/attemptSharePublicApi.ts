import { env } from '@shared/config/env';

export type SharedAttemptReviewSummary = {
  candidateName: string;
  interviewTitle: string;
  jobRole: string;
  interviewLevel: string;
  completedAt: number | null;
  totalScore: number | null;
  hireRecommendation: string | null;
  achievedLevel: string | null;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  needsManualReview: boolean;
};

function resolveShareSummaryUrl(token: string): string {
  const base = env.apiUrl.replace(/\/$/, '');
  const path = `/api/public/attempt-share/${encodeURIComponent(token)}`;
  return base ? `${base}${path}` : path;
}

export async function fetchSharedAttemptReview(
  token: string,
): Promise<SharedAttemptReviewSummary> {
  const response = await fetch(resolveShareSummaryUrl(token));

  if (!response.ok) {
    throw new Error('Share link not found or expired');
  }

  return response.json() as Promise<SharedAttemptReviewSummary>;
}

export function buildShareUrl(sharePath: string): string {
  return `${window.location.origin}${sharePath}`;
}
