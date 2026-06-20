import type { FinalEvaluationByAttemptQuery } from '@shared/api/graphql/generated/graphql';
import type {
  AttemptExportBundle,
  AttemptExportInterviewMeta,
  AttemptExportTableItem,
} from './attemptExport.types';

type BuildAttemptExportBundleInput = {
  interview: AttemptExportInterviewMeta;
  selectedAttempts: AttemptExportTableItem[];
  evaluationsByAttemptId: Map<
    string,
    FinalEvaluationByAttemptQuery['finalEvaluationByAttempt']
  >;
};

export function buildAttemptExportBundle({
  interview,
  selectedAttempts,
  evaluationsByAttemptId,
}: BuildAttemptExportBundleInput): AttemptExportBundle {
  const candidates = [...selectedAttempts]
    .sort((left, right) => {
      const leftScore = left.overallScore ?? -1;
      const rightScore = right.overallScore ?? -1;

      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return left.candidateName.localeCompare(right.candidateName, 'ru');
    })
    .map((attempt) => ({
      attemptId: attempt.attemptId,
      candidate: {
        id: attempt.candidateId,
        name: attempt.candidateName,
        email: attempt.candidateEmail,
      },
      attempt: {
        status: attempt.status,
        completedAt: attempt.completedAt,
        evaluationStatus: attempt.evaluationStatus,
        overallScore: attempt.overallScore,
        hireRecommendation: attempt.hireRecommendation,
        achievedLevel: attempt.achievedLevel,
        achievedLevelMethod: attempt.achievedLevelMethod,
        needsManualReview: attempt.needsManualReview,
        shortlistStatus: attempt.shortlistStatus,
      },
      companyReview: {
        reviewStatus: attempt.reviewStatus,
        aiAssessmentVerdict: attempt.aiAssessmentVerdict,
        companyDecision: attempt.companyDecision,
        reviewedAt: attempt.reviewedAt,
      },
      evaluation: evaluationsByAttemptId.get(attempt.attemptId) ?? null,
    }));

  return {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    interview,
    candidates,
  };
}
