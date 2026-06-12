-- Domain: ai-evaluation (docs/database/schemas/ai-evaluation.md)
-- Depends on: 006_create_interview_core.sql

CREATE TABLE IF NOT EXISTS question_evaluations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  interview_message_id BIGINT UNSIGNED NOT NULL,
  interview_question_id BIGINT UNSIGNED NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  short_summary TEXT NULL,
  review TEXT NULL,
  raw_response JSON NULL,
  needs_manual_review TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_question_evaluations_message (interview_message_id),
  KEY idx_question_evaluations_attempt_id (interview_attempt_id),
  KEY idx_question_evaluations_company_id (company_id),
  KEY idx_question_evaluations_question_id (interview_question_id),
  CONSTRAINT fk_question_evaluations_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_question_evaluations_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_question_evaluations_message
    FOREIGN KEY (interview_message_id) REFERENCES interview_messages (id) ON DELETE CASCADE,
  CONSTRAINT fk_question_evaluations_question
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checkpoint_results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_evaluation_id BIGINT UNSIGNED NOT NULL,
  checkpoint_key VARCHAR(64) NOT NULL,
  matched TINYINT(1) NOT NULL DEFAULT 0,
  score_awarded DECIMAL(5,2) NOT NULL DEFAULT 0,
  evidence_quote TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_checkpoint_results_eval_key (question_evaluation_id, checkpoint_key),
  KEY idx_checkpoint_results_evaluation_id (question_evaluation_id),
  CONSTRAINT fk_checkpoint_results_evaluation
    FOREIGN KEY (question_evaluation_id) REFERENCES question_evaluations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS final_evaluations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  total_score DECIMAL(5,2) NOT NULL,
  category ENUM('weak', 'basic', 'average', 'good', 'strong') NOT NULL,
  hire_recommendation ENUM('strong_reject', 'reject', 'maybe', 'invite', 'strong_invite') NOT NULL,
  summary TEXT NOT NULL,
  detailed_summary TEXT NULL,
  strengths JSON NULL,
  weaknesses JSON NULL,
  risks JSON NULL,
  raw_response JSON NULL,
  needs_manual_review TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_final_evaluations_attempt (interview_attempt_id),
  KEY idx_final_evaluations_company_score (company_id, total_score),
  KEY idx_final_evaluations_company_category (company_id, category),
  CONSTRAINT fk_final_evaluations_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_final_evaluations_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NULL,
  interview_message_id BIGINT UNSIGNED NULL,
  provider VARCHAR(64) NOT NULL,
  model VARCHAR(128) NOT NULL,
  operation_type VARCHAR(64) NOT NULL,
  prompt_tokens INT UNSIGNED NOT NULL DEFAULT 0,
  completion_tokens INT UNSIGNED NOT NULL DEFAULT 0,
  cost_usd DECIMAL(12,6) NOT NULL DEFAULT 0,
  latency_ms INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ai_usage_logs_company_created (company_id, created_at),
  KEY idx_ai_usage_logs_attempt_id (interview_attempt_id),
  KEY idx_ai_usage_logs_company_operation (company_id, operation_type),
  CONSTRAINT fk_ai_usage_logs_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_ai_usage_logs_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE SET NULL,
  CONSTRAINT fk_ai_usage_logs_message
    FOREIGN KEY (interview_message_id) REFERENCES interview_messages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
