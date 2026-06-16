-- Domain: adaptive interview topic opener before main question
-- Depends on: 014_add_interview_welcome.sql

ALTER TABLE interview_messages
  MODIFY COLUMN message_kind ENUM(
    'welcome',
    'topic_opener',
    'topic_opener_answer',
    'main_question',
    'main_answer',
    'follow_up_question',
    'follow_up_answer',
    'system_note'
  ) NULL;
