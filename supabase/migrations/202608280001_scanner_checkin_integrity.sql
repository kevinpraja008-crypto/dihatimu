alter table public.participants
add column if not exists check_in_token uuid,
add column if not exists scan_started_at timestamptz;

create unique index if not exists
participants_check_in_token_unique
on public.participants (check_in_token)
where check_in_token is not null;

alter table public.attendance_logs
add column if not exists check_in_at timestamptz;

create or replace function public.begin_participant_check_in(
  p_group_id uuid,
  p_participant_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_check_in_token uuid := gen_random_uuid();
  v_scanned_at timestamptz := clock_timestamp();
  v_updated_participant_id uuid;
begin
  update public.participants
  set
    check_in_token = v_check_in_token,
    scan_started_at = v_scanned_at
  where id = p_participant_id
    and master_group_id = p_group_id
    and coalesce(
      kehadiran,
      'BELUM HADIR'
    ) <> 'HADIR'
  returning id into v_updated_participant_id;

  if not found then
    if exists (
      select 1
      from public.participants
      where id = p_participant_id
        and master_group_id = p_group_id
        and kehadiran = 'HADIR'
    ) then
      raise exception using
        message = 'Peserta sudah tercatat hadir.',
        errcode = 'P0001';
    end if;

    raise exception using
      message = 'Peserta atau Master Group tidak ditemukan.',
      errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'ok', true,
    'groupId', p_group_id,
    'participantId', p_participant_id,
    'checkInToken', v_check_in_token,
    'scannedAt', v_scanned_at
  );
end;
$$;

revoke all
on function public.begin_participant_check_in(
  uuid,
  uuid
)
from public;

grant execute
on function public.begin_participant_check_in(
  uuid,
  uuid
)
to anon, authenticated;

drop function if exists
public.record_participant_check_in(
  uuid,
  uuid,
  text,
  text
);

create or replace function public.record_participant_check_in(
  p_group_id uuid,
  p_participant_id uuid,
  p_check_in_token uuid,
  p_foto text,
  p_device_info text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_participant public.participants%rowtype;
  v_check_in_at timestamptz;
  v_tanggal_hadir date;
  v_jam_hadir text;
  v_log_id uuid;
begin
  if p_foto is null or btrim(p_foto) = '' then
    raise exception using
      message = 'Foto kehadiran wajib disertakan.',
      errcode = 'P0001';
  end if;

  select *
  into v_participant
  from public.participants
  where id = p_participant_id
    and master_group_id = p_group_id
  for update;

  if not found then
    raise exception using
      message = 'Peserta atau Master Group tidak ditemukan.',
      errcode = 'P0002';
  end if;

  if coalesce(
    v_participant.kehadiran,
    'BELUM HADIR'
  ) = 'HADIR' then
    raise exception using
      message = 'Peserta sudah tercatat hadir.',
      errcode = 'P0001';
  end if;

  if
    v_participant.check_in_token
      is distinct from p_check_in_token
    or v_participant.scan_started_at is null
  then
    raise exception using
      message = 'Sesi scan tidak valid. Silakan scan ulang QR peserta.',
      errcode = 'P0001';
  end if;

  if
    v_participant.scan_started_at
      < clock_timestamp() - interval '15 minutes'
  then
    raise exception using
      message = 'Sesi scan sudah kedaluwarsa. Silakan scan ulang QR peserta.',
      errcode = 'P0001';
  end if;

  v_check_in_at =
    v_participant.scan_started_at;

  v_tanggal_hadir =
    (
      v_check_in_at at time zone 'Asia/Jakarta'
    )::date;

  v_jam_hadir =
    to_char(
      v_check_in_at at time zone 'Asia/Jakarta',
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
    p_group_id,
    p_participant_id,
    v_participant.qr_id,
    v_participant.nama,
    v_participant.jabatan,
    p_foto,
    v_jam_hadir,
    v_tanggal_hadir,
    v_check_in_at,
    p_device_info
  )
  returning id into v_log_id;

  update public.participants
  set
    kehadiran = 'HADIR',
    foto = p_foto,
    jam_hadir = v_jam_hadir,
    tanggal_hadir = v_tanggal_hadir,
    check_in_at = v_check_in_at,
    check_in_token = null,
    scan_started_at = null
  where id = p_participant_id
    and master_group_id = p_group_id
    and check_in_token = p_check_in_token;

  if not found then
    raise exception using
      message = 'Status peserta gagal diperbarui.',
      errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'ok', true,
    'attendanceLogId', v_log_id,
    'groupId', p_group_id,
    'participantId', p_participant_id,
    'jamHadir', v_jam_hadir,
    'tanggalHadir',
      to_char(v_tanggal_hadir, 'YYYY-MM-DD'),
    'checkInAt', v_check_in_at
  );
end;
$$;

revoke all
on function public.record_participant_check_in(
  uuid,
  uuid,
  uuid,
  text,
  text
)
from public;

grant execute
on function public.record_participant_check_in(
  uuid,
  uuid,
  uuid,
  text,
  text
)
to anon, authenticated;