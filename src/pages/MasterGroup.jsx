import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../components/AdminLayout'
import CreateGroupModal from '../components/CreateGroupModal'
import { useMasterData } from '../context/MasterDataContext'
import {
  computeGroupStats,
  formatTanggalKegiatan,
  getActiveGroups,
} from '../data/dummy'

const ITEMS_PER_PAGE = 8

export default function MasterGroup() {
  const navigate = useNavigate()

  const { masterGroups, addMasterGroup } = useMasterData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('SEMUA')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dateFilter, setDateFilter] = useState('')
  const dateInputRef = useRef(null)

  function getGroupStatus(group) {
    const stats = computeGroupStats(group)
  
    if (stats.total > 0 && stats.hadir === stats.total) {
      return 'SELESAI'
    }
  
    return 'AKTIF'
  }

  const allGroups = masterGroups

  const statusCounts = {
    SEMUA: allGroups.length,
    AKTIF: allGroups.filter((group) => getGroupStatus(group) === 'AKTIF').length,
    SELESAI: allGroups.filter((group) => getGroupStatus(group) === 'SELESAI').length,
  }

  const filteredGroups = allGroups.filter((group) => {
    const keyword = search.toLowerCase()
    const status = getGroupStatus(group)

    const matchStatus =
      statusFilter === 'SEMUA' || status === statusFilter

      const matchSearch =
      group.name?.toLowerCase().includes(keyword) ||
      group.instansi?.toLowerCase().includes(keyword) ||
      group.wilayah?.toLowerCase().includes(keyword) ||
      group.groupId?.toLowerCase().includes(keyword)
    
    const matchDate =
      !dateFilter || group.tanggalKegiatan === dateFilter
    
    return matchStatus && matchSearch && matchDate
  })

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / ITEMS_PER_PAGE))
  const currentGroups = filteredGroups.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  return (
    <AdminLayout
      title="Master Group"
      subtitle="Kelola group kegiatan dan peserta dengan mudah dan terorganisir"
    >
      <div className="mx-auto max-w-7xl space-y-6">
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
  onChange={(e) => handleSearch(e.target.value)}
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
  { key: 'SEMUA', label: 'Semua', count: statusCounts.SEMUA, icon: '▦' },
  { key: 'AKTIF', label: 'Aktif', count: statusCounts.AKTIF },
  { key: 'SELESAI', label: 'Selesai', count: statusCounts.SELESAI },
  
].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStatusFilter(item.key)}
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition ${
                    statusFilter === item.key
                      ? 'bg-gradient-to-b from-[#014D2F] to-[#013220] text-white shadow-lg shadow-[#013220]/20'
                      : 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#013220]/20 hover:bg-[#F8FBF9] hover:text-[#013220]'
                  }`}
                >
                  {item.icon && <span className="text-lg leading-none">{item.icon}</span>}
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
  onChange={(e) => {
    setDateFilter(e.target.value)
    setPage(1)
  }}
  className="
    absolute
    left-0
    top-0
    h-11
    w-full
    opacity-0
    pointer-events-none
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

    <span>{dateFilter || 'Filter Tanggal'}</span>
  </button>
</div>

  <div
    className="
      flex
      h-11
      overflow-hidden
      rounded-2xl
      border border-[#e8eaed]
      bg-white
    "
  >
    <button
      type="button"
      className="
        flex w-11 items-center justify-center
        bg-[#013220]
        text-lg text-white
      "
    >
      ▦
    </button>

    <button
      type="button"
      className="
        flex w-11 items-center justify-center
        text-lg text-[#0B2E26]
        transition
        hover:bg-[#F5F7F9]
      "
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
              <h2 className="text-lg font-bold text-[#0B2E26]">Daftar Group</h2>
              <p className="text-sm text-muted">
                Menampilkan {currentGroups.length} dari {filteredGroups.length} group
              </p>
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="rounded-3xl border border-[#e8eaed] bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-muted">Tidak ada group yang ditemukan.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {currentGroups.map((group, index) => {
  const stats = computeGroupStats(group)
  const status = getGroupStatus(group)
  const isSelesai = status === 'SELESAI'

  const cardClass = isSelesai
  ? 'relative min-h-[325px] overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-200 p-5 text-slate-900 shadow-2xl shadow-slate-300/40'
  : 'relative min-h-[325px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#013220] via-[#06452d] to-[#0B2E26] p-5 text-white shadow-2xl shadow-[#013220]/30'

  return (
    <motion.article
      key={group.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cardClass}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute right-5 top-[92px] ${
            isSelesai ? 'text-emerald-900/18' : 'text-white/22'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-[90px] w-[90px]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm-6.5 8c0-3.03 4.33-5 6.5-5s6.5 1.97 6.5 5v1h-13v-1ZM5.5 11.5A2.5 2.5 0 1 0 5.5 6a2.5 2.5 0 0 0 0 5.5Zm13 0A2.5 2.5 0 1 0 18.5 6a2.5 2.5 0 0 0 0 5.5ZM3 20v-1c0-1.55 1.6-2.79 3.44-3.45A6.62 6.62 0 0 0 4.8 20H3Zm18 0h-1.8a6.62 6.62 0 0 0-1.64-4.45C19.4 16.21 21 17.45 21 19v1Z" />
          </svg>
        </div>
  
        <div
          className={`absolute -right-16 -bottom-16 h-44 w-44 rounded-full blur-3xl ${
            isSelesai ? 'bg-slate-300/30' : 'bg-emerald-300/10'
          }`}
        />
      </div>
  
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-7 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${
              isSelesai
                ? 'bg-slate-100 text-slate-700'
                : 'bg-emerald-500/15 text-emerald-100'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isSelesai
                  ? 'bg-slate-500'
                  : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
              }`}
            />
            {status}
          </span>
  
          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-[11px] font-bold tracking-[0.12em] ${
                isSelesai ? 'text-slate-600' : 'text-white'
              }`}
            >
              {group.groupId}
            </span>
  
            <button
              type="button"
              className={`text-xl leading-none ${
                isSelesai ? 'text-slate-700' : 'text-white'
              }`}
            >
              ⋮
            </button>
          </div>
        </div>
  
        <div className="min-h-[74px] pr-[96px]">
          <h3
            className={`text-[18px] font-extrabold leading-tight tracking-tight ${
              isSelesai ? 'text-slate-900' : 'text-white'
            }`}
          >
            {group.name}
          </h3>
        </div>
  
        <p
          className={`mt-1 flex items-center gap-2 text-[13px] font-semibold ${
            isSelesai ? 'text-slate-600' : 'text-white/85'
          }`}
        >
          <span>📅</span>
          <span>
            {group.tanggalKegiatan
              ? formatTanggalKegiatan(group.tanggalKegiatan)
              : 'Tanggal belum diatur'}
          </span>
        </p>
  
        <div className={`my-4 border-t ${isSelesai ? 'border-slate-200' : 'border-white/15'}`} />
  
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
  <div className="flex items-center gap-3">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
        isSelesai ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-white'
      }`}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    </div>

    <div>
      <p
        className={`text-[26px] font-black leading-none ${
          isSelesai ? 'text-slate-900' : 'text-white'
        }`}
      >
        {stats.total}
      </p>
      <p
        className={`mt-1 text-[11px] font-semibold ${
          isSelesai ? 'text-slate-600' : 'text-white/85'
        }`}
      >
        Peserta
      </p>
    </div>
  </div>

  <div className={`h-12 w-px ${isSelesai ? 'bg-slate-200' : 'bg-white/25'}`} />

  <div>
    <p
      className={`text-[11px] leading-tight ${
        isSelesai ? 'text-slate-500' : 'text-white/70'
      }`}
    >
      Terakhir diperbarui
    </p>

    <p
      className={`mt-1 text-[13px] font-black ${
        isSelesai ? 'text-slate-900' : 'text-white'
      }`}
    >
      10:25 WIB
    </p>
  </div>
</div>
  
<button
  type="button"
  onClick={() => navigate(`/group/${group.id}`)}
  className={`mt-auto flex h-12 w-full items-center justify-between rounded-2xl px-5 text-sm font-bold transition ${
    isSelesai
      ? 'border border-emerald-800/30 bg-white text-[#013220] hover:bg-slate-100'
      : 'bg-white text-[#013220] shadow-lg shadow-black/10 hover:bg-emerald-50'
  }`}
        >
          <span className="flex-1 text-center">Kelola Group</span>
          <span className="text-xl">›</span>
        </button>
      </div>
    </motion.article>
  )
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-[#e8eaed] bg-white px-4 py-2 text-sm font-bold text-[#013220] disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    onClick={() => setPage(i + 1)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold ${
                      page === i + 1
                        ? 'bg-[#013220] text-white'
                        : 'border border-[#e8eaed] bg-white text-[#013220]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </AdminLayout>
  )
}