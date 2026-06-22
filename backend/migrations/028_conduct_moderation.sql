-- Domain: conduct moderation — abusive candidate messages trigger warning / early termination
-- Depends on: 015_add_topic_opener_messages.sql

ALTER TABLE interview_messages
  MODIFY COLUMN message_kind ENUM(
    'welcome',
    'topic_opener',
    'topic_opener_answer',
    'main_question',
    'main_answer',
    'follow_up_question',
    'follow_up_answer',
    'system_note',
    'conduct_violation',
    'conduct_warning',
    'conduct_terminated'
  ) NULL;
