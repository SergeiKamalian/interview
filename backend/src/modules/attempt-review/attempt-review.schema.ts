export const ATTEMPT_REVIEW_TABLES = {
  reviews: 'interview_attempt_reviews',
  events: 'interview_attempt_review_events',
  shareTokens: 'interview_attempt_share_tokens',
  notes: 'interview_attempt_review_notes',
} as const;

export const ATTEMPT_REVIEW_NOTE_BODY_MAX_LENGTH = 5000;

export type AttemptReviewStatus = 'pending' | 'in_review' | 'reviewed';

export type AiAssessmentVerdict = 'pending' | 'agree' | 'disagree';

export type CompanyAttemptDecision =
  | 'pending'
  | 'shortlist'
  | 'reject'
  | 'invite_live'
  | 'hold';

export type AttemptReviewEventAction =
  | 'review_started'
  | 'ai_verdict_set'
  | 'company_decision_set';

export const DEFAULT_ATTEMPT_REVIEW_STATE = {
  reviewStatus: 'pending' as AttemptReviewStatus,
  aiAssessmentVerdict: 'pending' as AiAssessmentVerdict,
  companyDecision: 'pending' as CompanyAttemptDecision,
  reviewedAt: null as Date | null,
};
