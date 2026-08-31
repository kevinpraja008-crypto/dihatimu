import { supabase } from '../lib/supabase'
import {
  removePendingAttendancePhoto,
  uploadPendingAttendancePhoto,
} from './attendancePhotoService'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase belum dikonfigurasi.',
    )
  }

  return supabase
}

function normalizeText(
  value,
  fallback = '',
) {
  return typeof value === 'string'
    ? value
    : fallback
}

function normalizeTimestamp(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString()
}

function normalizeBeginResult(value) {
  if (
    !value
    || typeof value !== 'object'
    || value.ok !== true
  ) {
    return null
  }

  const alreadyHadir =
    value.alreadyHadir === true

  const checkInToken =
    normalizeText(value.checkInToken)
      .trim()

  if (
    !alreadyHadir
    && !UUID_PATTERN.test(checkInToken)
  ) {
    return null
  }

  const group = {
    name: normalizeText(
      value.group?.name,
      'Master Group',
    ),
    tanggalKegiatan:
      normalizeText(
        value.group?.tanggalKegiatan,
      ) || null,
  }

  const participant = {
    nama: normalizeText(
      value.participant?.nama,
      'Peserta',
    ),
    jabatan: normalizeText(
      value.participant?.jabatan,
      '-',
    ),
    role: normalizeText(
      value.participant?.role,
      'TAMU',
    ),
    kehadiran:
      value.participant?.kehadiran
        === 'HADIR'
        ? 'HADIR'
        : 'BELUM HADIR',
  }

  return {
    mode: 'public-scanner',
    source:
      value.source === 'arsip'
        ? 'arsip'
        : 'aktif',
    readOnly:
      value.readOnly === true
      || alreadyHadir,
    alreadyHadir,
    group,
    participant,
    checkInToken:
      alreadyHadir
        ? null
        : checkInToken,
    scannedAt:
      normalizeTimestamp(
        value.scannedAt,
      ),
  }
}

function normalizeRecordResult(value) {
  if (
    !value
    || typeof value !== 'object'
    || value.ok !== true
  ) {
    return null
  }

  return {
    ok: true,
    participantName: normalizeText(
      value.participantName,
      'Peserta',
    ),
    jamHadir:
      normalizeText(value.jamHadir)
      || null,
    tanggalHadir:
      normalizeText(value.tanggalHadir)
      || null,
    checkInAt:
      normalizeTimestamp(
        value.checkInAt,
      ),
    photoPath:
      normalizeText(value.photoPath)
      || null,
  }
}

function getErrorMessage(
  error,
  fallback,
) {
  const message =
    typeof error?.message === 'string'
      ? error.message.trim()
      : ''

  return message || fallback
}
async function cleanupPendingPhoto(
  photoPath,
) {
  try {
    await removePendingAttendancePhoto(
      photoPath,
    )
  } catch (error) {
    console.warn(
      '[DIHATIMU] Foto sementara gagal dibersihkan:',
      error,
    )
  }
}

export async function
  beginPublicParticipantCheckIn(qrId) {
  const normalizedQrId =
    normalizeText(qrId)
      .trim()
      .toUpperCase()

  if (!normalizedQrId) {
    throw new Error(
      'Format QR tidak valid.',
    )
  }

  const client = requireSupabase()

  const { data, error } = await client.rpc(
    'begin_public_participant_check_in',
    {
      p_qr_id: normalizedQrId,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        'QR belum dapat diproses.',
      ),
    )
  }

  const result =
    normalizeBeginResult(data)

  if (!result) {
    throw new Error(
      'Respons Scanner tidak valid.',
    )
  }

  return result
}

export async function
  recordPublicParticipantCheckIn({
    checkInToken,
    foto,
    deviceInfo = null,
  }) {
  const normalizedToken =
    normalizeText(checkInToken)
      .trim()
      .toLowerCase()

  if (!UUID_PATTERN.test(normalizedToken)) {
    throw new Error(
      'Sesi scan tidak valid. Silakan scan ulang QR peserta.',
    )
  }

  if (
    typeof foto !== 'string'
    || !foto.trim()
  ) {
    throw new Error(
      'Foto kehadiran wajib disertakan.',
    )
  }
  const photoPath =
    await uploadPendingAttendancePhoto({
      checkInToken: normalizedToken,
      photoDataUrl: foto,
    })
  const client = requireSupabase()

  const { data, error } = await client.rpc(
    'record_public_participant_check_in',
    {
      p_check_in_token:
        normalizedToken,
      p_foto: photoPath,
      p_device_info:
        normalizeText(deviceInfo)
          .slice(0, 500)
        || null,
    },
  )

  if (error) {
    await cleanupPendingPhoto(
      photoPath,
    )

    throw new Error(
      getErrorMessage(
        error,
        'Kehadiran gagal disimpan.',
      ),
    )
  }

  const result =
    normalizeRecordResult(data)

  if (!result) {
    throw new Error(
      'Respons penyimpanan kehadiran tidak valid.',
    )
  }

  return result
}

export function getScannerDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return null
  }

  return normalizeText(
    navigator.userAgent,
  ).slice(0, 500) || null
}