import { useState } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../components/AdminLayout'
import GroupCard from '../components/GroupCard'
import { useMasterData } from '../context/MasterDataContext'
import { computeGroupStats, groupArchivedByDate } from '../data/dummy'
import { downloadGroupPdf } from '../data/pdfService'

function DateSummaryCards({ groups }) {
  const summary = groups.reduce(
    (acc, group) => {
      const s = computeGroupStats(group)
      acc.totalGroup += 1
      acc.totalPeserta += s.total
      acc.hadir += s.hadir
      acc.belumHadir += s.belum
      return acc
    },
    { totalGroup: 0, totalPeserta: 0, hadir: 0, belumHadir: 0 },
  )

  const pct =
    summary.totalPeserta > 0
      ? Math.round((summary.hadir / summary.totalPeserta) * 100)
      : 0

  const items = [
    { label: 'Jumlah Group', value: summary.totalGroup, accent: '#013220' },
    { label: 'Jumlah Peserta', value: summary.totalPeserta, accent: '#014D2F' },
    { label: 'Jumlah Hadir', value: summary.hadir, accent: '#16a34a' },
    { label: 'Belum Hadir', value: summary.belumHadir, accent: '#d4af37' },
    { label: 'Persentase Kehadiran', value: `${pct}%`, accent: '#013220', wide: true },
  ]

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className={`admin-card stat-card-hover relative overflow-hidden p-5 ${item.wide ? 'sm:col-span-2 xl:col-span-1' : ''}`}
        >
          <div className="stat-accent" style={{ background: item.accent }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
            {item.label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[#0B2E26]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function Laporan() {
  const {
    masterGroups,
    restoreGroup,
    deleteGroup,
    updateGroup,
    updateParticipant,
    deleteParticipant,
    addParticipant,
  } = useMasterData()

  const [view, setView] = useState('dates')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(null)

  const dateGroups = groupArchivedByDate(masterGroups)
  const groupsOnDate = selectedDate
    ? dateGroups.find((d) => d.date === selectedDate)?.groups || []
    : []
  const selectedGroup = selectedGroupId
    ? masterGroups.find((g) => g.id === selectedGroupId)
    : null

  async function handleQuickPdf(group) {
    setPdfLoading(group.id)
    try {
      await downloadGroupPdf(group)
    } finally {
      setPdfLoading(null)
    }
  }

  return (
    <AdminLayout title="Laporan" subtitle="Executive report — arsip kehadiran tamu DPRD">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="admin-hero px-6 py-5 sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d4af37]">
            Executive Report
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#0B2E26] sm:text-2xl">
            Laporan Kehadiran Tamu
          </h2>
          <p className="mt-1 text-sm text-muted">
            Sekretariat DPRD Kabupaten Subang
          </p>
        </div>

        {view !== 'dates' && (
          <button
            type="button"
            onClick={() => {
              if (view === 'group-detail') setView('date-detail')
              else setView('dates')
              setSelectedGroupId(null)
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#013220] transition-colors hover:text-[#014D2F]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
        )}

        {view === 'dates' && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="admin-section-title mb-4">Arsip Berdasarkan Tanggal</h2>
            {dateGroups.length === 0 ? (
              <div className="admin-card p-6">
                <p className="text-sm text-muted">
                  Belum ada group diarsipkan. Arsipkan group dari Master Group setelah kegiatan selesai.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {dateGroups.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => { setSelectedDate(item.date); setView('date-detail') }}
                    className="admin-card stat-card-hover group flex w-full items-center justify-between p-5 text-left"
                  >
                    <div>
                      <p className="font-bold text-[#0B2E26]">{item.label}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.groups.length} Group diarsipkan
                      </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#013220]/5 text-[#013220] transition-colors group-hover:bg-[#013220] group-hover:text-white">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {view === 'date-detail' && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="admin-section-title mb-4">
              {dateGroups.find((d) => d.date === selectedDate)?.label}
            </h2>
            <DateSummaryCards groups={groupsOnDate} />
            <div className="space-y-4">
              {groupsOnDate.map((group) => {
                const s = computeGroupStats(group)
                const pct = s.total > 0 ? Math.round((s.hadir / s.total) * 100) : 0
                return (
                  <div key={group.id} className="admin-card stat-card-hover p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B2E26]">{group.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
                          <span>{s.total} Peserta</span>
                          <span className="text-emerald-600">{s.hadir} Hadir</span>
                          <span className="text-[#b8941f]">{s.belum} Belum Hadir</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold tabular-nums text-[#013220]">{pct}%</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                          Kehadiran
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8eaed]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#013220] to-[#014D2F]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setSelectedGroupId(group.id); setView('group-detail') }}
                        className="admin-btn-secondary px-3 py-1.5 text-xs"
                      >
                        DETAIL
                      </button>
                      <button
                        type="button"
                        disabled={pdfLoading === group.id}
                        onClick={() => handleQuickPdf(group)}
                        className="rounded-lg border border-[#e8eaed] px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-soft-gray disabled:opacity-50"
                      >
                        {pdfLoading === group.id ? 'MEMBUAT PDF...' : 'DOWNLOAD PDF'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>
        )}

        {view === 'group-detail' && selectedGroup && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GroupCard
              group={selectedGroup}
              masterGroups={masterGroups}
              variant="archive"
              onAddParticipant={addParticipant}
              onUpdateGroup={updateGroup}
              onArchiveGroup={() => {}}
              onRestoreGroup={restoreGroup}
              onDeleteGroup={deleteGroup}
              onUpdateParticipant={updateParticipant}
              onDeleteParticipant={deleteParticipant}
            />
          </motion.section>
        )}
      </div>
    </AdminLayout>
  )
}
