-- Read-only verification report for English Space.
-- Run after schema.sql. Each row should return PASS.

with required(name) as (
  values
    ('homework_progress'),
    ('vocabulary_progress'),
    ('vocabulary_topic_progress'),
    ('grammar_progress'),
    ('telegram_recipients'),
    ('material_publications')
), existing as (
  select table_name from information_schema.tables where table_schema = 'public'
)
select '01_required_tables' as check_name,
       case when (select count(*) from required r join existing e on e.table_name = r.name) = 6 then 'PASS' else 'FAIL' end as result,
       (select jsonb_agg(name order by name) from required r where not exists (select 1 from existing e where e.table_name = r.name)) as details
union all
select '02_no_user_id',
       case when not exists (
         select 1 from information_schema.columns
         where table_schema = 'public'
           and table_name in ('homework_progress','vocabulary_progress','vocabulary_topic_progress','grammar_progress','telegram_recipients','material_publications')
           and column_name = 'user_id'
       ) then 'PASS' else 'FAIL' end,
       null
union all
select '03_rls_enabled',
       case when (
         select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relname in ('homework_progress','vocabulary_progress','vocabulary_topic_progress','grammar_progress','telegram_recipients','material_publications') and c.relrowsecurity
       ) = 6 then 'PASS' else 'FAIL' end,
       null
union all
select '04_required_unique_constraints',
       case when (
         select count(*) from pg_constraint
         where conname in (
           'homework_progress_student_lesson_key',
           'vocabulary_progress_student_word_key',
           'vocabulary_topic_progress_student_topic_key',
           'grammar_progress_student_topic_key',
           'material_publications_unique_notification'
         )
       ) = 5 then 'PASS' else 'FAIL' end,
       null
union all
select '05_updated_at_triggers',
       case when (
         select count(*) from pg_trigger
         where not tgisinternal and tgname in (
           'set_homework_progress_updated_at','set_vocabulary_progress_updated_at','set_vocabulary_topic_progress_updated_at',
           'set_grammar_progress_updated_at','set_telegram_recipients_updated_at','set_material_publications_updated_at'
         )
       ) = 6 then 'PASS' else 'FAIL' end,
       null
union all
select '06_homework_lock_trigger',
       case when exists (select 1 from pg_trigger where not tgisinternal and tgname = 'prevent_homework_resubmission') then 'PASS' else 'FAIL' end,
       null
union all
select '07_no_anon_homework_delete_policy',
       case when not exists (
         select 1 from pg_policies where schemaname = 'public' and tablename = 'homework_progress' and cmd = 'DELETE' and 'anon' = any(roles)
       ) and not has_table_privilege('anon', 'public.homework_progress', 'DELETE') then 'PASS' else 'FAIL' end,
       null
union all
select '08_anon_progress_access',
       case when has_table_privilege('anon','public.homework_progress','SELECT,INSERT,UPDATE')
         and has_table_privilege('anon','public.vocabulary_progress','SELECT,INSERT,UPDATE,DELETE')
         and has_table_privilege('anon','public.vocabulary_topic_progress','SELECT,INSERT,UPDATE,DELETE')
         and has_table_privilege('anon','public.grammar_progress','SELECT,INSERT,UPDATE,DELETE')
       then 'PASS' else 'FAIL' end,
       null
union all
select '09_no_anon_server_table_access',
       case when not has_table_privilege('anon','public.telegram_recipients','SELECT,INSERT,UPDATE,DELETE')
         and not has_table_privilege('anon','public.material_publications','SELECT,INSERT,UPDATE,DELETE')
       then 'PASS' else 'FAIL' end,
       null
union all
select '10_no_student_progress_table',
       case when to_regclass('public.student_progress') is null then 'PASS' else 'FAIL' end,
       null
union all
select '11_initial_tables_empty',
       case when
         (select count(*) from public.homework_progress) = 0 and
         (select count(*) from public.vocabulary_progress) = 0 and
         (select count(*) from public.vocabulary_topic_progress) = 0 and
         (select count(*) from public.grammar_progress) = 0 and
         (select count(*) from public.telegram_recipients) = 0 and
         (select count(*) from public.material_publications) = 0
       then 'PASS' else 'CHECK: tables contain data' end,
       null
order by check_name;

-- Policy overview for manual review.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('homework_progress','vocabulary_progress','vocabulary_topic_progress','grammar_progress','telegram_recipients','material_publications')
order by tablename, cmd, policyname;

-- Grants overview for manual review.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon','authenticated')
  and table_name in ('homework_progress','vocabulary_progress','vocabulary_topic_progress','grammar_progress','telegram_recipients','material_publications')
order by grantee, table_name, privilege_type;
