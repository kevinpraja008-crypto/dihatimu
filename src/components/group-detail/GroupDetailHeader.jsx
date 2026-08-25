import { motion } from 'framer-motion'

function FivePersonWatermark({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 300 140"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Orang tengah */}
      <circle cx="150" cy="33" r="17" strokeWidth="4" />
      <path
        d="M106 124v-8c0-32 19.7-58 44-58s44 26 44 58v8"
        strokeWidth="4"
      />
      <path d="M106 124h88" strokeWidth="4" />

      {/* Orang kiri dalam */}
      <circle cx="91" cy="46" r="13" strokeWidth="3.5" />
      <path
        d="M58 121v-7c0-25 14.8-45 33-45 7.1 0 13.7 3 19 8"
        strokeWidth="3.5"
      />
      <path d="M58 121h31" strokeWidth="3.5" />

      {/* Orang kiri luar */}
      <circle cx="38" cy="58" r="10" strokeWidth="3.2" />
      <path
        d="M10 120v-5c0-20 12.5-36 28-36 8 0 15.2 4.2 20.3 11"
        strokeWidth="3.2"
      />
      <path d="M10 120h29" strokeWidth="3.2" />

      {/* Orang kanan dalam */}
      <circle cx="209" cy="46" r="13" strokeWidth="3.5" />
      <path
        d="M242 121v-7c0-25-14.8-45-33-45-7.1 0-13.7 3-19 8"
        strokeWidth="3.5"
      />
      <path d="M211 121h31" strokeWidth="3.5" />

      {/* Orang kanan luar */}
      <circle cx="262" cy="58" r="10" strokeWidth="3.2" />
      <path
        d="M290 120v-5c0-20-12.5-36-28-36-8 0-15.2 4.2-20.3 11"
        strokeWidth="3.2"
      />
      <path d="M261 120h29" strokeWidth="3.2" />
    </svg>
  )
}

export default function GroupDetailHeader({
  group,
  isSelesai,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-[156px] overflow-hidden rounded-[20px] border border-[rgba(1,50,32,0.18)] bg-gradient-to-br from-white via-[#fbfcfb] to-[#f3f7f5] px-6 py-6 shadow-[0_10px_30px_rgba(1,50,32,0.09)] sm:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[48%] bg-gradient-to-l from-[#013220]/[0.035] to-transparent"
      />

      <FivePersonWatermark className="pointer-events-none absolute -bottom-2 -right-8 h-[145px] w-[310px] text-[#047857]/[0.22] sm:right-3 sm:h-[155px] sm:w-[330px]" />

      <div className="relative z-10 max-w-[900px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#047857]">
          Kelola Peserta
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="max-w-[850px] text-[22px] font-bold leading-[1.2] tracking-[-0.015em] text-[#0B2E26] sm:text-[27px]">
            {group.name}
          </h1>

          <span
            className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3.5 text-[10px] font-bold uppercase tracking-[0.04em] ${
              isSelesai
                ? 'border border-slate-200 bg-slate-100 text-slate-600'
                : 'border border-emerald-200 bg-emerald-100/80 text-emerald-700'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSelesai
                  ? 'bg-slate-500'
                  : 'bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.6)]'
              }`}
            />
            {isSelesai ? 'Selesai' : 'Aktif'}
          </span>
        </div>

        <div className="mt-4 flex items-center">
          <span className="rounded-lg bg-[#013220]/[0.055] px-2.5 py-1 font-mono text-[12px] font-bold tracking-[0.04em] text-[#013220]">
            {group.groupId}
          </span>
        </div>
      </div>
    </motion.section>
  )
}