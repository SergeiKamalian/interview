/**
 * Adaptive interview schema alignment with docs/database/schemas/adaptive-ai-interview.md
 * and backend/migrations/013_create_adaptive_ai_interview.sql.
 */
export const ADAPTIVE_INTERVIEW_TABLES = {
  interviewCheckpointStates: 'interview_checkpoint_states',
  interviewFollowUps: 'interview_follow_ups',
  interviewQuestionSummaries: 'interview_question_summaries',
} as const;

export const CHECKPOINT_STATE_STATUSES = [
  'unseen',
  'covered',
  'partial',
  'missed',
  'unclear',
  'skipped',
] as const;
