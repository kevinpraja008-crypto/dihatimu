import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import { formatTanggalKegiatan } from '../../data/dummy'

const PAGE_SIZE = 10

function IconSearch({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="11" cy="11" r="7" />
      <path
        strokeLinecap="round"
        d="M16.5 16.5L21 21"
      />
    </svg>
  )
}

function IconDownload({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v12m0 0l-4-4m4 4 4-4M5 20h14"
      />
    </svg>
  )
}

function IconDots({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="19" r="1.7" />
    </svg>
  )
}

function IconEye({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function IconEdit({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6.5l4 4M4 20l4.25-1 10.4-10.4a2.12 2.12 0 00-3-3L5.25 17 4 20z"
      />
    </svg>
  )
}

function IconQr({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 14h3v3h-3v-3zm4 0h3v3m-3 1v3h3m-7-3v3h3"
      />
    </svg>
  )
}

function IconTrash({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16m-10 4v6m4-6v6M9 7V4h6v3m-9 0 1 14h10l1-14"
      />
    </svg>
  )
}

function IconChevronLeft({ className }) {
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
        d="M15 18l-6-6 6-6"
      />
    </svg>
  )
}

function IconChevronRight({ className }) {
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
        d="M9 6l6 6-6 6"
      />
    </svg>
  )
}

function getInitials(name) {
  return String(name || 'P')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

function ParticipantAvatar({ participant }) {
  if (participant.foto) {
    return (
      <img
        src={participant.foto}
        alt={participant.nama}
        className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
      />
    )
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-100 to-emerald-50 text-xs font-bold text-emerald-800 shadow-sm">
      {getInitials(participant.nama)}
    </div>
  )
}

function getRoleClass(role) {
  if (role === 'PENERIMA TAMU') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (role === 'PENANDATANGAN SPPD') {
    return 'bg-emerald-100 text-emerald-700'
  }

  return 'bg-blue-100 text-blue-700'
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.03em] ${getRoleClass(
        role,
      )}`}
    >
      {role || 'TAMU'}
    </span>
  )
}

function AttendanceStatus({ participant }) {
  const hadir = participant.kehadiran === 'HADIR'

  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold ${hadir ? 'text-emerald-700' : 'text-emerald-700'
        }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${hadir ? 'bg-emerald-500' : 'bg-emerald-500'
          }`}
      />
      {hadir ? 'Hadir' : 'Belum Hadir'}
    </span>
  )
}

function ParticipantMenu({
  participant,
  open,
  onToggle,
  onClose,
  onEdit,
  onViewAttendance,
  onDownloadQr,
  onDelete,
}) {
  const hadir = participant.kehadiran === 'HADIR'

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={`Aksi peserta ${participant.nama}`}
        aria-expanded={open}
        onClick={onToggle}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${open
          ? 'border-[#013220] bg-[#013220] text-white'
          : 'border-slate-200 bg-white text-[#0B2E26] hover:bg-slate-50'
          }`}
      >
        <IconDots className="h-[17px] w-[17px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: -4,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: -4,
            }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
          >
            <button
              type="button"
              disabled={!hadir}
              onClick={() => {
                if (!hadir) return

                onClose()
                onViewAttendance?.(participant)
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${hadir
                ? 'text-slate-700 hover:bg-slate-50'
                : 'cursor-not-allowed text-slate-400'
                }`}
            >
              <IconEye
                className={`h-[18px] w-[18px] ${hadir ? 'text-[#013220]' : 'text-slate-300'
                  }`}
              />

              {hadir
                ? 'Lihat Kehadiran'
                : 'Belum ada data kehadiran'}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit?.(participant)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <IconEdit className="h-[18px] w-[18px] text-[#013220]" />
              Edit Peserta
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                onDownloadQr?.(participant)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <IconQr className="h-[18px] w-[18px] text-[#013220]" />
              Download QR
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                onClose()
                onDelete?.(participant)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <IconTrash className="h-[18px] w-[18px]" />
              Hapus Peserta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    )
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ]
}

function getAttendanceDate(participant) {
  if (!participant.tanggalHadir) return '-'

  return formatTanggalKegiatan(
    participant.tanggalHadir,
  )
}

