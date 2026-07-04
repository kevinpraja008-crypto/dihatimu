import { motion } from 'framer-motion'
import gedungDprd from "../assets/logo-gedung-line-art.png";

const easePremium = [0.22, 1, 0.36, 1]

function PhotoArea({ foto, nama }) {
  if (foto) {
    return <img src={foto} alt={nama} className="h-full w-full object-cover" />
  }

  const initials = nama
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#013220] via-[#014D2F] to-[#011a10]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,55,0.12)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(248,245,238,0.06)_0%,transparent_50%)]" />
      <div className="absolute inset-6 rounded-2xl border border-[#d4af37]/20" />
      <span className="relative text-[clamp(4rem,12vw,9rem)] font-bold tracking-wider text-[#d4af37]/35">
        {initials}
      </span>
    </div>
  )
}

function ProgressBar({ hadir, total }) {
  const percent = total > 0 ? (hadir / total) * 100 : 0

  return (
    <div className="mt-5 w-full max-w-xs">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F8F5EE]/50">
          Progress Kehadiran
        </span>
        <span className="font-mono text-sm font-bold text-[#d4af37]">
          {hadir} / {total} HADIR
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#F8F5EE]/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: easePremium, delay: 0.35 }}
          className="h-full rounded-full bg-gradient-to-r from-[#d4af37]/70 to-[#e8c84a]"
        />
      </div>
    </div>
  )
}

export default function LiveDisplay({ checkIn, groupStats, instansi }) {
  if (!checkIn) return null

  return (
    <motion.div
      key={checkIn.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex h-full w-full items-stretch gap-0 px-5 py-4 sm:px-8 sm:py-5 xl:px-10"
    >
      {/* KIRI 60% — Foto */}
      <motion.div
        initial={{ opacity: 0, x: -80, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -48, scale: 0.97 }}
        transition={{ duration: 0.65, ease: easePremium }}
        className="relative w-[60%] shrink-0 pr-4 sm:pr-6"
      >
        <div className="h-full overflow-hidden rounded-2xl border border-[#d4af37]/35 shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_0_1px_rgba(212,175,55,0.08)_inset] sm:rounded-3xl">
          <PhotoArea foto={checkIn.foto} nama={checkIn.nama} />
        </div>
      </motion.div>

      {/* KANAN 40% — Data */}
      <motion.div
        initial={{ opacity: 0, x: 80, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 48, scale: 0.97 }}
        transition={{ duration: 0.65, ease: easePremium, delay: 0.06 }}
        className="relative flex w-[40%] shrink-0 flex-col justify-center overflow-hidden pl-2 sm:pl-4"
      >
        <motion.img
          src={gedungDprd}
          alt=""
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.05,
            y: [0, -12, 0],
          }}
          transition={{
            opacity: { duration: 0.8 },
            y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="pointer-events-none absolute bottom-[-5%] right-[-8%] h-[85%] w-[110%] object-contain object-bottom"
        />

        <div className="relative z-10 flex flex-col justify-center py-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easePremium, delay: 0.15 }}
            className="text-sm font-bold uppercase tracking-[0.28em] text-[#d4af37] sm:text-base"
          >
            Selamat Datang
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easePremium, delay: 0.22 }}
            className="mt-3 text-[clamp(1.75rem,4.5vw,3.75rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-[#F8F5EE]"
          >
            {checkIn.nama}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easePremium, delay: 0.3 }}
            className="mt-4 text-lg font-medium text-[#F8F5EE]/75 sm:text-xl"
          >
            {checkIn.jabatan}
          </motion.p>

          {instansi && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easePremium, delay: 0.33 }}
              className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#F8F5EE]/55 sm:text-base"
            >
              {instansi}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easePremium, delay: 0.36 }}
            className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-[#d4af37]/85 sm:text-base"
          >
            {checkIn.groupName}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easePremium, delay: 0.42 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[#d4af37]/30 bg-[#014D2F]/60 px-5 py-2.5 shadow-sm backdrop-blur-sm">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  scale: {
                    type: 'spring',
                    stiffness: 420,
                    damping: 14,
                    delay: 0.55,
                    repeat: Infinity,
                    repeatDelay: 2,
                  },
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-[#013220]"
              >
                ✓
              </motion.span>
              <span className="text-sm font-bold uppercase tracking-wider text-[#F8F5EE]">
                Hadir
              </span>
            </span>
            <span className="font-mono text-base font-semibold text-[#F8F5EE]/80 sm:text-lg">
              Jam Hadir: {checkIn.time}
            </span>
          </motion.div>

          {groupStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easePremium, delay: 0.48 }}
            >
              <ProgressBar hadir={groupStats.hadir} total={groupStats.total} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function LiveStandby({ now, dateLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: easePremium }}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-center"
    >
      <motion.img
        src={gedungDprd}
        alt=""
        aria-hidden
        animate={{ opacity: 0.04, y: [0, -12, 0] }}
        transition={{
          opacity: { duration: 1 },
          y: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="pointer-events-none absolute bottom-0 left-1/2 h-[70%] w-auto max-w-3xl -translate-x-1/2 object-contain"
      />

      <div className="relative z-10">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#d4af37]">
          Menunggu Data Kehadiran
        </p>
        <p className="mt-6 text-base text-[#F8F5EE]/55 sm:text-lg">{dateLabel}</p>
        <p className="mt-3 font-mono text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight text-[#F8F5EE]">
          {now}
        </p>
        <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
      </div>
    </motion.div>
  )
}
