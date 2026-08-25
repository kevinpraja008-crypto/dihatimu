import { motion } from 'framer-motion'

function IconParticipants({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="9" cy="8" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 19v-1.5A4.5 4.5 0 018 13h2a4.5 4.5 0 014.5 4.5V19"
      />
      <circle cx="17.5" cy="9" r="2.25" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 14h1.75a3.25 3.25 0 013.25 3.25V19"
      />
    </svg>
  )
}

function IconCheck({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.9}
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12.25l2.6 2.6L16.5 9"
      />
    </svg>
  )
}

function IconPending({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="9" cy="8" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 19v-1.5A4.5 4.5 0 018 13h2a4.5 4.5 0 014.5 4.5V19"
      />
      <circle cx="17.5" cy="9" r="2.25" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 14h1.75a3.25 3.25 0 013.25 3.25V19"
      />
    </svg>
  )
}

export default function GroupDetailStats({ stats }) {
  const items = [
    {
      label: 'Jumlah Peserta',
      value: stats.total,
      icon: IconParticipants,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Sudah Hadir',
      value: stats.hadir,
      icon: IconCheck,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Belum Hadir',
      value: stats.belum,
      icon: IconPending,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <>
      {items.map((item, index) => {
        const Icon = item.icon

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.05 + index * 0.04,
              duration: 0.3,
            }}
            className="admin-card flex min-h-[126px] items-center gap-4 p-5"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] ${item.iconClass}`}
            >
              <Icon className="h-8 w-8" />
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-medium text-slate-500">
                {item.label}
              </p>

              <p className="mt-1 text-[30px] font-bold leading-none tracking-[-0.03em] text-[#0B2E26] tabular-nums">
                {item.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Orang
              </p>
            </div>
          </motion.div>
        )
      })}
    </>
  )
}