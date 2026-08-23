import { motion } from 'framer-motion'

export default function GroupDetailActions() {
  return (
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
  )
}
