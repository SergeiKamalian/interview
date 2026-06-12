-- Domain: media-storage (docs/database/schemas/media-storage.md)
-- Depends on: 006_create_interview_core.sql

CREATE TABLE IF NOT EXISTS media_assets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_attempt_id BIGINT UNSIGNED NOT NULL,
  interview_message_id BIGINT UNSIGNED NULL,
  media_type ENUM('audio', 'video') NOT NULL,
  storage_bucket VARCHAR(255) NOT NULL DEFAULT 'local',
  storage_key VARCHAR(512) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  file_size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  duration_ms INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_media_assets_company_bucket_key (company_id, storage_bucket, storage_key(191)),
  KEY idx_media_assets_attempt_id (interview_attempt_id),
  KEY idx_media_assets_message_id (interview_message_id),
  KEY idx_media_assets_company_type (company_id, media_type),
  CONSTRAINT fk_media_assets_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_media_assets_attempt
    FOREIGN KEY (interview_attempt_id) REFERENCES interview_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_media_assets_message
    FOREIGN KEY (interview_message_id) REFERENCES interview_messages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_transcripts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  media_asset_id BIGINT UNSIGNED NOT NULL,
  interview_message_id BIGINT UNSIGNED NULL,
  transcript_text TEXT NOT NULL,
  source ENUM('stt', 'manual') NOT NULL DEFAULT 'stt',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_media_transcripts_asset (media_asset_id),
  KEY idx_media_transcripts_message_id (interview_message_id),
  KEY idx_media_transcripts_company_id (company_id),
  CONSTRAINT fk_media_transcripts_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_media_transcripts_asset
    FOREIGN KEY (media_asset_id) REFERENCES media_assets (id) ON DELETE CASCADE,
  CONSTRAINT fk_media_transcripts_message
    FOREIGN KEY (interview_message_id) REFERENCES interview_messages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
