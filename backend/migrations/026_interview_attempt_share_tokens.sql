-- Domain: shareable attempt review links (docs/database/schemas/attempt-review.md)
-- Tokenized read-only summary for colleagues without full dashboard access.
-- Depends on: 025_interview_attempt_review_notes.sql

CREATE TABLE IF NOT EXISTS interview_attempt_share_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  token CHAR(64) NOT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  revoked_at TIMESTAMP NULL DEFAULT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attempt_share_token (token),
  KEY idx_attempt_share_company_attempt (company_id, interview_attempt_id),
  KEY idx_attempt_share_attempt_active (interview_attempt_id, revoked_at, expires_at),
  CONSTRAINT fk_attempt_share_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_share_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_share_created_by
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
