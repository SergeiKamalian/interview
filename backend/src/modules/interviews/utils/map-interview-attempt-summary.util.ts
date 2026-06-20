import type {
  AchievedLevelMethodEnum,
  HireRecommendationEnum,
} from '../../ai-evaluation/graphql/final-evaluation.type';
import type { QuestionLevelEnum } from '../../question-bank/types/question.type';
import type {
  AiAssessmentVerdictEnum,
  AttemptReviewStatusEnum,
  CompanyAttemptDecisionEnum,
} from '../../attempt-review/graphql/attempt-review.type';
import type { AttemptStatusEnum } from '../../interview-core/types/interview.type';
import type { InterviewAttemptPageRow } from '../repositories/interview-attempts-page.repository';
import type { InterviewAttemptSummaryType } from '../graphql/interview-details.type';

export function resolveAttemptEvaluationStatus(
  status: string,
  totalScore: string | null,
): string {
  if (status !== 'completed') {
    return 'evaluation_pending';
  }

  return totalScore != null ? 'ready' : 'evaluation_pending';
}

export function mapInterviewAttemptRowToSummary(
  attempt: InterviewAttemptPageRow,
): InterviewAttemptSummaryType {
  return {
    attemptId: String(attempt.id),
    candidateId: String(attempt.candidate_id),
    candidateName: attempt.candidate_name,
    candidateEmail: attempt.candidate_email,
    status: attempt.status as AttemptStatusEnum,
    startedAt: attempt.started_at
      ? Math.floor(attempt.started_at.getTime() / 1000)
      : null,
    completedAt: attempt.completed_at
      ? Math.floor(attempt.completed_at.getTime() / 1000)
      : null,
    overallScore:
      attempt.total_score != null ? Number(attempt.total_score) : null,
    hireRecommendation: attempt.hire_recommendation
      ? (attempt.hire_recommendation as HireRecommendationEnum)
      : null,
    evaluationStatus: resolveAttemptEvaluationStatus(
      attempt.status,
      attempt.total_score,
    ),
    achievedLevel: attempt.achieved_level
      ? (attempt.achieved_level as QuestionLevelEnum)
      : null,
    achievedLevelMethod: attempt.achieved_level_method
      ? (attempt.achieved_level_method as AchievedLevelMethodEnum)
      : null,
    needsManualReview: attempt.needs_manual_review === 1,
    shortlistStatus: attempt.shortlist_status,
    reviewStatus: (attempt.review_status ??
      'pending') as AttemptReviewStatusEnum,
    aiAssessmentVerdict: (attempt.ai_assessment_verdict ??
      'pending') as AiAssessmentVerdictEnum,
    companyDecision: (attempt.company_decision ??
      'pending') as CompanyAttemptDecisionEnum,
    reviewedAt: attempt.reviewed_at
      ? Math.floor(attempt.reviewed_at.getTime() / 1000)
      : null,
    hasTeamNotes: attempt.has_team_notes === 1,
  };
}
