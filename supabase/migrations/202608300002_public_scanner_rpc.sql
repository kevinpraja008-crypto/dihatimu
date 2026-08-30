begin;

create unique index if not exists
participants_qr_id_normalized_unique
on public.participants (
  upper(btrim(qr_id))
);

create or replace function
public.begin_public_participant_check_in(
  p_qr_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_qr_id text :=
    upper(
      btrim(
        coalesce(p_qr_id, '')
      )
    );

  v_participant public.participants%rowtype;
  v_group public.master_groups%rowtype;

  v_check_in_token uuid;
  v_scanned_at timestamptz;
  v_already_hadir boolean;
begin
  if
    v_qr_id = ''
    or char_length(v_qr_id) > 128
    or v_qr_id
      !~ '^DHTM-[A-Z0-9-]+$'
  then
    raise exception using
      message = 'Format QR tidak valid.',
      errcode = 'P0001';
  end if;

  select participant.*
  into v_participant
  from public.participants as participant
  where
    upper(
      btrim(participant.qr_id)
    ) = v_qr_id
  for update;

  if not found then
    raise exception using
      message =
        'QR tidak terdaftar pada sistem DIHATIMU.',
      errcode = 'P0002';
  end if;

  select master_group.*
  into v_group
  from public.master_groups as master_group
  where
    master_group.id =
      v_participant.master_group_id;

  if not found then
    raise exception using
      message =
        'Master Group peserta tidak ditemukan.',
      errcode = 'P0002';
  end if;

  v_already_hadir =
    coalesce(
      v_participant.kehadiran,
      'BELUM HADIR'
    ) = 'HADIR';

  if v_already_hadir then
    return jsonb_build_object(
      'ok',
      true,
      'alreadyHadir',
      true,
      'readOnly',
      true,
      'source',
      case
        when v_group.status = 'archived'
          then 'arsip'
        else 'aktif'
      end,
      'group',
      jsonb_build_object(
        'name',
        v_group.name,
        'tanggalKegiatan',
        v_group.tanggal_kegiatan
      ),
      'participant',
      jsonb_build_object(
        'nama',
        v_participant.nama,
        'jabatan',
        v_participant.jabatan,
        'role',
        v_participant.role,
        'kehadiran',
        'HADIR'
      ),
      'checkInToken',
      null,
      'scannedAt',
      coalesce(
        v_participant.check_in_at,
        v_participant.scan_started_at
      )
    );
  end if;

  v_check_in_token =
    gen_random_uuid();

  v_scanned_at =
    clock_timestamp();

  update public.participants
  set
    check_in_token =
      v_check_in_token,
    scan_started_at =
      v_scanned_at
  where
    id = v_participant.id
    and master_group_id =
      v_participant.master_group_id
    and coalesce(
      kehadiran,
      'BELUM HADIR'
    ) <> 'HADIR';

  if not found then
    raise exception using
      message =
        'Sesi scan gagal dibuat. Silakan scan ulang.',
      errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'ok',
    true,
    'alreadyHadir',
    false,
    'readOnly',
    false,
    'source',
    case
      when v_group.status = 'archived'
        then 'arsip'
      else 'aktif'
    end,
    'group',
    jsonb_build_object(
      'name',
      v_group.name,
      'tanggalKegiatan',
      v_group.tanggal_kegiatan
    ),
    'participant',
    jsonb_build_object(
      'nama',
      v_participant.nama,
      'jabatan',
      v_participant.jabatan,
      'role',
      v_participant.role,
      'kehadiran',
      coalesce(
        v_participant.kehadiran,
        'BELUM HADIR'
      )
    ),
    'checkInToken',
    v_check_in_token,
    'scannedAt',
    v_scanned_at
  );
end;
$$;

revoke all
on function
public.begin_public_participant_check_in(
  text
)
from public;

grant execute
on function
public.begin_public_participant_check_in(
  text
)
to anon, authenticated;

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

  if octet_length(p_foto) > 1600000 then
    raise exception using
      message =
        'Ukuran foto terlalu besar. Ambil atau pilih foto lain.',
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
    v_check_in_at
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
public.begin_public_participant_check_in(
  text
)
is
  'Memvalidasi QR, mengambil snapshot peserta terbatas, dan membuat sesi check-in publik selama 15 menit.';

comment on function
public.record_public_participant_check_in(
  uuid,
  text,
  text
)
is
  'Menyimpan satu check-in publik secara atomik menggunakan token sesi tanpa mengekspos ID internal.';

commit;