-- Domain: ai-evaluation (docs/database/schemas/ai-evaluation.md)
-- Adds the "achieved level" (demonstrated level) axis to final_evaluations:
-- the highest interview-question level the candidate actually demonstrated,
-- independent of the interview's target level. `achieved_level_method`
-- records whether the level was directly evidenced or estimated. The
-- (company_id, achieved_level) index backs the talent pool lookup
-- (past candidates with achievedLevel >= target).
-- Depends on: 007_create_ai_evaluation.sql

ALTER TABLE final_evaluations
  ADD COLUMN achieved_level ENUM('junior', 'middle', 'senior', 'lead') NULL AFTER hire_recommendation,
  ADD COLUMN achieved_level_method ENUM('evidence', 'estimate') NULL AFTER achieved_level,
  ADD INDEX idx_final_evaluations_company_achieved (company_id, achieved_level);
