/**
 * Interview core schema alignment with docs/database/schemas/interview-core.md
 * and backend/migrations/006_create_interview_core.sql.
 */
export const INTERVIEW_CORE_TABLES = {
  interviews: 'interviews',
  interviewQuestions: 'interview_questions',
  interviewQuestionCheckpoints: 'interview_question_checkpoints',
  candidates: 'candidates',
  interviewAttempts: 'interview_attempts',
  interviewMessages: 'interview_messages',
} as const;

/** Recruiter list filter — company-scoped interviews. */
export const INTERVIEW_COMPANY_FILTER = 'company_id = ?';

/** Public candidate access by immutable snapshot token. */
export const INTERVIEW_PUBLIC_TOKEN_FILTER = 'public_token = ? AND status = ?';

/** Default status for newly created recruiter interviews. */
export const INTERVIEW_DEFAULT_STATUS = 'draft' as const;

/** Active interviews accept candidate attempts via public link. */
export const INTERVIEW_PUBLISHED_STATUS = 'active' as const;
