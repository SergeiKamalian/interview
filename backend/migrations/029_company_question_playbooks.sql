-- Domain: company question bank playbooks (docs/database/schemas/company-question-bank.md)
-- Depends on: 028_conduct_moderation.sql

CREATE TABLE IF NOT EXISTS company_question_playbooks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  profession_id BIGINT UNSIGNED NOT NULL,
  level ENUM('junior', 'middle', 'senior', 'lead') NOT NULL,
  skill_ids JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_company_question_playbooks_company_active (company_id, is_active),
  KEY idx_company_question_playbooks_profession (profession_id),
  CONSTRAINT fk_company_question_playbooks_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_company_question_playbooks_profession
    FOREIGN KEY (profession_id) REFERENCES professions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_question_playbook_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  playbook_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_pinned TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_playbook_items_playbook_question (playbook_id, question_id),
  KEY idx_playbook_items_playbook_sort (playbook_id, sort_order),
  KEY idx_playbook_items_question (question_id),
  CONSTRAINT fk_playbook_items_playbook
    FOREIGN KEY (playbook_id) REFERENCES company_question_playbooks (id) ON DELETE CASCADE,
  CONSTRAINT fk_playbook_items_question
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
