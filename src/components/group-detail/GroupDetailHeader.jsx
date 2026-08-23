import { motion } from 'framer-motion'
import { formatTanggalKegiatan } from '../../data/dummy'

export default function GroupDetailHeader({ group, isSelesai }) {
  return (
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
  )
}
