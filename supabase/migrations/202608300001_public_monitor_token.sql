begin;

create table if not exists public.group_monitor_access (
  master_group_id uuid primary key
    references public.master_groups(id)
    on delete cascade,
  monitor_token uuid not null default gen_random_uuid(),
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint group_monitor_access_monitor_token_key
    unique (monitor_token)
);

alter table public.group_monitor_access
  enable row level security;

revoke all
on table public.group_monitor_access
from public, anon, authenticated;

insert into public.group_monitor_access (
  master_group_id
)
select
  mg.id
from public.master_groups mg
on conflict (master_group_id) do nothing;

create or replace function public.create_group_monitor_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.group_monitor_access (
    master_group_id
  )
  values (
    new.id
  )
  on conflict (master_group_id) do nothing;

  return new;
end;
$$;

revoke all
on function public.create_group_monitor_access()
from public, anon, authenticated;

drop trigger if exists create_group_monitor_access_after_insert
on public.master_groups;

create trigger create_group_monitor_access_after_insert
after insert on public.master_groups
for each row
execute function public.create_group_monitor_access();

create or replace function public.get_group_monitor_token(
  p_master_group_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_monitor_token uuid;
begin
  if auth.uid() is null
    or not public.is_admin()
  then
    raise exception 'Akses administrator diperlukan.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.master_groups mg
    where mg.id = p_master_group_id
  ) then
    raise exception 'Group tidak ditemukan.'
      using errcode = 'P0002';
  end if;

  insert into public.group_monitor_access (
    master_group_id
  )
  values (
    p_master_group_id
  )
  on conflict (master_group_id) do nothing;

  select
    gma.monitor_token
  into
    v_monitor_token
  from public.group_monitor_access gma
  where gma.master_group_id = p_master_group_id;

  return v_monitor_token;
end;
$$;

revoke all
on function public.get_group_monitor_token(uuid)
from public, anon, authenticated;

grant execute
on function public.get_group_monitor_token(uuid)
to authenticated;

create or replace function public.rotate_group_monitor_token(
  p_master_group_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous_token uuid;
  v_monitor_token uuid;
begin
  if auth.uid() is null
    or not public.is_admin()
  then
    raise exception 'Akses administrator diperlukan.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.master_groups mg
    where mg.id = p_master_group_id
  ) then
    raise exception 'Group tidak ditemukan.'
      using errcode = 'P0002';
  end if;

  select
    gma.monitor_token
  into
    v_previous_token
  from public.group_monitor_access gma
  where gma.master_group_id = p_master_group_id;

  if v_previous_token is not null then
    perform realtime.send(
      jsonb_build_object(
        'type',
        'monitor_revoked'
      ),
      'monitor_changed',
      'monitor:' || v_previous_token::text,
      true
    );
  end if;

  insert into public.group_monitor_access (
    master_group_id,
    monitor_token,
    is_active,
    updated_at
  )
  values (
    p_master_group_id,
    gen_random_uuid(),
    true,
    now()
  )
  on conflict (master_group_id) do update
  set
    monitor_token = excluded.monitor_token,
    is_active = true,
    updated_at = excluded.updated_at
  returning monitor_token
  into v_monitor_token;

  return v_monitor_token;
end;
$$;

revoke all
on function public.rotate_group_monitor_token(uuid)
from public, anon, authenticated;

grant execute
on function public.rotate_group_monitor_token(uuid)
to authenticated;

create or replace function public.get_public_group_monitor(
  p_monitor_token uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'name',
    mg.name,
    'participants',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'nama',
            p.nama,
            'jabatan',
            p.jabatan,
            'kehadiran',
            p.kehadiran
          )
          order by
            lower(p.nama),
            p.created_at
        )
        from public.participants p
        where p.master_group_id = mg.id
      ),
      '[]'::jsonb
    )
  )
  from public.group_monitor_access gma
  join public.master_groups mg
    on mg.id = gma.master_group_id
  where gma.monitor_token = p_monitor_token
    and gma.is_active = true
  limit 1;
$$;

revoke all
on function public.get_public_group_monitor(uuid)
from public, anon, authenticated;

