import type { FinalEvaluationByAttemptQuery } from '@shared/api/graphql/generated/graphql';
import type { InterviewAttemptsPageItem } from '@entities/interview/model/interview.types';

export type AttemptExportInterviewMeta = {
  id: string;
  title: string;
  jobRole: string;
  professionName?: string | null;
  level?: string | null;
  status: string;
  questionCount: number;
  skills: string[];
};

export type AttemptExportCandidateRecord = {
  attemptId: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  attempt: {
    status: string;
    completedAt?: number | null;
    evaluationStatus: string;
    overallScore?: number | null;
    hireRecommendation?: string | null;
    achievedLevel?: string | null;
    achievedLevelMethod?: string | null;
    needsManualReview: boolean;
    shortlistStatus: string;
  };
  companyReview: {
    reviewStatus: string;
    aiAssessmentVerdict: string;
    companyDecision: string;
    reviewedAt?: number | null;
  };
  evaluation: FinalEvaluationByAttemptQuery['finalEvaluationByAttempt'];
};

export type AttemptExportBundle = {
  schemaVersion: '1.0';
  exportedAt: string;
  interview: AttemptExportInterviewMeta;
  candidates: AttemptExportCandidateRecord[];
};

export type AttemptExportTableItem = InterviewAttemptsPageItem;
