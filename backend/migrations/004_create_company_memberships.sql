-- Domain: auth-company (docs/database/schemas/auth-company.md)
-- Depends on: 002_create_companies.sql, 003_create_users.sql

CREATE TABLE IF NOT EXISTS company_memberships (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('owner', 'member') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_memberships_company_user (company_id, user_id),
  KEY idx_company_memberships_user_id (user_id),
  KEY idx_company_memberships_company_id (company_id),
  KEY idx_company_memberships_company_role (company_id, role),
  CONSTRAINT fk_company_memberships_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_company_memberships_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
