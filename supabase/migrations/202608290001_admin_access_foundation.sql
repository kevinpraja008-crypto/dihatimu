begin;

create table if not exists public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,
  display_name text not null default 'Administrator',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all
on table public.admin_users
from anon;

revoke all
on table public.admin_users
from authenticated;

grant select
on table public.admin_users
to authenticated;

drop policy if exists
  "admin membaca akses sendiri"
on public.admin_users;

create policy
  "admin membaca akses sendiri"
on public.admin_users
for select
to authenticated
using (
  user_id = (select auth.uid())
  and is_active = true
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and is_active = true
  );
$$;

revoke all
on function public.is_admin()
from public;

revoke all
on function public.is_admin()
from anon;

grant execute
on function public.is_admin()
to authenticated;

insert into public.admin_users (
  user_id,
  display_name,
  is_active
)
select
  id,
  'Admin Sekretariat',
  true
from auth.users
where lower(email) = lower('admin@dihatimu.id')
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  is_active = true;

commit;