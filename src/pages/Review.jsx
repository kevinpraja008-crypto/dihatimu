import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AttendanceCameraModal from '../components/AttendanceCameraModal'
import { useMasterData } from '../context/MasterDataContext'
import { formatTanggalKegiatan } from '../data/dummy'
import { compressImageFile } from '../utils/imageCompress'

function FieldRow({ label, value, delay = 0, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex justify-between gap-4 px-6 py-4"
    >
      <dt className="text-sm text-muted">{label}</dt>
      <dd
        className={`text-right text-sm font-medium ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}
      >
        {value}
      </dd>
    </motion.div>
  )
}
const JAKARTA_TIME_ZONE = 'Asia/Jakarta'

const arrivalDateFormatter =
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: JAKARTA_TIME_ZONE,
  })

const arrivalTimeFormatter =
  new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: JAKARTA_TIME_ZONE,
  })

function parseArrivalDate(value) {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? null
    : date
}

function formatArrivalDate(value) {
  const date = parseArrivalDate(value)

  return date
    ? arrivalDateFormatter.format(date)
    : '-'
}

function formatArrivalTime(value) {
  const date = parseArrivalDate(value)

  return date
    ? `${arrivalTimeFormatter.format(date)} WIB`
    : '-'
}

function getJakartaDateKey(value) {
  const date = parseArrivalDate(value)

  if (!date) return null

  const parts = new Intl.DateTimeFormat(
    'en-CA',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: JAKARTA_TIME_ZONE,
    },
  ).formatToParts(date)

  const values = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ]),
  )

  return `${values.year}-${values.month}-${values.day}`
}

export default function Review() {
  const navigate = useNavigate()
  const location = useLocation()
  const { masterGroups, recordCheckIn } = useMasterData()
  const galleryInputRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [showCamera, setShowCamera] =
    useState(false)

  const scan = location.state
  const readOnly = scan?.readOnly === true

  const returnTo = scan?.returnTo || '/scanner'
  const returnLabel =
    scan?.returnLabel ||
    (readOnly ? 'Scan QR Lain' : 'Batal')

  const realData = useMemo(() => {
    if (scan?.mode !== 'real') return null
    const group = masterGroups.find((g) => g.id === scan.groupId)
    const participant = group?.participants.find((p) => p.id === scan.participantId)
    if (!group || !participant) return null
    return { group, participant }
  }, [scan, masterGroups])

  useEffect(() => {
    if (!scan?.mode || scan.mode !== 'real') {
      navigate('/scanner', { replace: true })
    }
  }, [scan, navigate])

  useEffect(() => {
    if (scan?.mode === 'real' && !realData) {
      navigate('/scanner', {
        replace: true,
        state: { error: 'QR tidak terdaftar pada sistem DIHATIMU.' },
      })
    }
  }, [scan, realData, navigate])

  useEffect(() => {
    if (realData?.participant.foto) {
      setPhotoPreview(realData.participant.foto)
    }
  }, [realData?.participant.foto])

  if (!scan?.mode || scan.mode !== 'real' || !realData) return null

  const { group, participant } = realData
  const alreadyCheckedIn = participant.kehadiran === 'HADIR'
  const arrivalAt =
    scan?.scannedAt ||
    (participant.checkInAt
      ? new Date(
        participant.checkInAt,
      ).toISOString()
      : null)

  const scheduleDateKey = String(
    group.tanggalKegiatan || '',
  ).slice(0, 10)

  const arrivalDateKey =
    getJakartaDateKey(arrivalAt)

  const arrivalScheduleStatus =
    !scheduleDateKey || !arrivalDateKey
      ? 'BELUM DAPAT DIVERIFIKASI'
      : scheduleDateKey === arrivalDateKey
        ? 'SESUAI JADWAL'
        : 'KUNJUNGAN SUSULAN'

  const fields = [
    {
      label: 'Nama Peserta',
      value: participant.nama,
    },
    {
      label: 'Jabatan',
      value: participant.jabatan,
    },
    {
      label: 'Role',
      value: participant.role,
    },
    {
      label: 'Nama Group',
      value: group.name,
    },
    {
      label: 'Jadwal Kegiatan',
      value: formatTanggalKegiatan(
        group.tanggalKegiatan,
      ),
    },
    {
      label: 'Hari/Tanggal Kedatangan',
      value: formatArrivalDate(arrivalAt),
    },
    {
      label: 'Jam Kedatangan',
      value: formatArrivalTime(arrivalAt),
    },
    {
      label: 'Keterangan Kedatangan',
      value: arrivalScheduleStatus,
      highlight:
        arrivalScheduleStatus ===
        'SESUAI JADWAL',
    },
    {
      label: 'Status Kehadiran',
      value: participant.kehadiran,
      highlight:
        participant.kehadiran === 'HADIR',
    },
  ]

  async function handlePhotoFile(file) {
    if (!file?.type.startsWith('image/')) {
      setPhotoError('File harus berupa gambar.')
      return
    }
    setPhotoError('')
    try {
      const dataUrl = await compressImageFile(file)
      setPhotoPreview(dataUrl)
    } catch {
      setPhotoError('Gagal memuat foto. Coba lagi.')
    }
  }

  async function handleConfirm() {
    if (
      readOnly ||
      alreadyCheckedIn ||
      submitting
    ) {
      return
    }

    if (!photoPreview) {
      setPhotoError(
        'Ambil atau upload foto kehadiran terlebih dahulu.',
      )
      return
    }

    setPhotoError('')
    setSaveError('')
    setSubmitting(true)

    try {
      const result = await recordCheckIn(
        group.id,
        participant.id,
        {
          foto: photoPreview,
          checkInToken: scan?.checkInToken,
        },
      )

      if (!result?.ok) {
        setSaveError(
          result?.message ||
          'Kehadiran gagal disimpan. Silakan coba lagi.',
        )
        return
      }

      navigate('/scanner', {
        replace: true,
        state: {
          success: `${participant.nama} berhasil dicatat hadir.`,
        },
      })
    } catch (error) {
      console.error(
        '[DIHATIMU] Proses simpan kehadiran gagal:',
        error,
      )

      setSaveError(
        'Kehadiran gagal disimpan. Periksa koneksi internet, lalu coba lagi.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const displayPhoto = photoPreview || participant.foto

  return (
    <div className="min-h-screen bg-soft-gray">
      <header className="bg-dihatimu-dark px-4 py-4 text-white">
        <button
          type="button"
          onClick={() => navigate(returnTo)}
          className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span>
          {scan?.returnLabel || 'Scan ulang'}
        </button>
        <h1 className="mt-2 text-xl font-bold">Review Data Kehadiran</h1>
        <p className="text-sm text-white/70">Verifikasi peserta sebelum menyimpan</p>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {readOnly && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
            Peserta sudah tercatat hadir — mode baca saja
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-white shadow-md"
        >
          <div className="bg-dihatimu px-6 py-5 text-white">
            <p className="text-sm text-white/70">Peserta teridentifikasi</p>
            <p className="mt-1 text-2xl font-bold">{participant.nama}</p>
          </div>

          {!readOnly && (
            <div className="border-b border-soft-gray-dark px-6 py-5">
              <p className="mb-3 text-sm font-semibold text-gray-800">Foto Kehadiran</p>
              <div className="mb-4 flex justify-center">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={participant.nama}
                    className="h-40 w-40 rounded-2xl border-2 border-[#e8eaed] object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-[#e8eaed] bg-soft-gray text-sm text-muted">
                    Belum ada foto
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoError('')
                    setSaveError('')
                    setShowCamera(true)
                  }}
                  className="flex-1 rounded-xl bg-dihatimu py-3 text-sm font-semibold text-white"
                >
                  Ambil Foto
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-1 rounded-xl border border-soft-gray-dark bg-white py-3 text-sm font-semibold text-gray-700"
                >
                  Upload Galeri
                </button>
              </div>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoFile(file)
                  e.target.value = ''
                }}
              />
              {photoError && (
                <p className="mt-2 text-center text-xs text-red-600">{photoError}</p>
              )}
            </div>
          )}

          {readOnly && displayPhoto && (
            <div className="border-b border-soft-gray-dark px-6 py-5 text-center">
              <p className="mb-3 text-sm font-semibold text-gray-800">Foto Kehadiran</p>
              <img
                src={displayPhoto}
                alt={participant.nama}
                className="mx-auto h-40 w-40 rounded-2xl border-2 border-[#e8eaed] object-cover shadow-sm"
              />
            </div>
          )}

          <dl className="divide-y divide-soft-gray-dark">
            {fields.map((field, i) => (
              <FieldRow
                key={field.label}
                label={field.label}
                value={field.value}
                delay={i * 0.04}
                highlight={field.highlight}
              />
            ))}
          </dl>
        </motion.div>

        {saveError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
            {saveError}
          </p>
        )}

<div className="mt-6 flex flex-col gap-3">
          {!readOnly && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full rounded-2xl bg-dihatimu py-4 font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? 'Menyimpan...'
                : 'Simpan Kehadiran'}
            </motion.button>
          )}

          <button
            type="button"
            onClick={() => navigate(returnTo)}
            className="w-full rounded-2xl border border-soft-gray-dark bg-white py-4 font-medium text-gray-700 transition-colors hover:bg-slate-50"
          >
            {returnLabel}
          </button>
        </div>
      </main>

      {showCamera && (
        <AttendanceCameraModal
          participantName={participant.nama}
          onCapture={(photoDataUrl) => {
            setPhotoPreview(photoDataUrl)
            setPhotoError('')
            setSaveError('')
          }}
          onClose={() =>
            setShowCamera(false)
          }
        />
      )}
    </div>
  )
}