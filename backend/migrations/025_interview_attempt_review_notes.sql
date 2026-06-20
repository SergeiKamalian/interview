-- Domain: company attempt review notes (docs/database/schemas/attempt-review.md)
-- Depends on: 024_interview_attempt_review_state.sql, 003_create_users.sql

CREATE TABLE IF NOT EXISTS interview_attempt_review_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attempt_review_notes_company_attempt (company_id, interview_attempt_id),
  KEY idx_attempt_review_notes_company_created (company_id, created_at),
  CONSTRAINT fk_attempt_review_notes_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_review_notes_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_review_notes_created_by
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_attempt_review_notes_updated_by
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
