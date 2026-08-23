import { motion } from 'framer-motion'

export default function GroupDetailStats({ stats }) {
  return (
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
  )
}