grant execute
on function public.get_public_group_monitor(uuid)
to anon, authenticated;

create or replace function public.is_group_monitor_topic_valid(
  p_topic text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_monitor_access gma
    where gma.is_active = true
      and p_topic = (
        'monitor:' || gma.monitor_token::text
      )
  );
$$;

revoke all
on function public.is_group_monitor_topic_valid(text)
from public, anon, authenticated;

grant execute
on function public.is_group_monitor_topic_valid(text)
to anon, authenticated;

drop policy if exists "public monitor menerima sinyal valid"
on realtime.messages;

create policy "public monitor menerima sinyal valid"
on realtime.messages
for select
to anon, authenticated
using (
  extension = 'broadcast'
  and public.is_group_monitor_topic_valid(
    (select realtime.topic())
  )
);

create or replace function public.send_group_monitor_refresh(
  p_master_group_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_monitor_token uuid;
begin
  select
    gma.monitor_token
  into
    v_monitor_token
  from public.group_monitor_access gma
  where gma.master_group_id = p_master_group_id
    and gma.is_active = true;

  if v_monitor_token is not null then
    perform realtime.send(
      jsonb_build_object(
        'type',
        'monitor_changed'
      ),
      'monitor_changed',
      'monitor:' || v_monitor_token::text,
      true
    );
  end if;
end;
$$;

revoke all
on function public.send_group_monitor_refresh(uuid)
from public, anon, authenticated;

create or replace function public.notify_group_monitor_participant_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and new.master_group_id is not distinct from old.master_group_id
    and new.nama is not distinct from old.nama
    and new.jabatan is not distinct from old.jabatan
    and new.kehadiran is not distinct from old.kehadiran
  then
    return new;
  end if;

  if tg_op = 'DELETE' then
    perform public.send_group_monitor_refresh(
      old.master_group_id
    );

    return old;
  end if;

  if tg_op = 'UPDATE'
    and new.master_group_id is distinct from old.master_group_id
  then
    perform public.send_group_monitor_refresh(
      old.master_group_id
    );
  end if;

  perform public.send_group_monitor_refresh(
    new.master_group_id
  );

  return new;
end;
$$;

revoke all
on function public.notify_group_monitor_participant_change()
from public, anon, authenticated;

drop trigger if exists notify_group_monitor_participant_change
on public.participants;

create trigger notify_group_monitor_participant_change
after insert or update or delete
on public.participants
for each row
execute function public.notify_group_monitor_participant_change();

create or replace function public.notify_group_monitor_master_group_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.send_group_monitor_refresh(
      old.id
    );

    return old;
  end if;

  if new.name is distinct from old.name then
    perform public.send_group_monitor_refresh(
      new.id
    );
  end if;

  return new;
end;
$$;

revoke all
on function public.notify_group_monitor_master_group_change()
from public, anon, authenticated;

drop trigger if exists notify_group_monitor_name_change
on public.master_groups;

create trigger notify_group_monitor_name_change
after update of name
on public.master_groups
for each row
execute function public.notify_group_monitor_master_group_change();

drop trigger if exists notify_group_monitor_before_delete
on public.master_groups;

create trigger notify_group_monitor_before_delete
before delete
on public.master_groups
for each row
execute function public.notify_group_monitor_master_group_change();

alter table public.master_groups
  enable row level security;

alter table public.participants
  enable row level security;

alter table public.attendance_logs
  enable row level security;

grant select, insert, update, delete
on table public.master_groups
to authenticated;

grant select, insert, update, delete
on table public.participants
to authenticated;

grant select, insert, update, delete
on table public.attendance_logs
to authenticated;

drop policy if exists "admin mengelola master_groups"
on public.master_groups;

create policy "admin mengelola master_groups"
on public.master_groups
for all
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);

drop policy if exists "admin mengelola participants"
on public.participants;

create policy "admin mengelola participants"
on public.participants
for all
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);

drop policy if exists "admin mengelola attendance_logs"
on public.attendance_logs;

create policy "admin mengelola attendance_logs"
on public.attendance_logs
for all
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);

commit;