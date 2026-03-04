-- Add extracted_signals column to score_history for deterministic scoring auditability
alter table score_history add column if not exists extracted_signals jsonb;
