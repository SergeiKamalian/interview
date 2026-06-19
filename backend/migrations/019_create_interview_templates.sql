-- Domain: interview-templates (docs/database/schemas/interview-templates.md)
-- Depends on: 006_create_interview_core.sql

CREATE TABLE IF NOT EXISTS interview_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  job_role VARCHAR(255) NOT NULL,
  profession_id BIGINT UNSIGNED NULL,
  level ENUM('junior', 'middle', 'senior', 'lead') NOT NULL,
  interview_language VARCHAR(16) NOT NULL DEFAULT 'ru',
  question_count INT UNSIGNED NOT NULL DEFAULT 0,
  job_description TEXT NULL,
  is_video_enabled TINYINT(1) NOT NULL DEFAULT 0,
  interviewer_name VARCHAR(255) NULL,
  welcome_message_template TEXT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interview_templates_company_updated (company_id, updated_at),
  KEY idx_interview_templates_company_status (company_id, status),
  KEY idx_interview_templates_company_role_level (company_id, job_role, level),
  KEY idx_interview_templates_profession_id (profession_id),
  KEY idx_interview_templates_created_by_user (created_by_user_id),
  CONSTRAINT fk_interview_templates_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_interview_templates_created_by_user
    FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_interview_templates_profession
    FOREIGN KEY (profession_id) REFERENCES professions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_template_questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  template_id BIGINT UNSIGNED NOT NULL,
  source_question_id BIGINT UNSIGNED NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interview_template_questions_sort (template_id, sort_order),
  UNIQUE KEY uq_interview_template_questions_source (template_id, source_question_id),
  KEY idx_interview_template_questions_template_sort (template_id, sort_order),
  KEY idx_interview_template_questions_source_question (source_question_id),
  CONSTRAINT fk_interview_template_questions_template
    FOREIGN KEY (template_id) REFERENCES interview_templates (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_template_questions_source_question
    FOREIGN KEY (source_question_id) REFERENCES questions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
