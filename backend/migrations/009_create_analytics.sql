-- Domain: analytics-cost (docs/database/schemas/analytics-cost.md)
-- Depends on: 007_create_ai_evaluation.sql

CREATE TABLE IF NOT EXISTS analytics_daily_rollups (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  rollup_date DATE NOT NULL,
  metric_key VARCHAR(64) NOT NULL,
  dimension_key VARCHAR(128) NOT NULL DEFAULT '',
  dimension_value VARCHAR(255) NOT NULL DEFAULT '',
  metric_value DECIMAL(14,4) NOT NULL DEFAULT 0,
  sample_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_analytics_rollups_day_metric_dim (company_id, rollup_date, metric_key, dimension_key, dimension_value),
  KEY idx_analytics_rollups_company_date (company_id, rollup_date),
  CONSTRAINT fk_analytics_rollups_company
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW v_candidate_scores AS
SELECT
  ia.id AS interview_attempt_id,
  ia.company_id,
  ia.interview_id,
  ia.candidate_id,
  ia.status AS attempt_status,
  ia.is_shortlisted,
  c.full_name AS candidate_name,
  c.email AS candidate_email,
  i.title AS interview_title,
  fe.total_score,
  fe.category,
  fe.hire_recommendation,
  fe.summary,
  ia.started_at,
  ia.completed_at,
  ia.created_at
FROM interview_attempts ia
INNER JOIN candidates c ON c.id = ia.candidate_id
INNER JOIN interviews i ON i.id = ia.interview_id
LEFT JOIN final_evaluations fe ON fe.interview_attempt_id = ia.id;

CREATE OR REPLACE VIEW v_topic_averages AS
SELECT
  ia.company_id,
  iq.topic_name,
  AVG(qe.score) AS average_score,
  COUNT(qe.id) AS evaluation_count
FROM question_evaluations qe
INNER JOIN interview_attempts ia ON ia.id = qe.interview_attempt_id
INNER JOIN interview_questions iq ON iq.id = qe.interview_question_id
WHERE iq.topic_name IS NOT NULL
GROUP BY ia.company_id, iq.topic_name;

CREATE OR REPLACE VIEW v_ai_cost_by_company_day AS
SELECT
  company_id,
  DATE(created_at) AS usage_date,
  SUM(cost_usd) AS total_cost_usd,
  SUM(prompt_tokens) AS total_prompt_tokens,
  SUM(completion_tokens) AS total_completion_tokens,
  COUNT(*) AS request_count
FROM ai_usage_logs
GROUP BY company_id, DATE(created_at);
