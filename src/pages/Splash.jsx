import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import logoDihatimu from '../assets/logo-dihatimu.png'
import logoSekretariat from "../assets/logo-sekretariat-dprd.png";

const SPLASH_DURATION_MS = 1800

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/landing'), SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#013220] via-[#014D2F] to-[#016241] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(45,155,106,0.21)_0%,transparent_55%)]"
      />

      <div className="relative z-10 flex w-full max-w-[340px] flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="flex items-center justify-center gap-4 rounded-[24px] border border-[rgba(212,175,55,0.25)] bg-[rgba(255,255,255,0.08)] px-5 py-3 shadow-[0_0_32px_rgba(45,155,106,0.2)] backdrop-blur-sm"
          >
            <div className="flex h-[88px] w-[120px] shrink-0 items-center justify-center">
            <img
  src={logoSekretariat}
  alt="Sekretariat DPRD"
  className="h-[82px] w-full object-contain opacity-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.22)]"
/>
            </div>
            <div
              className="h-[88px] w-px shrink-0 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent"
              aria-hidden
            />
            <div className="flex h-[110px] w-[168px] shrink-0 items-center justify-center">
              <img
                src={logoDihatimu}
                alt="DIHATIMU"
                className="h-[118px] w-full object-contain opacity-100 brightness-[1.26] contrast-[1.3] saturate-[1.14] drop-shadow-[0_2px_5px_rgba(0,0,0,0.28),0_0_18px_rgba(255,255,255,0.38)]"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="mt-5 text-center text-[2.5rem] font-extrabold leading-none tracking-tight text-white drop-shadow-[0_0_14px_rgba(45,155,106,0.3)]"
          >
            DIHATIMU
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-2.5 text-center text-[16px] font-medium leading-snug text-white/88"
          >
            Digitalisasi Kehadiran Tamu DPRD
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26 }}
            className="mt-4 text-center text-[11px] font-semibold uppercase leading-relaxed tracking-[0.15em] text-[#d4af37]"
          >
            SEKRETARIAT DPRD KABUPATEN SUBANG
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.35 }}
          className="mt-11 w-[min(200px,60vw)]"
        >
          <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#2d9b6a] via-[#3cb878] to-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.45)]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SPLASH_DURATION_MS / 1000, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
