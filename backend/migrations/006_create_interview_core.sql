-- Domain: interview-core (docs/database/schemas/interview-core.md)
-- Depends on: 005_create_question_bank.sql

CREATE TABLE IF NOT EXISTS interviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  job_role VARCHAR(255) NOT NULL,
  profession_id BIGINT UNSIGNED NULL,
  level ENUM('junior', 'middle', 'senior', 'lead') NOT NULL,
  interview_language VARCHAR(16) NOT NULL DEFAULT 'ru',
  question_count INT UNSIGNED NOT NULL DEFAULT 5,
  job_description TEXT NULL,
  public_token CHAR(36) NOT NULL,
  status ENUM('draft', 'active', 'archived') NOT NULL DEFAULT 'draft',
  is_video_enabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interviews_public_token (public_token),
  KEY idx_interviews_company_created (company_id, created_at),
  KEY idx_interviews_company_status (company_id, status),
  KEY idx_interviews_profession_id (profession_id),
  CONSTRAINT fk_interviews_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interviews_created_by_user
    FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_interviews_profession
    FOREIGN KEY (profession_id) REFERENCES professions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  interview_id BIGINT UNSIGNED NOT NULL,
  source_question_id BIGINT UNSIGNED NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  question_text TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  ideal_answer TEXT NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  level ENUM('junior', 'middle', 'senior', 'lead') NOT NULL,
  difficulty ENUM('basic', 'intermediate', 'advanced') NOT NULL,
  topic_name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interview_questions_interview_sort (interview_id, sort_order),
  KEY idx_interview_questions_source_question (source_question_id),
  CONSTRAINT fk_interview_questions_interview
    FOREIGN KEY (interview_id) REFERENCES interviews (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_questions_source_question
    FOREIGN KEY (source_question_id) REFERENCES questions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_question_checkpoints (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  interview_question_id BIGINT UNSIGNED NOT NULL,
  checkpoint_key VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  expected TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interview_question_checkpoints_key (interview_question_id, checkpoint_key),
  KEY idx_interview_question_checkpoints_question (interview_question_id),
  CONSTRAINT fk_interview_question_checkpoints_question
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS candidates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NULL,
  linkedin_url VARCHAR(512) NULL,
  github_url VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_candidates_interview_email (interview_id, email),
  KEY idx_candidates_company_id (company_id),
  KEY idx_candidates_interview_id (interview_id),
  CONSTRAINT fk_candidates_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_candidates_interview
    FOREIGN KEY (interview_id) REFERENCES interviews (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_id BIGINT UNSIGNED NOT NULL,
  candidate_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'pending',
  is_shortlisted TINYINT(1) NOT NULL DEFAULT 0,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interview_attempts_company_status (company_id, status),
  KEY idx_interview_attempts_interview_status (interview_id, status),
  KEY idx_interview_attempts_candidate_id (candidate_id),
  KEY idx_interview_attempts_company_shortlisted (company_id, is_shortlisted),
  CONSTRAINT fk_interview_attempts_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interview_attempts_interview
    FOREIGN KEY (interview_id) REFERENCES interviews (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_attempts_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  interview_question_id BIGINT UNSIGNED NULL,
  role ENUM('ai', 'candidate') NOT NULL,
  content TEXT NOT NULL,
  sequence_order INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interview_messages_attempt_sequence (interview_attempt_id, sequence_order),
  KEY idx_interview_messages_attempt_id (interview_attempt_id),
  KEY idx_interview_messages_question_id (interview_question_id),
  CONSTRAINT fk_interview_messages_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interview_messages_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_messages_question
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
