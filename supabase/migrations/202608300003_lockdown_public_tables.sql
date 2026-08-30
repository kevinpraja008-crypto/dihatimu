begin;

-- Hapus policy akses langsung pengunjung publik.
-- Policy admin authenticated tetap dipertahankan.

drop policy if exists
"public insert attendance_logs"
on public.attendance_logs;

drop policy if exists
"public read attendance_logs"
on public.attendance_logs;

drop policy if exists
"public delete master_groups"
on public.master_groups;

drop policy if exists
"public insert master_groups"
on public.master_groups;

drop policy if exists
"public read master_groups"
on public.master_groups;

drop policy if exists
"public update master_groups"
on public.master_groups;

drop policy if exists
"public delete participants"
on public.participants;

drop policy if exists
"public insert participants"
on public.participants;

drop policy if exists
"public read participants"
on public.participants;

drop policy if exists
"public update participants"
on public.participants;

-- Blokir seluruh akses tabel secara langsung untuk anon.
-- Scanner dan monitor publik tetap memakai RPC terbatas.

revoke all privileges
on table
  public.master_groups,
  public.participants,
  public.attendance_logs
from anon;

revoke all privileges
on table
  public.master_groups,
  public.participants,
  public.attendance_logs
from public;

-- Nonaktifkan RPC scanner lama yang menerima ID internal.

revoke all privileges
on function public.begin_participant_check_in(
  uuid,
  uuid
)
from public, anon, authenticated;

revoke all privileges
on function public.record_participant_check_in(
  uuid,
  uuid,
  uuid,
  text,
  text
)
from public, anon, authenticated;

commit;