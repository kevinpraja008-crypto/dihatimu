import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../components/AdminLayout'
import { useMasterData } from '../context/MasterDataContext'
import { computeGroupStats, formatTanggalKegiatan } from '../data/dummy'

export default function GroupDetail() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { masterGroups } = useMasterData()

  const group = masterGroups.find((g) => g.id === groupId)

  if (!group) {
    return (
      <AdminLayout title="Detail Group" subtitle="Kelola peserta dan kehadiran group">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate('/master-group')}
            className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-[#013220] transition-colors hover:text-[#014D2F]"
          >
            <span aria-hidden>‹</span>
            Kembali ke Master Group
          </button>
          <div className="rounded-3xl border border-[#e8eaed] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-muted">Group tidak ditemukan.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const stats = computeGroupStats(group)
  const isSelesai = stats.total > 0 && stats.hadir === stats.total

  return (
    <AdminLayout title="Detail Group" subtitle="Kelola peserta dan kehadiran group">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/master-group')}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#013220] transition-colors hover:text-[#014D2F]"
        >
          <span aria-hidden>‹</span>
          Kembali ke Master Group
        </button>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-hero px-6 py-5 sm:px-8"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d4af37]">
            Admin — Kelola Group
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#0B2E26] sm:text-2xl">{group.name}</h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                <span className="font-mono font-semibold text-[#013220]">{group.groupId}</span>
                <span>{group.instansi}</span>
                {group.tanggalKegiatan && (
                  <span>{formatTanggalKegiatan(group.tanggalKegiatan)}</span>
                )}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${
                isSelesai
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-emerald-500/15 text-emerald-800'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSelesai ? 'bg-slate-500' : 'bg-emerald-500'
                }`}
              />
              {isSelesai ? 'SELESAI' : 'AKTIF'}
            </span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: 'Jumlah Peserta', value: stats.total },
            { label: 'Sudah Hadir', value: stats.hadir },
            { label: 'Belum Hadir', value: stats.belum },
          ].map((item) => (
            <div key={item.label} className="admin-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-[#0B2E26]">{item.value}</p>
            </div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-card p-5"
        >
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-[#013220]">
              {stats.hadir} / {stats.total} peserta hadir
            </span>
            <span className="font-semibold text-[#b8941f]">{stats.percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#e8eaed]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-[#014D2F] to-[#013220]"
            />
          </div>
          </motion.section>

<motion.section
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.15 }}
  className="admin-card p-5"
>
  <div className="flex flex-wrap gap-3">

    <button
      type="button"
      className="admin-btn-primary"
    >
      + Tambah Peserta
    </button>

    <button
      type="button"
      className="admin-btn-secondary"
    >
      QR Monitor
    </button>

    <button
      type="button"
      className="admin-btn-secondary"
    >
      Download Semua QR
    </button>

    <button
      type="button"
      className="admin-btn-secondary"
    >
      Edit Group
    </button>

  </div>
</motion.section>

</div>
</AdminLayout>
)
}