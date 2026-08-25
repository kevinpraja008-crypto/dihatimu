import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import CreateGroupModal from '../components/CreateGroupModal'
import MonitorQrModal from '../components/MonitorQrModal'
import MasterGroupCard from '../components/master-group/MasterGroupCard'
import { useMasterData } from '../context/MasterDataContext'
import {
  computeGroupStats,
  getActiveGroups,
} from '../data/dummy'

const ITEMS_PER_PAGE = 8

export default function MasterGroup() {
  const navigate = useNavigate()

  const {
    masterGroups,
    addMasterGroup,
    archiveGroup,
    deleteGroup,
  } = useMasterData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('SEMUA')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dateFilter, setDateFilter] = useState('')

  const [qrMonitorGroup, setQrMonitorGroup] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)

  const dateInputRef = useRef(null)

  function getGroupStatus(group) {
    const stats = computeGroupStats(group)

    if (stats.total > 0 && stats.hadir === stats.total) {
      return 'SELESAI'
    }

    return 'AKTIF'
  }

  /*
   * Hanya group aktif yang ditampilkan di Master Group.
   * Group berstatus archived tetap tersimpan dan muncul
   * pada halaman Laporan.
   */
  const allGroups = getActiveGroups(masterGroups)

  const statusCounts = {
    SEMUA: allGroups.length,
    AKTIF: allGroups.filter(
      (group) => getGroupStatus(group) === 'AKTIF',
    ).length,
    SELESAI: allGroups.filter(
      (group) => getGroupStatus(group) === 'SELESAI',
    ).length,
  }

  const filteredGroups = allGroups.filter((group) => {
    const keyword = search.trim().toLowerCase()
    const status = getGroupStatus(group)

    const matchStatus =
      statusFilter === 'SEMUA' || status === statusFilter

    const matchSearch =
      !keyword ||
      group.name?.toLowerCase().includes(keyword) ||
      group.instansi?.toLowerCase().includes(keyword) ||
      group.wilayah?.toLowerCase().includes(keyword) ||
      group.unitKunjungan?.toLowerCase().includes(keyword) ||
      group.groupId?.toLowerCase().includes(keyword)

    const matchDate =
      !dateFilter || group.tanggalKegiatan === dateFilter

    return matchStatus && matchSearch && matchDate
  })

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGroups.length / ITEMS_PER_PAGE),
  )

  const currentGroups = filteredGroups.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusFilter(value) {
    setStatusFilter(value)
    setPage(1)
  }

  function requestMoveToReport(group) {
    setConfirmAction({
      type: 'archive',
      group,
    })
  }

  function requestDeleteGroup(group) {
    setConfirmAction({
      type: 'delete',
      group,
    })
  }

  async function handleConfirmAction() {
    if (!confirmAction || processingAction) return

    const { type, group } = confirmAction

    setProcessingAction(true)

    try {
      if (type === 'archive') {
        await archiveGroup(group.id)
      }

      if (type === 'delete') {
        await deleteGroup(group.id)
      }

      setConfirmAction(null)
      setPage(1)
    } finally {
      setProcessingAction(false)
    }
  }

  function closeConfirmModal() {
    if (processingAction) return
    setConfirmAction(null)
  }

  return (
    <AdminLayout
      title="Master Group"
      subtitle="Kelola group kegiatan dan peserta dengan mudah dan terorganisir"
    >
      <div className="mx-auto max-w-[1760px] space-y-6 px-2">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-3xl border border-[#e8eaed] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B2E26]">
              Master Group
            </h1>

            <p className="mt-1 max-w-xl text-sm text-muted">
              Kelola group kegiatan dan peserta dengan mudah dan terorganisir.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl bg-gradient-to-b from-[#014D2F] to-[#013220] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#013220]/20"
          >
            + Buat Group Baru
          </button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-[#e8eaed] bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[500px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                  />
                </svg>
              </div>

              <input
                value={search}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="Cari nama group atau instansi..."
                className="
                  h-11
                  w-full
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  pl-12 pr-4
                  text-sm
                  font-medium
                  text-[#0B2E26]
                  placeholder:text-slate-400
                  outline-none
                  transition-all
                  duration-200
                  focus:border-[#0B5D46]
                  focus:ring-4
                  focus:ring-[#013220]/8
                "
              />
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-3">
              {[
                {
                  key: 'SEMUA',
                  label: 'Semua',
                  count: statusCounts.SEMUA,
                  icon: '▦',
                },
                {
                  key: 'AKTIF',
                  label: 'Aktif',
                  count: statusCounts.AKTIF,
                },
                {
                  key: 'SELESAI',
                  label: 'Selesai',
                  count: statusCounts.SELESAI,
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    handleStatusFilter(item.key)
                  }
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition ${
                    statusFilter === item.key
                      ? 'bg-gradient-to-b from-[#014D2F] to-[#013220] text-white shadow-lg shadow-[#013220]/20'
                      : 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#013220]/20 hover:bg-[#F8FBF9] hover:text-[#013220]'
                  }`}
                >
                  {item.icon && (
                    <span className="text-lg leading-none">
                      {item.icon}
                    </span>
                  )}

                  <span>{item.label}</span>

                  {item.key !== 'SEMUA' && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                        statusFilter === item.key
                          ? 'bg-white/15 text-white'
                          : 'border border-[#013220]/15 bg-[#013220]/5 text-[#013220]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dateFilter}
                  onChange={(event) => {
                    setDateFilter(event.target.value)
                    setPage(1)
                  }}
                  className="
                    pointer-events-none
                    absolute
                    left-0
                    top-0
                    h-11
                    w-full
                    opacity-0
                  "
                />

                <button
                  type="button"
                  onClick={() => {
                    if (dateInputRef.current?.showPicker) {
                      dateInputRef.current.showPicker()
                    } else {
                      dateInputRef.current?.click()
                    }
                  }}
                  className="
                    inline-flex h-11 items-center gap-2
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    px-4
                    text-sm font-medium text-slate-700
                    shadow-sm
                    transition-all duration-200
                    hover:border-[#013220]/20
                    hover:bg-[#F8FBF9]
                    hover:text-[#013220]
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#013220]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />
                  </svg>

                  <span>
                    {dateFilter || 'Filter Tanggal'}
                  </span>
                </button>
              </div>

              <div className="flex h-11 overflow-hidden rounded-2xl border border-[#e8eaed] bg-white">
                <button
                  type="button"
                  aria-label="Tampilan kartu"
                  className="flex w-11 items-center justify-center bg-[#013220] text-lg text-white"
                >
                  ▦
                </button>

                <button
                  type="button"
                  aria-label="Tampilan daftar"
                  className="flex w-11 items-center justify-center text-lg text-[#0B2E26] transition hover:bg-[#F5F7F9]"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0B2E26]">
                Daftar Group
              </h2>

              <p className="text-sm text-muted">
                Menampilkan {currentGroups.length} dari{' '}
                {filteredGroups.length} group
              </p>
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="rounded-3xl border border-[#e8eaed] bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-muted">
                Tidak ada group yang ditemukan.
              </p>
            </div>
          ) : (
            <>
              <div className="grid items-start justify-center gap-6 md:grid-cols-2 xl:grid-cols-4">
                {currentGroups.map((group, index) => (
                  <MasterGroupCard
                    key={group.id}
                    group={group}
                    index={index}
                    status={getGroupStatus(group)}
                    onManage={(groupId) =>
                      navigate(`/group/${groupId}`)
                    }
                    onQrMonitor={(selectedGroup) =>
                      setQrMonitorGroup(selectedGroup)
                    }
                    onMoveToReport={requestMoveToReport}
                    onDelete={requestDeleteGroup}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((currentPage) =>
                      Math.max(1, currentPage - 1),
                    )
                  }
                  className="rounded-xl border border-[#e8eaed] bg-white px-4 py-2 text-sm font-bold text-[#013220] disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => {
                  const pageNumber = index + 1

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        setPage(pageNumber)
                      }
                      className={`rounded-xl px-4 py-2 text-sm font-bold ${
                        page === pageNumber
                          ? 'bg-[#013220] text-white'
                          : 'border border-[#e8eaed] bg-white text-[#013220]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((currentPage) =>
                      Math.min(
                        totalPages,
                        currentPage + 1,
                      ),
                    )
                  }
                  className="rounded-xl border border-[#e8eaed] bg-white px-4 py-2 text-sm font-bold text-[#013220] disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </>
          )}
        </motion.section>

        {showCreateModal && (
          <CreateGroupModal
            masterGroups={masterGroups}
            addMasterGroup={addMasterGroup}
            onClose={() =>
              setShowCreateModal(false)
            }
            onCreated={() => {
              setSearch('')
              setStatusFilter('SEMUA')
              setDateFilter('')
              setPage(1)
              setShowCreateModal(false)
            }}
          />
        )}

        {qrMonitorGroup && (
          <MonitorQrModal
            group={qrMonitorGroup}
            onClose={() =>
              setQrMonitorGroup(null)
            }
          />
        )}

        {confirmAction && (
          <ConfirmModal
            title={
              confirmAction.type === 'archive'
                ? 'Pindahkan ke Laporan?'
                : 'Hapus Group?'
            }
            message={
              confirmAction.type === 'archive'
                ? `Group "${confirmAction.group.name}" akan dipindahkan dari Master Group ke halaman Laporan.\n\nData group, peserta, QR, dan kehadiran tidak akan dihapus.`
                : `Group "${confirmAction.group.name}" akan dihapus permanen beserta seluruh data yang berkaitan.\n\nTindakan ini tidak dapat dibatalkan.`
            }
            confirmLabel={
              processingAction
                ? 'Memproses...'
                : confirmAction.type === 'archive'
                  ? 'Pindahkan'
                  : 'Hapus'
            }
            danger={
              confirmAction.type === 'delete'
            }
            onCancel={closeConfirmModal}
            onConfirm={handleConfirmAction}
          />
        )}
      </div>
    </AdminLayout>
  )
}