-- Domain: adaptive-ai-interview (docs/database/schemas/adaptive-ai-interview.md)
-- Depends on: 006_create_interview_core.sql, 007_create_ai_evaluation.sql

ALTER TABLE interview_messages
  ADD COLUMN message_kind ENUM(
    'main_question',
    'main_answer',
    'follow_up_question',
    'follow_up_answer',
    'system_note'
  ) NULL AFTER role,
  ADD COLUMN parent_message_id BIGINT UNSIGNED NULL AFTER message_kind,
  ADD COLUMN target_checkpoint_key VARCHAR(64) NULL AFTER parent_message_id,
  ADD KEY idx_interview_messages_parent_message (parent_message_id),
  ADD KEY idx_interview_messages_message_kind (message_kind),
  ADD CONSTRAINT fk_interview_messages_parent_message
    FOREIGN KEY (parent_message_id) REFERENCES interview_messages (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS interview_checkpoint_states (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  interview_question_id BIGINT UNSIGNED NOT NULL,
  checkpoint_key VARCHAR(64) NOT NULL,
  status ENUM('unseen', 'covered', 'partial', 'missed', 'unclear', 'skipped') NOT NULL DEFAULT 'unseen',
  score_awarded DECIMAL(5,2) NOT NULL DEFAULT 0,
  max_score DECIMAL(5,2) NOT NULL,
  confidence DECIMAL(5,4) NULL,
  evidence_summary TEXT NULL,
  evidence_message_ids JSON NULL,
  rationale TEXT NULL,
  follow_up_count INT UNSIGNED NOT NULL DEFAULT 0,
  needs_manual_review TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interview_checkpoint_states_attempt_question_key (
    interview_attempt_id,
    interview_question_id,
    checkpoint_key
  ),
  KEY idx_interview_checkpoint_states_company_attempt (company_id, interview_attempt_id),
  KEY idx_interview_checkpoint_states_question_status (interview_question_id, status),
  KEY idx_interview_checkpoint_states_attempt_id (interview_attempt_id),
  CONSTRAINT fk_interview_checkpoint_states_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interview_checkpoint_states_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_checkpoint_states_question
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_follow_ups (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  interview_question_id BIGINT UNSIGNED NOT NULL,
  checkpoint_key VARCHAR(64) NOT NULL,
  follow_up_question_message_id BIGINT UNSIGNED NULL,
  candidate_answer_message_id BIGINT UNSIGNED NULL,
  question_text TEXT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('planned', 'asked', 'answered', 'skipped', 'failed') NOT NULL DEFAULT 'planned',
  sort_order INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interview_follow_ups_attempt_question_sort (
    interview_attempt_id,
    interview_question_id,
    sort_order
  ),
  KEY idx_interview_follow_ups_attempt_checkpoint (interview_attempt_id, checkpoint_key),
  KEY idx_interview_follow_ups_company_id (company_id),
  CONSTRAINT fk_interview_follow_ups_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interview_follow_ups_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_follow_ups_question
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interview_follow_ups_question_message
    FOREIGN KEY (follow_up_question_message_id) REFERENCES interview_messages (id) ON DELETE SET NULL,
  CONSTRAINT fk_interview_follow_ups_answer_message
    FOREIGN KEY (candidate_answer_message_id) REFERENCES interview_messages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_question_summaries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  interview_question_id BIGINT UNSIGNED NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  summary TEXT NOT NULL,
  strengths JSON NULL,
  weaknesses JSON NULL,
  unclear_checkpoints JSON NULL,
  follow_up_count INT UNSIGNED NOT NULL DEFAULT 0,
  needs_manual_review TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interview_question_summaries_attempt_question (
    interview_attempt_id,
    interview_question_id
  ),
  KEY idx_interview_question_summaries_company_attempt (company_id, interview_attempt_id),
  KEY idx_interview_question_summaries_attempt_id (interview_attempt_id),
  CONSTRAINT fk_interview_question_summaries_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interview_question_summaries_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_question_summaries_question
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
