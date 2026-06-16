-- Domain: interview-core welcome message (customizable per interview)
-- Depends on: 013_create_adaptive_ai_interview.sql

ALTER TABLE interviews
  ADD COLUMN interviewer_name VARCHAR(255) NULL AFTER is_video_enabled,
  ADD COLUMN welcome_message_template TEXT NULL AFTER interviewer_name;

ALTER TABLE interview_messages
  MODIFY COLUMN message_kind ENUM(
    'welcome',
    'main_question',
    'main_answer',
    'follow_up_question',
    'follow_up_answer',
    'system_note'
  ) NULL;
