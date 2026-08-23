import { motion } from 'framer-motion'
import {
  computeGroupStats,
  formatTanggalKegiatan,
} from '../../data/dummy'

function IconCalendar({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
      />
    </svg>
  )
}

function IconUser({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.85}
    >
      <circle cx="12" cy="6.75" r="3.75" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 21v-1.25C4 15.47 7.58 12 12 12s8 3.47 8 7.75V21H4z"
      />
    </svg>
  )
}

function IconCheckCircle({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.85}
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 12l2.5 2.5 4.75-5"
      />
    </svg>
  )
}

function IconXCircle({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.85}
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9l6 6m0-6l-6 6"
      />
    </svg>
  )
}

function IconChevronRight({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </svg>
  )
}

function IconKebab({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  )
}

function WatermarkGroup({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 96 72"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Kepala utama */}
      <circle cx="48" cy="16" r="10" />

      {/* Kepala kiri dan kanan */}
      <circle cx="20" cy="24" r="7" />
      <circle cx="76" cy="24" r="7" />

      {/* Badan utama */}
      <path d="M24 63v-4c0-12.7 10.7-23 24-23s24 10.3 24 23v4" />
      <path d="M24 63h48" />

      {/* Badan kiri */}
      <path d="M23 43h-3C10.6 43 3 50.6 3 60v3h14" />

      {/* Badan kanan */}
      <path d="M73 43h3c9.4 0 17 7.6 17 17v3H79" />
    </svg>
  )
}

function StatColumn({
  icon: Icon,
  value,
  label,
  tone,
  showDivider,
}) {
  const isActive = tone === 'active'

  return (
    <div className="flex min-h-[70px] flex-1 items-start justify-center px-1">
      <div
        className={`flex h-[58px] w-full flex-col items-center ${
          showDivider
            ? isActive
              ? 'border-l border-white/25'
              : 'border-l border-slate-200'
            : ''
        }`}
      >
        <div
          className={`flex h-[31px] items-center justify-center gap-[11px] ${
            isActive ? 'text-white' : 'text-[#0B2E26]'
          }`}
        >
          <Icon className="h-[23px] w-[23px] shrink-0" />

          <span className="min-w-[1ch] text-[25px] font-medium leading-none tracking-[-0.02em] tabular-nums">
            {value}
          </span>
        </div>

        <p
          className={`mt-2 text-[14px] font-normal leading-none ${
            isActive ? 'text-white' : 'text-slate-500'
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  )
}

export default function MasterGroupCard({
  group,
  index,
  status,
  onManage,
}) {
  const stats = computeGroupStats(group)
  const isSelesai = status === 'SELESAI'
  const tone = isSelesai ? 'done' : 'active'

  const cardClass = isSelesai
    ? 'relative flex h-[406px] flex-col overflow-hidden rounded-[27px] border border-slate-200/90 bg-gradient-to-br from-white via-[#f8faf9] to-[#f1f4f3] p-[23px] text-[#0B2E26] shadow-[0_8px_28px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(15,23,42,0.1)]'
    : 'relative flex h-[406px] flex-col overflow-hidden rounded-[27px] bg-gradient-to-br from-[#02503B] via-[#04694B] to-[#02503B] p-[23px] text-white shadow-[0_10px_36px_rgba(2,80,59,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(2,80,59,0.34)]'

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cardClass}
    >
      {!isSelesai && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[72px] rounded-t-[27px] bg-gradient-to-b from-white/[0.08] to-transparent"
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <WatermarkGroup
          className={`absolute right-[22px] top-[128px] h-[84px] w-[100px] ${
            isSelesai
              ? 'text-[#013220]/[0.15]'
              : 'text-white/[0.28]'
          }`}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex shrink-0 items-center justify-between gap-3">
          <span
            className={`inline-flex h-[34px] min-w-[94px] items-center justify-center gap-[9px] rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.06em] ${
              isSelesai
                ? 'border border-slate-200 bg-slate-100 text-slate-600'
                : 'border border-emerald-300/25 bg-emerald-400/20 text-white'
            }`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                isSelesai
                  ? 'bg-slate-500'
                  : 'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.95)]'
              }`}
            />

            {status}
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[13px] font-semibold tracking-[0.06em] ${
                isSelesai
                  ? 'text-slate-500'
                  : 'text-white'
              }`}
            >
              {group.groupId}
            </span>

            <button
              type="button"
              aria-label={`Menu aksi ${group.name}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isSelesai
                  ? 'text-slate-500 hover:bg-slate-200/60'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <IconKebab className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="min-h-[95px] max-w-[205px] shrink-0">
          <h3
            className={`text-[23px] font-bold leading-[1.22] tracking-[-0.01em] ${
              isSelesai
                ? 'text-[#0B2E26]'
                : 'text-white'
            }`}
          >
            {group.name}
          </h3>
        </div>

        <p
          className={`mt-1 flex h-6 shrink-0 items-center gap-2.5 text-[15px] font-medium ${
            isSelesai
              ? 'text-slate-500'
              : 'text-white'
          }`}
        >
          <IconCalendar className="h-[18px] w-[18px] shrink-0" />

          <span>
            {group.tanggalKegiatan
              ? formatTanggalKegiatan(group.tanggalKegiatan)
              : 'Tanggal belum diatur'}
          </span>
        </p>

        <div
          className={`mt-7 shrink-0 border-t ${
            isSelesai
              ? 'border-slate-200/90'
              : 'border-white/20'
          }`}
        />

        <div className="mt-5 flex min-h-[70px] shrink-0 items-start">
          <StatColumn
            icon={IconUser}
            value={stats.total}
            label="Peserta"
            tone={tone}
            showDivider={false}
          />

          <StatColumn
            icon={IconCheckCircle}
            value={stats.hadir}
            label="Hadir"
            tone={tone}
            showDivider
          />

          <StatColumn
            icon={IconXCircle}
            value={stats.belum}
            label="Belum"
            tone={tone}
            showDivider
          />
        </div>

        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={() => onManage(group.id)}
            className={`flex h-[56px] w-full items-center rounded-[18px] px-5 transition-all duration-200 ${
              isSelesai
                ? 'border border-[rgba(1,50,32,0.12)] bg-white text-[#06251E] shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:bg-[#f8faf9]'
                : 'bg-white text-[#06251E] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-[#f7faf9]'
            }`}
          >
            <span className="flex-1 text-center text-[16px] font-semibold tracking-[0.01em]">
              Kelola Group
            </span>

            <IconChevronRight className="h-[22px] w-[22px] shrink-0 text-[#06251E]" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}