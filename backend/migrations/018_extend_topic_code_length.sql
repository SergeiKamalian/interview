-- Extend topics.code for long ITLead-derived topic identifiers (max observed: 79)

ALTER TABLE topics
  MODIFY COLUMN code VARCHAR(128) NOT NULL;
