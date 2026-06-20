-- Domain: company attempt review state (docs/database/schemas/attempt-review.md)
-- Depends on: 006_create_interview_core.sql, 003_create_users.sql

CREATE TABLE IF NOT EXISTS interview_attempt_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  review_status ENUM('pending', 'in_review', 'reviewed') NOT NULL DEFAULT 'pending',
  ai_assessment_verdict ENUM('pending', 'agree', 'disagree') NOT NULL DEFAULT 'pending',
  company_decision ENUM('pending', 'shortlist', 'reject', 'invite_live', 'hold') NOT NULL DEFAULT 'pending',
  ai_verdict_reason TEXT NULL,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attempt_review_company_attempt (company_id, interview_attempt_id),
  KEY idx_attempt_review_company_status (company_id, review_status),
  KEY idx_attempt_review_company_decision (company_id, company_decision),
  CONSTRAINT fk_attempt_review_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_review_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_review_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_attempt_review_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  action ENUM('review_started', 'ai_verdict_set', 'company_decision_set') NOT NULL,
  previous_value VARCHAR(64) NULL,
  new_value VARCHAR(64) NULL,
  reason TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attempt_review_events_company_attempt (company_id, interview_attempt_id),
  KEY idx_attempt_review_events_company_created (company_id, created_at),
  CONSTRAINT fk_attempt_review_events_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_review_events_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_review_events_created_by
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
