-- Applied directly to project dolpnpuycjfppflcqexe on 2026-09-24.
-- This is a same-project rollback aid for the application-owned public tables.
-- It is not an off-site disaster-recovery backup.

CREATE SCHEMA IF NOT EXISTS backup_wave0_20260924 AUTHORIZATION postgres;

REVOKE ALL ON SCHEMA backup_wave0_20260924
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE backup_wave0_20260924.manifest (
  table_name TEXT PRIMARY KEY,
  source_row_count BIGINT NOT NULL,
  backup_row_count BIGINT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT source_and_backup_counts_match
    CHECK (source_row_count = backup_row_count)
);

DO $backup$
DECLARE
  source_table RECORD;
  source_count BIGINT;
  backup_count BIGINT;
BEGIN
  FOR source_table IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
    ORDER BY c.relname
  LOOP
    EXECUTE format(
      'create table backup_wave0_20260924.%I (like public.%I including all)',
      source_table.table_name,
      source_table.table_name
    );

    EXECUTE format(
      'insert into backup_wave0_20260924.%I select * from public.%I',
      source_table.table_name,
      source_table.table_name
    );

    EXECUTE format(
      'select count(*) from public.%I',
      source_table.table_name
    ) INTO source_count;

    EXECUTE format(
      'select count(*) from backup_wave0_20260924.%I',
      source_table.table_name
    ) INTO backup_count;

    INSERT INTO backup_wave0_20260924.manifest (
      table_name,
      source_row_count,
      backup_row_count
    ) VALUES (
      source_table.table_name,
      source_count,
      backup_count
    );
  END LOOP;
END
$backup$;

REVOKE ALL ON ALL TABLES IN SCHEMA backup_wave0_20260924
  FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON SCHEMA backup_wave0_20260924 IS
  'Logical pre-change snapshot for CitaSync wave 0. Same-project rollback aid; not an off-site disaster-recovery backup.';
