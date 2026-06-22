-- Domain: company question bank overlay (docs/database/schemas/company-question-bank.md)
-- Depends on: 026_interview_attempt_share_tokens.sql

-- skills: optional company scope (NULL = platform-global)
ALTER TABLE skills
  ADD COLUMN company_id BIGINT UNSIGNED NULL AFTER id,
  ADD KEY idx_skills_company_active (company_id, is_active),
  ADD CONSTRAINT fk_skills_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE;

ALTER TABLE skills
  DROP INDEX uq_skills_code,
  ADD UNIQUE KEY uq_skills_company_code (company_id, code);

-- topics: optional company scope (NULL = platform-global)
ALTER TABLE topics
  ADD COLUMN company_id BIGINT UNSIGNED NULL AFTER id,
  ADD KEY idx_topics_company_active (company_id, is_active),
  ADD CONSTRAINT fk_topics_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE;

ALTER TABLE topics
  DROP INDEX uq_topics_code,
  ADD UNIQUE KEY uq_topics_company_code (company_id, code);

-- questions: fork lineage + company metadata
ALTER TABLE questions
  ADD COLUMN source_question_id BIGINT UNSIGNED NULL AFTER company_id,
  ADD COLUMN status ENUM('draft', 'published') NOT NULL DEFAULT 'published' AFTER is_active,
  ADD COLUMN company_priority TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER status,
  ADD COLUMN is_required TINYINT(1) NOT NULL DEFAULT 0 AFTER company_priority,
  ADD KEY idx_questions_company_status_required (company_id, status, is_required),
  ADD KEY idx_questions_source_question (source_question_id),
  ADD CONSTRAINT fk_questions_source_question
    FOREIGN KEY (source_question_id) REFERENCES questions (id) ON DELETE SET NULL;

-- Backfill: existing rows keep published status and default priority/required flags
UPDATE questions
SET
  status = 'published',
  company_priority = 0,
  is_required = 0
WHERE status IS NOT NULL;

CREATE TABLE IF NOT EXISTS company_question_overrides (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  source_question_id BIGINT UNSIGNED NOT NULL,
  extra_must_concepts JSON NULL,
  extra_false_claims JSON NULL,
  extra_answer_examples JSON NULL,
  topic_weight_override DECIMAL(4,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_question_overrides_company_source (company_id, source_question_id),
  KEY idx_company_question_overrides_company (company_id),
  KEY idx_company_question_overrides_source (source_question_id),
  CONSTRAINT fk_company_question_overrides_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_company_question_overrides_source
    FOREIGN KEY (source_question_id) REFERENCES questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
