import { motion } from 'framer-motion'

export default function GroupDetailProgress({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.17, duration: 0.3 }}
      className="admin-card flex min-h-[126px] flex-col justify-center p-5"
    >
      <p className="text-[13px] font-medium text-slate-500">
        Progress Kehadiran
      </p>

      <p className="mt-1 text-[30px] font-bold leading-none tracking-[-0.03em] text-[#047857] tabular-nums">
        {stats.percent}%
      </p>

      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          {stats.hadir} / {stats.total} peserta hadir
        </span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8eaed]"
        role="progressbar"
        aria-label="Progress kehadiran"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stats.percent}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stats.percent}%` }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-[#047857]"
        />
      </div>
    </motion.div>
  )
}