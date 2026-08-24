import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  buildGroupName,
  createMasterGroup,
  formatTanggalKegiatan,
  generateGroupId,
  getNextGroupSequence,
  instansiOptions,
  levelWilayahOptions,
  todayIsoDate,
} from '../data/dummy'
import { getUnitLabel, getUnitOptions } from '../data/unitKunjungan'

const INITIAL_FORM = {
  instansi: '',
  level: '',
  wilayah: '',
  unitKunjungan: '',
  tanggalKegiatan: todayIsoDate(),
}

function IconClose({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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

function IconBuilding({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M5 21V8l7-4 7 4v13M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"
      />
    </svg>
  )
}

function IconCalendar({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
      />
    </svg>
  )
}

function IconChevronDown({ className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M6 8l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconGroup({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 96 72"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="48" cy="16" r="10" />
      <circle cx="20" cy="24" r="7" />
      <circle cx="76" cy="24" r="7" />

      <path d="M24 63v-4c0-12.7 10.7-23 24-23s24 10.3 24 23v4" />
      <path d="M24 63h48" />

      <path d="M23 43h-3C10.6 43 3 50.6 3 60v3h14" />
      <path d="M73 43h3c9.4 0 17 7.6 17 17v3H79" />
    </svg>
  )
}

function FieldLabel({ children, required }) {
  return (
    <span className="mb-2 block text-sm font-semibold text-[#0B2E26]">
      {children}

      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </span>
  )
}

export default function CreateGroupModal({
  masterGroups = [],
  addMasterGroup,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const nextSequence = useMemo(
    () => getNextGroupSequence(masterGroups),
    [masterGroups],
  )

  const previewGroupId = useMemo(
    () => generateGroupId(nextSequence),
    [nextSequence],
  )


  const unitOptions = useMemo(
    () => getUnitOptions(form.instansi),
    [form.instansi],
  )

  const unitFieldLabel =
    form.instansi === 'DPRD'
      ? 'AKD / Unit Kunjungan'
      : 'Bagian / Unit Kerja'

  const previewUnitLabel = useMemo(
    () => getUnitLabel(form.instansi, form.unitKunjungan),
    [form.instansi, form.unitKunjungan],
  )

  const previewName = useMemo(() => {
    if (!form.instansi || !form.level || !form.wilayah.trim()) {
      return 'Nama group akan dibuat otomatis'
    }

    return buildGroupName({
      instansi: form.instansi,
      level: form.level,
      wilayah: form.wilayah.trim(),
    })
  }, [form.instansi, form.level, form.wilayah])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && !saving) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, saving])

  function updateField(field, value) {
    setError('')

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleLevelChange(value) {
    setError('')

    setForm((current) => ({
      ...current,
      level: value,
      wilayah: '',
    }))
  }

  function handleInstansiChange(value) {
    setError('')

    setForm((current) => ({
      ...current,
      instansi: value,
      unitKunjungan: '',
    }))
  }

  function validateForm() {
    if (!form.instansi) {
      return 'Pilih unsur atau instansi terlebih dahulu.'
    }

    if (!form.level) {
      return 'Pilih tingkat wilayah terlebih dahulu.'
    }

    if (!form.wilayah.trim()) {
      return 'Isi nama wilayah terlebih dahulu.'
    }

    if (!form.unitKunjungan) {
      return form.instansi === 'DPRD'
        ? 'Pilih AKD atau unit kunjungan terlebih dahulu.'
        : 'Pilih bagian atau unit kerja terlebih dahulu.'
    }

    if (!form.tanggalKegiatan) {
      return 'Pilih tanggal kegiatan terlebih dahulu.'
    }

    const normalizedName = previewName.trim().toUpperCase()
    const normalizedUnit = form.unitKunjungan.trim().toUpperCase()

    const duplicate = masterGroups.some((group) => {
      const sameName =
        String(group.name || '').trim().toUpperCase() ===
        normalizedName

      const sameDate =
        group.tanggalKegiatan === form.tanggalKegiatan

      const sameUnit =
        String(group.unitKunjungan || '').trim().toUpperCase() ===
        normalizedUnit

      return sameName && sameDate && sameUnit
    })

    if (duplicate) {
      return 'Group dengan wilayah, tanggal, dan AKD/Bagian yang sama sudah tersedia.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')

    try {
      const newGroup = createMasterGroup({
        instansi: form.instansi,
        level: form.level,
        wilayah: form.wilayah.trim(),
        unitKunjungan: form.unitKunjungan,
        groupSequence: nextSequence,
        tanggalKegiatan: form.tanggalKegiatan,
      })

      const result = await addMasterGroup(newGroup)

      if (!result?.ok) {
        setError(
          result?.error?.message ||
          'Group gagal disimpan ke Supabase. Silakan coba kembali.',
        )
        return
      }

      if (onCreated) {
        onCreated(result.group)
      } else {
        onClose()
      }
    } catch (submitError) {
      console.error(
        '[DIHATIMU] Gagal membuat group:',
        submitError,
      )

      setError(
        'Terjadi kesalahan ketika menyimpan group. Periksa koneksi internet.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Tutup modal"
        disabled={saving}
        onClick={onClose}
        className="absolute inset-0 bg-[#011a10]/55 backdrop-blur-[3px] disabled:cursor-not-allowed"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-[28px] border border-[#013220]/10 bg-white shadow-[0_28px_80px_rgba(1,26,16,0.30)]"
      >
        <div className="relative overflow-hidden rounded-t-[28px] bg-gradient-to-br from-[#02503B] via-[#04694B] to-[#02503B] px-6 py-6 text-white sm:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.08] to-transparent"
          />

          <IconGroup
            aria-hidden
            className="pointer-events-none absolute -bottom-4 right-5 h-32 w-40 text-white/[0.10]"
          />

          <div className="relative flex items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                Master Group
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Buat Group Baru
              </h2>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                Tentukan unsur kunjungan, AKD atau bagian, wilayah, dan tanggal kegiatan.
              </p>
            </div>

            <button
              type="button"
              aria-label="Tutup"
              disabled={saving}
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6 sm:px-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required>
                  Unsur/Instansi
                </FieldLabel>

                <div className="relative">
                  <select
                    value={form.instansi}
                    disabled={saving}
                    onChange={(event) =>
                      handleInstansiChange(event.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-sm font-medium text-[#0B2E26] outline-none transition focus:border-[#04694B] focus:ring-4 focus:ring-[#04694B]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">Pilih unsur/instansi</option>

                    {instansiOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'SEKRETARIAT'
                          ? 'Sekretariat DPRD'
                          : option}
                      </option>
                    ))}
                  </select>

                  <IconChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B2E26]" />
                </div>
              </label>

              <label className="block">
                <FieldLabel required>
                  Tingkat Wilayah
                </FieldLabel>

                <div className="relative">
                  <select
                    value={form.level}
                    disabled={saving}
                    onChange={(event) =>
                      handleLevelChange(event.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-sm font-medium text-[#0B2E26] outline-none transition focus:border-[#04694B] focus:ring-4 focus:ring-[#04694B]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">Pilih tingkat wilayah</option>

                    {levelWilayahOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0) + option.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>

                  <IconChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B2E26]" />
                </div>
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required>
                  {form.level
                    ? `Nama ${form.level.charAt(0) +
                    form.level.slice(1).toLowerCase()
                    }`
                    : 'Nama Wilayah'}
                </FieldLabel>

                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={form.wilayah}
                  disabled={saving || !form.level}
                  onChange={(event) =>
                    updateField('wilayah', event.target.value)
                  }
                  placeholder={
                    form.level
                      ? `Masukkan nama ${form.level.toLowerCase()}`
                      : 'Pilih tingkat wilayah dahulu'
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#0B2E26] placeholder:text-slate-400 outline-none transition focus:border-[#04694B] focus:ring-4 focus:ring-[#04694B]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </label>

              <label className="block">
                <FieldLabel required>
                  Tanggal Kegiatan
                </FieldLabel>

                <input
                  type="date"
                  value={form.tanggalKegiatan}
                  disabled={saving}
                  onChange={(event) =>
                    updateField(
                      'tanggalKegiatan',
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#0B2E26] outline-none transition focus:border-[#04694B] focus:ring-4 focus:ring-[#04694B]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </label>
            </div>

            {form.instansi && (
              <motion.label
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="block"
              >
                <FieldLabel required>
                  {unitFieldLabel}
                </FieldLabel>

                <div className="relative">
                  <select
                    value={form.unitKunjungan}
                    disabled={saving}
                    onChange={(event) =>
                      updateField('unitKunjungan', event.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-sm font-medium text-[#0B2E26] outline-none transition focus:border-[#04694B] focus:ring-4 focus:ring-[#04694B]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {form.instansi === 'DPRD'
                        ? 'Pilih AKD / unit kunjungan'
                        : 'Pilih bagian / unit kerja'}
                    </option>

                    {unitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <IconChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B2E26]" />
                </div>
              </motion.label>
            )}

            <div className="overflow-hidden rounded-2xl border border-[#013220]/10 bg-[#F5F8F6]">
              <div className="flex items-center gap-3 border-b border-[#013220]/10 px-5 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#013220]/10 text-[#013220]">
                  <IconBuilding className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#013220]">
                    Preview Group
                  </p>

                  <p className="text-xs text-slate-500">
                    Identitas dibuat otomatis oleh sistem
                  </p>
                </div>
              </div>

              <div className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="break-words text-lg font-bold leading-snug text-[#0B2E26]">
                    {previewName}
                  </p>

                  {previewUnitLabel && (
                    <span className="mt-2 inline-flex rounded-full border border-[#013220]/10 bg-[#013220]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#013220]">
                      {previewUnitLabel}
                    </span>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="font-mono font-bold text-[#013220]">
                      {previewGroupId}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <IconCalendar className="h-4 w-4" />

                      {form.tanggalKegiatan
                        ? formatTanggalKegiatan(
                          form.tanggalKegiatan,
                        )
                        : 'Tanggal belum dipilih'}
                    </span>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-bold uppercase text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 min-w-[170px] items-center justify-center rounded-xl bg-gradient-to-b from-[#014D2F] to-[#013220] px-6 text-sm font-bold text-white shadow-[0_6px_18px_rgba(1,50,32,0.22)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan Group'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
