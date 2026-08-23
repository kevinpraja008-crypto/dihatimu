import { motion } from 'framer-motion'

export default function GroupDetailProgress({ stats }) {
  return (
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
  )
}
