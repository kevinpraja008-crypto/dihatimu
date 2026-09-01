begin;

do $$
declare
  v_log_count bigint;
begin
  select count(*)
  into v_log_count
  from public.attendance_logs;

  if v_log_count > 0 then
    raise exception using
      errcode = 'P0001',
      message = format(
        'Penghapusan dibatalkan: attendance_logs masih berisi %s data.',
        v_log_count
      );
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname =
      'supabase_realtime'
      and schemaname = 'public'
      and tablename =
        'attendance_logs'
  )
  then
    execute
      'alter publication supabase_realtime drop table public.attendance_logs';
  end if;
end;
$$;

drop function if exists
public.record_participant_check_in(
  uuid,
  uuid,
  uuid,
  text,
  text
);

drop table public.attendance_logs;

commit;