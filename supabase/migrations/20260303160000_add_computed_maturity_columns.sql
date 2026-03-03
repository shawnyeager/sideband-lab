-- Add computed maturity columns to layers table
-- Supports system-suggested maturity labels derived from entity score analysis

alter table layers add column if not exists computed_status text;
alter table layers add column if not exists computed_status_note text;
alter table layers add column if not exists status_override boolean not null default false;
alter table layers add column if not exists override_rationale text;
