import { motion } from 'framer-motion'

function IconPlus({ className }) {
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
        d="M12 5v14M5 12h14"
      />
    </svg>
  )
}

export default function GroupDetailActions({
  onAddParticipant,
  disabled = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="flex items-center"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onAddParticipant}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#04613F] to-[#013220] px-6 text-sm font-bold text-white shadow-[0_6px_18px_rgba(1,50,32,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(1,50,32,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        <IconPlus className="h-[18px] w-[18px]" />
        Tambah Peserta
      </button>
    </motion.div>
  )
}