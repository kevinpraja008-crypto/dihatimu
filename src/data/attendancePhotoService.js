import { supabase } from '../lib/supabase'

const PHOTO_BUCKET = 'attendance-photos'
const MAX_PHOTO_SIZE = 1024 * 1024

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

function normalizeText(value) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function createUuid() {
  if (
    typeof crypto !== 'undefined'
    && typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  if (
    typeof crypto === 'undefined'
    || typeof crypto.getRandomValues
    !== 'function'
  ) {
    throw new Error(
      'Browser tidak mendukung pembuatan ID foto.',
    )
  }

  const bytes = new Uint8Array(16)

  crypto.getRandomValues(bytes)

  bytes[6] =
    (bytes[6] & 0x0f) | 0x40

  bytes[8] =
    (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(
    bytes,
    (value) =>
      value.toString(16).padStart(2, '0'),
  )

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

function jpegDataUrlToBlob(photoDataUrl) {
  const normalizedPhoto =
    normalizeText(photoDataUrl)

  const prefix =
    'data:image/jpeg;base64,'

  if (
    !normalizedPhoto
      .toLowerCase()
      .startsWith(prefix)
  ) {
    throw new Error(
      'Format foto tidak valid. Gunakan foto JPEG.',
    )
  }

  const base64 =
    normalizedPhoto
      .slice(prefix.length)
      .replace(/\s/g, '')

  let binary

  try {
    binary = atob(base64)
  } catch {
    throw new Error(
      'Data foto tidak dapat diproses.',
    )
  }

  const bytes =
    new Uint8Array(binary.length)

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(index)
  }

  return new Blob(
    [bytes],
    {
      type: 'image/jpeg',
    },
  )
}

export async function
  uploadPendingAttendancePhoto({
    checkInToken,
    photoDataUrl,
  }) {
  const normalizedToken =
    normalizeText(checkInToken)
      .toLowerCase()

  if (!UUID_PATTERN.test(normalizedToken)) {
    throw new Error(
      'Sesi scan tidak valid. Silakan scan ulang QR peserta.',
    )
  }

  const photoBlob =
    jpegDataUrlToBlob(photoDataUrl)

  if (
    photoBlob.size <= 0
    || photoBlob.size > MAX_PHOTO_SIZE
  ) {
    throw new Error(
      'Ukuran foto melebihi batas 1 MB. Ambil atau pilih foto lain.',
    )
  }

  const photoId = createUuid()

  const photoPath =
    `check-ins/${normalizedToken}/${photoId}.jpg`

  const client = requireSupabase()

  const { data, error } =
    await client.storage
      .from(PHOTO_BUCKET)
      .upload(
        photoPath,
        photoBlob,
        {
          cacheControl: '3600',
          contentType: 'image/jpeg',
          upsert: false,
        },
      )

  if (error) {
    throw new Error(
      error.message
      || 'Foto gagal diunggah.',
    )
  }

  return data?.path || photoPath
}

export async function
  removePendingAttendancePhoto(
    photoPath,
  ) {
  const normalizedPath =
    normalizeText(photoPath)

  if (!normalizedPath) {
    return
  }

  const client = requireSupabase()

  const { error } =
    await client.storage
      .from(PHOTO_BUCKET)
      .remove([normalizedPath])

  if (error) {
    throw new Error(
      error.message
      || 'Foto sementara gagal dibersihkan.',
    )
  }
}

export function isStoredAttendancePhoto(
  value,
) {
  const normalizedPath =
    normalizeText(value)

  return (
    normalizedPath.startsWith(
      'check-ins/',
    )
    && normalizedPath.endsWith('.jpg')
    && !normalizedPath.includes('..')
  )
}

export async function
  createAttendancePhotoSignedUrlMap(
    photoPaths,
    expiresIn = 60 * 60,
  ) {
  const sourcePaths =
    Array.isArray(photoPaths)
      ? photoPaths
      : []

  const uniquePaths = [
    ...new Set(
      sourcePaths
        .map(normalizeText)
        .filter(isStoredAttendancePhoto),
    ),
  ]

  const signedUrlMap = new Map()

  if (uniquePaths.length === 0) {
    return signedUrlMap
  }

  const client = requireSupabase()

  const { data, error } =
    await client.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(
        uniquePaths,
        expiresIn,
      )

  if (error) {
    throw new Error(
      error.message
      || 'URL foto kehadiran gagal dibuat.',
    )
  }

  ; (data || []).forEach(
    (item, index) => {
      const photoPath =
        normalizeText(item?.path)
        || uniquePaths[index]

      const signedUrl =
        normalizeText(
          item?.signedUrl,
        )

      if (photoPath && signedUrl) {
        signedUrlMap.set(
          photoPath,
          signedUrl,
        )
      }
    },
  )

  return signedUrlMap
}