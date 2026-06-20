-- Domain: interview-creation-flow config fields (docs/interview-creation/README.md §5)
-- Adds AI behavior knobs (tone/depth/strictness), access limits and candidate
-- required-field flags to interviews, mirrored on interview_templates.
-- expires_at is intentionally interview-only (deadline is always per-instance).
-- Depends on: 019_create_interview_templates.sql

ALTER TABLE interviews
  ADD COLUMN ai_tone ENUM('friendly', 'neutral', 'strict') NOT NULL DEFAULT 'neutral' AFTER welcome_message_template,
  ADD COLUMN probing_depth ENUM('shallow', 'balanced', 'deep') NOT NULL DEFAULT 'balanced' AFTER ai_tone,
  ADD COLUMN scoring_strictness ENUM('lenient', 'balanced', 'strict') NOT NULL DEFAULT 'balanced' AFTER probing_depth,
  ADD COLUMN expires_at DATETIME NULL AFTER scoring_strictness,
  ADD COLUMN max_completions INT UNSIGNED NULL AFTER expires_at,
  ADD COLUMN allow_retake TINYINT(1) NOT NULL DEFAULT 0 AFTER max_completions,
  ADD COLUMN time_limit_minutes INT UNSIGNED NULL AFTER allow_retake,
  ADD COLUMN passing_score DECIMAL(4,2) NULL AFTER time_limit_minutes,
  ADD COLUMN require_phone TINYINT(1) NOT NULL DEFAULT 0 AFTER passing_score,
  ADD COLUMN require_linkedin TINYINT(1) NOT NULL DEFAULT 0 AFTER require_phone,
  ADD COLUMN require_github TINYINT(1) NOT NULL DEFAULT 0 AFTER require_linkedin;

ALTER TABLE interview_templates
  ADD COLUMN ai_tone ENUM('friendly', 'neutral', 'strict') NOT NULL DEFAULT 'neutral' AFTER welcome_message_template,
  ADD COLUMN probing_depth ENUM('shallow', 'balanced', 'deep') NOT NULL DEFAULT 'balanced' AFTER ai_tone,
  ADD COLUMN scoring_strictness ENUM('lenient', 'balanced', 'strict') NOT NULL DEFAULT 'balanced' AFTER probing_depth,
  ADD COLUMN max_completions INT UNSIGNED NULL AFTER scoring_strictness,
  ADD COLUMN allow_retake TINYINT(1) NOT NULL DEFAULT 0 AFTER max_completions,
  ADD COLUMN time_limit_minutes INT UNSIGNED NULL AFTER allow_retake,
  ADD COLUMN passing_score DECIMAL(4,2) NULL AFTER time_limit_minutes,
  ADD COLUMN require_phone TINYINT(1) NOT NULL DEFAULT 0 AFTER passing_score,
  ADD COLUMN require_linkedin TINYINT(1) NOT NULL DEFAULT 0 AFTER require_phone,
  ADD COLUMN require_github TINYINT(1) NOT NULL DEFAULT 0 AFTER require_linkedin;
