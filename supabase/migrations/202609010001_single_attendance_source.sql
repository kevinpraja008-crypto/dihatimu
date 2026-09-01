begin;

alter table public.participants
add column if not exists
  check_in_device_info text;

alter table public.participants
drop constraint if exists
  participants_check_in_device_info_length;

alter table public.participants
add constraint
  participants_check_in_device_info_length
check (
  check_in_device_info is null
  or char_length(
    check_in_device_info
  ) <= 500
);

comment on column
public.participants.check_in_device_info
is
  'Informasi perangkat yang digunakan saat peserta melakukan check-in.';
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
begin
  if p_check_in_token is null then
    raise exception using
      errcode = '22023',
      message =
        'Sesi scan tidak valid. Silakan scan ulang QR peserta.';
  end if;

  if p_foto is null
    or btrim(p_foto) = ''
  then
    raise exception using
      errcode = '22023',
      message =
        'Foto kehadiran wajib disertakan.';
  end if;

  if p_foto !~*
    '^check-ins/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.jpg$'
    or split_part(
      p_foto,
      '/',
      2
    ) <> p_check_in_token::text
  then
    raise exception using
      errcode = '22023',
      message =
        'Lokasi foto kehadiran tidak valid.';
  end if;
    select *
  into v_participant
  from public.participants
  where check_in_token =
    p_check_in_token
  for update;

  if not found then
    raise exception using
      errcode = '22023',
      message =
        'Sesi scan tidak ditemukan atau sudah digunakan.';
  end if;

  if coalesce(
    v_participant.kehadiran,
    'BELUM HADIR'
  ) = 'HADIR'
  then
    raise exception using
      errcode = '22023',
      message =
        'Peserta sudah tercatat hadir.';
  end if;

  if v_participant.scan_started_at is null
    or v_participant.scan_started_at
      < clock_timestamp()
        - interval '15 minutes'
  then
    raise exception using
      errcode = '22023',
      message =
        'Sesi scan sudah kedaluwarsa. Silakan scan ulang QR peserta.';
  end if;

  if not exists (
    select 1
    from storage.objects
    where bucket_id =
      'attendance-photos'
      and name = p_foto
  )
  then
    raise exception using
      errcode = '22023',
      message =
        'File foto kehadiran tidak ditemukan.';
  end if;
    v_check_in_at :=
    v_participant.scan_started_at;

  v_tanggal_hadir := (
    v_check_in_at
      at time zone 'Asia/Jakarta'
  )::date;

  v_jam_hadir :=
    to_char(
      v_check_in_at
        at time zone 'Asia/Jakarta',
      'HH24.MI'
    ) || ' WIB';

  update public.participants
  set
    kehadiran = 'HADIR',
    foto = p_foto,
    jam_hadir = v_jam_hadir,
    tanggal_hadir = v_tanggal_hadir,
    check_in_at = v_check_in_at,
    check_in_device_info =
      left(
        nullif(
          btrim(p_device_info),
          ''
        ),
        500
      ),
    check_in_token = null,
    scan_started_at = null
  where id = v_participant.id
    and check_in_token =
      p_check_in_token
    and coalesce(
      kehadiran,
      'BELUM HADIR'
    ) <> 'HADIR';

  if not found then
    raise exception using
      errcode = '40001',
      message =
        'Data kehadiran berubah saat diproses. Silakan scan ulang.';
  end if;

  return jsonb_build_object(
    'ok',
    true,
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
to anon;

grant execute
on function
public.record_public_participant_check_in(
  uuid,
  text,
  text
)
to authenticated;

revoke all
on function
public.record_participant_check_in(
  uuid,
  uuid,
  uuid,
  text,
  text
)
from public;

revoke all
on function
public.record_participant_check_in(
  uuid,
  uuid,
  uuid,
  text,
  text
)
from anon;

revoke all
on function
public.record_participant_check_in(
  uuid,
  uuid,
  uuid,
  text,
  text
)
from authenticated;

comment on function
public.record_public_participant_check_in(
  uuid,
  text,
  text
)
is
  'Mencatat kehadiran langsung pada participants sebagai satu sumber data tanpa membuat attendance_logs baru.';

commit;