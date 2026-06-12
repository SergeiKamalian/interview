-- Domain: ats-integrations (docs/database/schemas/ats-integrations.md)
-- Depends on: 007_create_ai_evaluation.sql

CREATE TABLE IF NOT EXISTS integration_configs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(64) NOT NULL DEFAULT 'webhook',
  webhook_url VARCHAR(1024) NOT NULL,
  webhook_secret_hash VARCHAR(255) NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  max_attempts INT UNSIGNED NOT NULL DEFAULT 5,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_integration_configs_company_enabled (company_id, is_enabled),
  CONSTRAINT fk_integration_configs_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS integration_deliveries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  integration_config_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  status ENUM('pending', 'in_progress', 'delivered', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts INT UNSIGNED NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMP NULL,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_integration_deliveries_idempotency (company_id, idempotency_key),
  UNIQUE KEY uq_integration_deliveries_attempt_config (interview_attempt_id, integration_config_id),
  KEY idx_integration_deliveries_status_retry (status, next_retry_at),
  KEY idx_integration_deliveries_company_id (company_id),
  CONSTRAINT fk_integration_deliveries_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_integration_deliveries_config
    FOREIGN KEY (integration_config_id) REFERENCES integration_configs (id) ON DELETE CASCADE,
  CONSTRAINT fk_integration_deliveries_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS integration_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  integration_delivery_id BIGINT UNSIGNED NOT NULL,
  attempt_number INT UNSIGNED NOT NULL,
  http_status INT NULL,
  request_payload JSON NULL,
  response_payload JSON NULL,
  error_message TEXT NULL,
  duration_ms INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_integration_logs_delivery_id (integration_delivery_id),
  KEY idx_integration_logs_company_created (company_id, created_at),
  CONSTRAINT fk_integration_logs_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_integration_logs_delivery
    FOREIGN KEY (integration_delivery_id) REFERENCES integration_deliveries (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
