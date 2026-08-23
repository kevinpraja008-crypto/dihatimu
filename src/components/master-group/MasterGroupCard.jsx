import { motion } from 'framer-motion'
import { computeGroupStats, formatTanggalKegiatan } from '../../data/dummy'

export default function MasterGroupCard({ group, index, status, onManage }) {
  const stats = computeGroupStats(group)
  const isSelesai = status === 'SELESAI'

  const cardClass = isSelesai
    ? 'relative flex min-h-[336px] flex-col overflow-hidden rounded-[24px] border border-[rgba(1,50,32,0.08)] bg-gradient-to-br from-white via-[#f8faf9] to-[#eef2f0] p-5 text-[#0B2E26] shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(1,50,32,0.1)]'
    : 'relative flex min-h-[336px] flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-[#013220] via-[#014D2F] to-[#016241] p-5 text-white shadow-[0_12px_40px_rgba(1,50,32,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(1,50,32,0.34)]'

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cardClass}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute right-4 top-[84px] ${
            isSelesai ? 'text-[#013220]/[0.14]' : 'text-white/[0.18]'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-[80px] w-[80px]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm-6.5 8c0-3.03 4.33-5 6.5-5s6.5 1.97 6.5 5v1h-13v-1ZM5.5 11.5A2.5 2.5 0 1 0 5.5 6a2.5 2.5 0 0 0 0 5.5Zm13 0A2.5 2.5 0 1 0 18.5 6a2.5 2.5 0 0 0 0 5.5ZM3 20v-1c0-1.55 1.6-2.79 3.44-3.45A6.62 6.62 0 0 0 4.8 20H3Zm18 0h-1.8a6.62 6.62 0 0 0-1.64-4.45C19.4 16.21 21 17.45 21 19v1Z" />
          </svg>
        </div>

        <div
          className={`absolute -right-16 -bottom-16 h-44 w-44 rounded-full blur-3xl ${
            isSelesai ? 'bg-slate-300/30' : 'bg-emerald-300/10'
          }`}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
              isSelesai
                ? 'border-slate-200 bg-slate-100 text-slate-600'
                : 'border-emerald-400/25 bg-emerald-400/12 text-emerald-200'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isSelesai
                  ? 'bg-slate-500'
                  : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]'
              }`}
            />
            {status}
          </span>

          <div className="flex items-center gap-2.5">
            <span
              className={`font-mono text-[10px] font-semibold tracking-[0.14em] ${
                isSelesai ? 'text-slate-500' : 'text-white/50'
              }`}
            >
              {group.groupId}
            </span>

            <button
              type="button"
              className={`flex h-7 w-7 items-center justify-center rounded-md text-[17px] leading-none transition-colors ${
                isSelesai
                  ? 'text-slate-500 hover:bg-slate-200/60'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              ⋮
            </button>
          </div>
        </div>

        <div className="min-h-[68px] pr-[84px]">
          <h3
            className={`text-[16px] font-bold leading-[1.35] tracking-[-0.01em] ${
              isSelesai ? 'text-[#0B2E26]' : 'text-white'
            }`}
          >
            {group.name}
          </h3>
        </div>

        <p
          className={`mt-2.5 flex items-center gap-1.5 text-[12px] font-medium ${
            isSelesai ? 'text-slate-500' : 'text-white/75'
          }`}
        >
          <span className="text-[13px] leading-none">📅</span>
          <span>
            {group.tanggalKegiatan
              ? formatTanggalKegiatan(group.tanggalKegiatan)
              : 'Tanggal belum diatur'}
          </span>
        </p>

        <div className={`my-3.5 border-t ${isSelesai ? 'border-slate-200/80' : 'border-white/10'}`} />

        <div className="grid grid-cols-3 items-end gap-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
                isSelesai ? 'bg-[#013220]/[0.06] text-[#013220]' : 'bg-white/10 text-white'
              }`}
            >
              <svg
                className="h-[18px] w-[18px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>

            <div>
              <p
                className={`text-[22px] font-black leading-none tabular-nums ${
                  isSelesai ? 'text-[#0B2E26]' : 'text-white'
                }`}
              >
                {stats.total}
              </p>
              <p
                className={`mt-0.5 text-[10px] font-semibold tracking-[0.04em] ${
                  isSelesai ? 'text-slate-500' : 'text-white/75'
                }`}
              >
                Peserta
              </p>
            </div>
          </div>

          <div className="text-center">
            <p
              className={`text-[22px] font-black leading-none tabular-nums ${
                isSelesai ? 'text-emerald-700' : 'text-emerald-300'
              }`}
            >
              {stats.hadir}
            </p>
            <p
              className={`mt-0.5 text-[10px] font-semibold tracking-[0.04em] ${
                isSelesai ? 'text-slate-500' : 'text-white/75'
              }`}
            >
              Hadir
            </p>
          </div>

          <div className="text-center">
            <p
              className={`text-[22px] font-black leading-none tabular-nums ${
                isSelesai ? 'text-[#b8941f]' : 'text-[#e8c84a]'
              }`}
            >
              {stats.belum}
            </p>
            <p
              className={`mt-0.5 text-[10px] font-semibold tracking-[0.04em] ${
                isSelesai ? 'text-slate-500' : 'text-white/75'
              }`}
            >
              Belum
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onManage(group.id)}
          className={`mt-auto flex h-11 w-full items-center justify-between rounded-xl px-4 text-[13px] font-bold tracking-[0.01em] transition-all duration-200 ${
            isSelesai
              ? 'border border-[rgba(1,50,32,0.12)] bg-white text-[#013220] shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:bg-[#f8faf9]'
              : 'bg-white text-[#013220] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-emerald-50/95'
          }`}
        >
          <span className="flex-1 text-center">Kelola Group</span>
          <span className="-mr-0.5 text-[18px] font-normal leading-none">›</span>
        </button>
      </div>
    </motion.article>
  )
}
