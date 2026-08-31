begin;

-- Pastikan bucket foto kehadiran selalu privat,
-- maksimal 1 MB, dan hanya menerima JPEG.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'attendance-photos',
  'attendance-photos',
  false,
  1048576,
  array['image/jpeg']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Memeriksa apakah path foto berasal dari sesi scan
-- yang valid dan belum kedaluwarsa.
--
-- Format path:
-- check-ins/{check-in-token}/{photo-id}.jpg

create or replace function
public.can_manage_pending_attendance_photo(
  p_object_name text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_object_name ~
      '^check-ins/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.jpg$'
    and exists (
      select 1
      from public.participants
      where
        check_in_token is not null
        and check_in_token::text =
          split_part(
            p_object_name,
            '/',
            2
          )
        and scan_started_at is not null
        and scan_started_at >=
          statement_timestamp()
            - interval '15 minutes'
        and coalesce(
          kehadiran,
          'BELUM HADIR'
        ) <> 'HADIR'
    );
$$;

revoke all
on function
public.can_manage_pending_attendance_photo(
  text
)
from public;

revoke all
on function
public.can_manage_pending_attendance_photo(
  text
)
from anon, authenticated;

grant execute
on function
public.can_manage_pending_attendance_photo(
  text
)
to anon, authenticated;

-- Scanner hanya boleh mengunggah JPEG ke folder
-- yang tokennya cocok dengan sesi scan aktif.

drop policy if exists
  "scanner mengunggah foto kehadiran"
on storage.objects;

create policy
  "scanner mengunggah foto kehadiran"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'attendance-photos'
  and public.can_manage_pending_attendance_photo(
    name
  )
);

-- Scanner boleh membersihkan upload yang gagal
-- selama sesi scan tersebut masih valid.

drop policy if exists
  "scanner menghapus foto tertunda"
on storage.objects;

create policy
  "scanner menghapus foto tertunda"
on storage.objects
for delete
to anon, authenticated
using (
  bucket_id = 'attendance-photos'
  and public.can_manage_pending_attendance_photo(
    name
  )
);

-- Admin dapat membaca, memigrasikan,
-- dan mengelola foto dalam bucket privat.

drop policy if exists
  "admin mengelola foto kehadiran"
on storage.objects;

create policy
  "admin mengelola foto kehadiran"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'attendance-photos'
  and public.is_admin()
)
with check (
  bucket_id = 'attendance-photos'
  and public.is_admin()
);

-- Ganti implementasi RPC penyimpanan.
-- Parameter p_foto sekarang berisi path Storage,
-- bukan lagi data Base64.

create or replace function
public.record_public_participant_check_in(
  p_check_in_token uuid,
  p_foto text,
  p_device_info text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_participant public.participants%rowtype;
  v_check_in_at timestamptz;
  v_tanggal_hadir date;
  v_jam_hadir text;
  v_log_id uuid;
begin
  if p_check_in_token is null then
    raise exception using
      message =
        'Sesi scan tidak ditemukan. Silakan scan ulang QR peserta.',
      errcode = 'P0001';
  end if;

  if
    p_foto is null
    or btrim(p_foto) = ''
  then
    raise exception using
      message =
        'Foto kehadiran wajib disertakan.',
      errcode = 'P0001';
  end if;

  if
    p_foto !~
      '^check-ins/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.jpg$'
    or split_part(
      p_foto,
      '/',
      2
    ) <> p_check_in_token::text
  then
    raise exception using
      message =
        'Path foto kehadiran tidak valid.',
      errcode = 'P0001';
  end if;

  select participant.*
  into v_participant
  from public.participants as participant
  where
    participant.check_in_token =
      p_check_in_token
  for update;

  if not found then
    raise exception using
      message =
        'Sesi scan tidak valid atau sudah digunakan. Silakan scan ulang QR peserta.',
      errcode = 'P0001';
  end if;

  if
    coalesce(
      v_participant.kehadiran,
      'BELUM HADIR'
    ) = 'HADIR'
  then
    raise exception using
      message =
        'Peserta sudah tercatat hadir.',
      errcode = 'P0001';
  end if;

  if
    v_participant.scan_started_at is null
    or v_participant.scan_started_at
      < clock_timestamp()
        - interval '15 minutes'
  then
    raise exception using
      message =
        'Sesi scan sudah kedaluwarsa. Silakan scan ulang QR peserta.',
      errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from storage.objects
    where
      bucket_id = 'attendance-photos'
      and name = p_foto
  ) then
    raise exception using
      message =
        'Upload foto tidak ditemukan. Silakan ambil atau upload ulang foto.',
      errcode = 'P0001';
  end if;

  v_check_in_at =
    v_participant.scan_started_at;

  v_tanggal_hadir =
    (
      v_check_in_at
        at time zone 'Asia/Jakarta'
    )::date;

  v_jam_hadir =
    to_char(
      v_check_in_at
        at time zone 'Asia/Jakarta',
      'HH24.MI'
    ) || ' WIB';

  insert into public.attendance_logs (
    master_group_id,
    participant_id,
    qr_id,
    nama,
    jabatan,
    foto,
    jam_hadir,
    tanggal_hadir,
    check_in_at,
    device_info
  )
  values (
    v_participant.master_group_id,
    v_participant.id,
    v_participant.qr_id,
    v_participant.nama,
    v_participant.jabatan,
    p_foto,
    v_jam_hadir,
    v_tanggal_hadir,
    v_check_in_at,
    left(
      nullif(
        btrim(p_device_info),
        ''
      ),
      500
    )
  )
  returning id
  into v_log_id;

  update public.participants
  set
    kehadiran = 'HADIR',
    foto = p_foto,
    jam_hadir = v_jam_hadir,
    tanggal_hadir = v_tanggal_hadir,
    check_in_at = v_check_in_at,
    check_in_token = null,
    scan_started_at = null
  where
    id = v_participant.id
    and check_in_token =
      p_check_in_token
    and coalesce(
      kehadiran,
      'BELUM HADIR'
    ) <> 'HADIR';

  if not found then
    raise exception using
      message =
        'Status peserta gagal diperbarui.',
      errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'ok',
    true,
    'attendanceLogId',
    v_log_id,
    'participantName',
    v_participant.nama,
    'jamHadir',
    v_jam_hadir,
    'tanggalHadir',
    to_char(
      v_tanggal_hadir,
      'YYYY-MM-DD'
    ),
    'checkInAt',
    v_check_in_at,
    'photoPath',
    p_foto
  );
end;
$$;

revoke all
on function
public.record_public_participant_check_in(
  uuid,
  text,
  text
)
from public;

grant execute
on function
public.record_public_participant_check_in(
  uuid,
  text,
  text
)
to anon, authenticated;

comment on function
public.can_manage_pending_attendance_photo(
  text
)
is
  'Memvalidasi path upload foto terhadap token sesi scanner publik yang aktif.';

comment on function
public.record_public_participant_check_in(
  uuid,
  text,
  text
)
is
  'Menyimpan check-in publik menggunakan path foto dari bucket attendance-photos privat.';

commit;