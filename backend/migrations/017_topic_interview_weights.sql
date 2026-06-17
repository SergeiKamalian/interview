-- Topic importance weights for weighted final interview score.
-- Depends on: 016_checkpoint_evaluation_hints.sql

ALTER TABLE topics
  ADD COLUMN interview_weight DECIMAL(4,2) NOT NULL DEFAULT 1
    COMMENT 'Topic importance in final interview score (1-10 typical)'
  AFTER name;

ALTER TABLE interview_questions
  ADD COLUMN topic_weight DECIMAL(4,2) NOT NULL DEFAULT 1
    COMMENT 'Snapshot of topic interview_weight at interview creation'
  AFTER topic_name;

UPDATE topics
SET interview_weight = CASE code
  WHEN 'react_fiber' THEN 8
  WHEN 'react_lazy_suspense' THEN 5
  WHEN 'react_hooks' THEN 6
  WHEN 'state_management' THEN 6
  WHEN 'typescript_generics' THEN 5
  WHEN 'javascript_closures' THEN 4
  WHEN 'javascript_event_loop' THEN 5
  WHEN 'react_forms' THEN 3
  WHEN 'css_flexbox' THEN 2
  ELSE interview_weight
END
WHERE code IN (
  'react_fiber',
  'react_lazy_suspense',
  'react_hooks',
  'state_management',
  'typescript_generics',
  'javascript_closures',
  'javascript_event_loop',
  'react_forms',
  'css_flexbox'
);
