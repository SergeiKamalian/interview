-- Domain: interview-creation-flow live preview (docs/interview-creation/README.md §7)
-- Adds an `is_preview` flag to interview attempts so a company owner can run the
-- interview as a candidate ("попробовать как кандидат") without polluting the real
-- funnel: preview attempts are excluded from completion limits, candidate lists and
-- analytics. Preview sessions reuse the public session flow but are started via an
-- owner-authenticated resolver (not the public token), so they work even on `draft`.
-- Depends on: 006_create_interview_core.sql

ALTER TABLE interview_attempts
  ADD COLUMN is_preview TINYINT(1) NOT NULL DEFAULT 0 AFTER is_shortlisted;

CREATE INDEX idx_interview_attempts_preview
  ON interview_attempts (interview_id, is_preview);