export default function ParticipantsTable({
  group,
  stats,
  onEditParticipant,
  onViewAttendance,
  onDownloadQr,
  onDeleteParticipant,
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('SEMUA')
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] =
    useState(null)

  const participants = group.participants || []

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase()

    return participants.filter((participant) => {
      const matchesSearch =
        !normalizedQuery ||
        [
          participant.nama,
          participant.jabatan,
          participant.role,
          participant.qrId,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(normalizedQuery),
          )

      const matchesStatus =
        statusFilter === 'SEMUA' ||
        (statusFilter === 'HADIR' &&
          participant.kehadiran === 'HADIR') ||
        (statusFilter === 'BELUM' &&
          participant.kehadiran !== 'HADIR')

      return matchesSearch && matchesStatus
    })
  }, [participants, query, statusFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredParticipants.length / PAGE_SIZE,
    ),
  )

  useEffect(() => {
    setPage(1)
    setOpenMenuId(null)
  }, [query, statusFilter, group.id])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const startIndex = (page - 1) * PAGE_SIZE
  const visibleParticipants =
    filteredParticipants.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    )

  const firstShown =
    filteredParticipants.length > 0
      ? startIndex + 1
      : 0

  const lastShown = Math.min(
    startIndex + PAGE_SIZE,
    filteredParticipants.length,
  )

  const visiblePages = getVisiblePages(
    page,
    totalPages,
  )

  const filters = [
    {
      value: 'SEMUA',
      label: 'Semua',
    },
    {
      value: 'HADIR',
      label: 'Hadir',
    },
    {
      value: 'BELUM',
      label: 'Belum Hadir',
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24, duration: 0.3 }}
      className="admin-card relative overflow-visible"
    >
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0B2E26]">
            Daftar Peserta
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            Total {stats.total} peserta dalam group
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-[330px]">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Cari peserta..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0B2E26] outline-none transition focus:border-[#04694B] focus:ring-4 focus:ring-[#04694B]/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {filters.map((filter) => {
                const active =
                  statusFilter === filter.value

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setStatusFilter(filter.value)
                    }
                    className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition-colors sm:flex-none ${active
                      ? 'bg-[#013220] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white'
                      }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[rgba(1,50,32,0.16)] bg-white px-4 text-xs font-bold text-[#013220] transition-colors hover:bg-[#013220]/[0.04]"
            >
              <IconDownload className="h-[18px] w-[18px]" />
              Download Semua QR
            </button>
          </div>
        </div>
      </div>

      {visibleParticipants.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="7" r="3" />
              <path d="M6.5 20v-1.5a5.5 5.5 0 0111 0V20" />
              <circle cx="5.5" cy="9" r="2" />
              <path d="M2 19v-1a4 4 0 014-4" />
              <circle cx="18.5" cy="9" r="2" />
              <path d="M22 19v-1a4 4 0 00-4-4" />
            </svg>
          </div>

          <p className="mt-4 font-semibold text-[#0B2E26]">
            {participants.length === 0
              ? 'Belum ada peserta'
              : 'Peserta tidak ditemukan'}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {participants.length === 0
              ? 'Tambahkan peserta pertama pada group ini.'
              : 'Coba ubah pencarian atau filter kehadiran.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabel laptop dan desktop */}
          <div className="hidden overflow-visible lg:block">
            <table className="w-full table-fixed">
              <thead className="bg-[#f8faf9]">
                <tr className="border-b border-slate-200">
                  <th className="w-[32%] px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Nama & Jabatan
                  </th>

                  <th className="w-[18%] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Role
                  </th>

                  <th className="w-[16%] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Status
                  </th>

                  <th className="w-[12%] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Waktu
                  </th>

                  <th className="w-[16%] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Tanggal
                  </th>

                  <th className="w-[6%] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleParticipants.map(
                  (participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-[#013220]/[0.018]"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <ParticipantAvatar
                            participant={participant}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#0B2E26]">
                              {participant.nama}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {participant.jabatan ||
                                'Jabatan belum diisi'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <RoleBadge
                          role={participant.role}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <AttendanceStatus
                          participant={participant}
                        />
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-slate-600">
                        {participant.jamHadir || '-'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600">
                        {getAttendanceDate(participant)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <ParticipantMenu
                          participant={participant}
                          open={
                            openMenuId ===
                            participant.id
                          }
                          onToggle={() =>
                            setOpenMenuId(
                              openMenuId ===
                                participant.id
                                ? null
                                : participant.id,
                            )
                          }
                          onClose={() =>
                            setOpenMenuId(null)
                          }
                          onEdit={onEditParticipant}
                          onViewAttendance={onViewAttendance}
                          onDownloadQr={onDownloadQr}
                          onDelete={onDeleteParticipant}
                        />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* Card HP dan tablet portrait */}
          <div className="space-y-3 p-4 lg:hidden">
            {visibleParticipants.map(
              (participant) => (
                <div
                  key={participant.id}
                  className="relative rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <ParticipantAvatar
                      participant={participant}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="pr-8 text-sm font-bold text-[#0B2E26]">
                        {participant.nama}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {participant.jabatan ||
                          'Jabatan belum diisi'}
                      </p>

                      <div className="mt-2">
                        <RoleBadge
                          role={participant.role}
                        />
                      </div>
                    </div>

                    <ParticipantMenu
                      participant={participant}
                      open={
                        openMenuId === participant.id
                      }
                      onToggle={() =>
                        setOpenMenuId(
                          openMenuId === participant.id
                            ? null
                            : participant.id,
                        )
                      }
                      onClose={() =>
                        setOpenMenuId(null)
                      }
                      onEdit={onEditParticipant}
                      onViewAttendance={onViewAttendance}
                      onDownloadQr={onDownloadQr}
                      onDelete={onDeleteParticipant}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </p>

                      <div className="mt-1">
                        <AttendanceStatus
                          participant={participant}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Waktu
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {participant.jamHadir || '-'}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Tanggal Kehadiran
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {getAttendanceDate(participant)}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-slate-500">
          Menampilkan {firstShown}–{lastShown} dari{' '}
          {filteredParticipants.length} peserta
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1),
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#013220] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>

          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold ${page === pageNumber
                ? 'bg-[#013220] text-white shadow-sm'
                : 'border border-slate-200 bg-white text-[#013220]'
                }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1,
                ),
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#013220] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>

          <span className="ml-1 inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500">
            {PAGE_SIZE} / halaman
          </span>
        </div>
      </div>
    </motion.section>
  )
}