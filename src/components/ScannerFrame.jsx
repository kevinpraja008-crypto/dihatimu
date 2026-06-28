import { motion } from 'framer-motion'

export default function ScannerFrame({ scanning = true, status }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      <div className="absolute inset-[12%] sm:inset-[15%]">
        <div className="relative h-full w-full">
          <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-emerald-400" />
          <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-emerald-400" />
          <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-emerald-400" />
          <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-emerald-400" />

          {scanning && (
            <motion.div
              className="absolute left-1 right-1 h-0.5 bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]"
              animate={{ top: ['8%', '92%', '8%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </div>

      <p className="absolute bottom-[18%] left-0 right-0 px-6 text-center text-sm font-medium text-white/90">
        Arahkan QR peserta ke dalam bingkai
      </p>

      {status && (
        <p className="absolute bottom-[10%] left-0 right-0 px-6 text-center text-xs text-emerald-300">
          {status}
        </p>
      )}
    </div>
  )
}
