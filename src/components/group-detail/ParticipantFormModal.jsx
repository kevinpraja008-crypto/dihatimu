import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DEFAULT_ROLE,
  roleOptions,
} from '../../data/dummy'

function IconClose({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  )
}

function IconUser({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="7" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 21v-1.5C4 15.36 7.58 12 12 12s8 3.36 8 7.5V21"
      />
    </svg>
  )
}

function IconChevronDown({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 8l4 4 4-4"
      />
    </svg>
  )
}

function PersonWatermark() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-5 right-4 h-32 w-40 text-white/[0.1]"
      fill="none"
      viewBox="0 0 120 90"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="60" cy="24" r="14" strokeWidth="3" />
      <path
        d="M30 82v-5c0-17 13.5-30 30-30s30 13 30 30v5"
        strokeWidth="3"
      />
      <circle cx="24" cy="35" r="9" strokeWidth="2.5" />
      <path
        d="M3 80v-3c0-13 9-23 21-23h5"
        strokeWidth="2.5"
      />
      <circle cx="96" cy="35" r="9" strokeWidth="2.5" />
      <path
        d="M117 80v-3c0-13-9-23-21-23h-5"
        strokeWidth="2.5"
      />
    </svg>
  )
}

function FieldLabel({ children }) {
  return (
    <span className="mb-2 block text-sm font-semibold text-[#0B2E26]">
      {children}
      <span className="ml-1 text-red-500">*</span>
    </span>
  )
}

export default function ParticipantFormModal({
  group,
  participant = null,
  onSubmit,
  onClose,
}) {
  const isEdit = Boolean(participant)

  const [form, setForm] = useState({
    nama: participant?.nama || '',
    jabatan: participant?.jabatan || '',
    role: participant?.role || DEFAULT_ROLE,
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !saving) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, saving])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: '',
    }))

    setSubmitError('')
  }

  function validateForm() {
    const nextErrors = {}

    if (!form.nama.trim()) {
      nextErrors.nama = 'Nama peserta wajib diisi.'
    }

    if (!form.jabatan.trim()) {
      nextErrors.jabatan = 'Jabatan peserta wajib diisi.'
    }

    if (!form.role) {
      nextErrors.role = 'Role peserta wajib dipilih.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    setSubmitError('')

    try {
      const result = await onSubmit({
        nama: form.nama.trim(),
        jabatan: form.jabatan.trim(),
        role: form.role,
      })

      if (result?.ok === false) {
        setSubmitError(
          result.message ||
            'Peserta belum berhasil disimpan. Silakan coba lagi.',
        )
        return
      }

      onClose()
    } catch (error) {
      console.error('[DIHATIMU] Gagal menyimpan peserta:', error)
      setSubmitError(
        'Terjadi kesalahan saat menyimpan peserta. Silakan coba lagi.',
      )
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#0B2E26] outline-none transition focus:border-[#047857] focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:bg-slate-50'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={() => {
          if (!saving) onClose()
        }}
        className="absolute inset-0 bg-[#011a10]/55 backdrop-blur-[3px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[26px] border border-white/40 bg-white shadow-[0_24px_70px_rgba(1,26,16,0.3)]"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#047857] via-[#04613F] to-[#013220] px-7 py-6 text-white">
          <PersonWatermark />

          <div className="relative z-10 pr-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
              Kelola Peserta
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {isEdit ? 'Edit Peserta' : 'Tambah Peserta'}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
              {isEdit
                ? 'Perbarui identitas peserta tanpa mengubah QR dan data kehadiran.'
                : 'Tambahkan identitas peserta ke dalam group kunjungan ini.'}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-7 py-6">
            <div>
              <FieldLabel>Nama Peserta</FieldLabel>

              <input
                type="text"
                value={form.nama}
                disabled={saving}
                autoFocus
                onChange={(event) =>
                  updateField('nama', event.target.value)
                }
                placeholder="Masukkan nama lengkap peserta"
                className={`${inputClass} ${
                  errors.nama
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                    : ''
                }`}
              />

              {errors.nama && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.nama}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>Jabatan</FieldLabel>

              <input
                type="text"
                value={form.jabatan}
                disabled={saving}
                onChange={(event) =>
                  updateField('jabatan', event.target.value)
                }
                placeholder="Contoh: Ketua Komisi III"
                className={`${inputClass} ${
                  errors.jabatan
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                    : ''
                }`}
              />

              {errors.jabatan && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.jabatan}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>Role Peserta</FieldLabel>

              <div className="relative">
                <select
                  value={form.role}
                  disabled={saving}
                  onChange={(event) =>
                    updateField('role', event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-12 ${
                    errors.role
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                      : ''
                  }`}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <IconChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0B2E26]" />
              </div>

              {errors.role && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.role}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-900/10 bg-[#f4f8f6] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <IconUser className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#013220]">
                    {isEdit ? 'Preview Perubahan' : 'Group Tujuan'}
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-[#0B2E26]">
                    {group?.name || 'Group Kunjungan'}
                  </p>

                  {!isEdit && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      QR ID unik dan status Belum Hadir akan dibuat otomatis
                      setelah peserta disimpan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {submitError}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-7 py-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-12 min-w-40 rounded-xl bg-gradient-to-b from-[#04613F] to-[#013220] px-6 text-sm font-bold text-white shadow-[0_6px_18px_rgba(1,50,32,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(1,50,32,0.26)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Simpan Peserta'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}