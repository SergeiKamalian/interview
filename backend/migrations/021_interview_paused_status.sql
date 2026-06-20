-- Domain: interview-creation-flow lifecycle (docs/interview-creation/README.md §6)
-- Adds a manual `paused` status to the interview lifecycle:
--   draft -> active -> (paused <-> active) -> archived
-- `paused` interviews stop accepting candidates (public access still requires
-- status = 'active'), but can be resumed without archiving.
-- Depends on: 006_create_interview_core.sql

ALTER TABLE interviews
  MODIFY COLUMN status ENUM('draft', 'active', 'paused', 'archived') NOT NULL DEFAULT 'draft';
