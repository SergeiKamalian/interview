-- Domain: question-bank + interview-core snapshot
-- Checkpoint evaluation metadata: hints + per-checkpoint examples

ALTER TABLE question_checkpoints
  ADD COLUMN evaluation_hints JSON NULL AFTER expected;

ALTER TABLE interview_question_checkpoints
  ADD COLUMN evaluation_hints JSON NULL AFTER expected;

ALTER TABLE answer_examples
  ADD COLUMN checkpoint_key VARCHAR(64) NULL AFTER question_id,
  ADD KEY idx_answer_examples_checkpoint (question_id, checkpoint_key, example_type);

CREATE TABLE IF NOT EXISTS interview_answer_examples (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  interview_question_id BIGINT UNSIGNED NOT NULL,
  checkpoint_key VARCHAR(64) NULL,
  example_type ENUM('good', 'bad') NOT NULL,
  example_text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interview_answer_examples_lookup (
    interview_question_id,
    checkpoint_key,
    example_type,
    sort_order
  ),
  CONSTRAINT fk_interview_answer_examples_question
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
