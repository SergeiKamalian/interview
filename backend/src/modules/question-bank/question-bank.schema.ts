/**
 * Question bank schema alignment with docs/database/schemas/question-bank.md
 * and backend/migrations/005_create_question_bank.sql.
 */
export const QUESTION_BANK_TABLES = {
  professions: 'professions',
  skills: 'skills',
  topics: 'topics',
  questions: 'questions',
  questionSkills: 'question_skills',
  questionCheckpoints: 'question_checkpoints',
  answerExamples: 'answer_examples',
} as const;

/** Visible to a company: global (NULL) + own questions, not soft-deleted. */
export const QUESTION_VISIBILITY_FILTER =
  '(company_id IS NULL OR company_id = ?) AND deleted_at IS NULL AND is_active = 1';

/** Enforced on save in application layer (TASK-05.6). */
export const CHECKPOINT_SCORE_RULE =
  'SUM(checkpoint.score) must equal question.max_score';
