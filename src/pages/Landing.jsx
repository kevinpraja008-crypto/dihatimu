import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import logoDihatimu from '../assets/logo-dihatimu.png'
import logoSekretariat from "../assets/logo-sekretariat-dprd.png";
import gedungDprd from '../assets/logo-gedung-line-art.png'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const logoSekretariatClass =
  'object-contain opacity-100 contrast-[1.08] drop-shadow-[0_2px_5px_rgba(1,50,32,0.1)]'

const logoDihatimuClass =
  'object-contain opacity-100 brightness-[1.06] contrast-[1.16] saturate-[1.1] drop-shadow-[0_1px_4px_rgba(1,50,32,0.12)]'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[100dvh] justify-center bg-[#F8F5EE]">
      <div className="flex min-h-[100dvh] w-full max-w-[430px] flex-col">
        <main className="flex min-h-[100dvh] flex-1 flex-col justify-center overflow-y-auto px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex w-full max-w-[400px] -translate-y-[6%] flex-col items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="mb-5 inline-flex w-auto items-center justify-center gap-2.5 rounded-[18px] border border-[rgba(212,175,55,0.35)] bg-white/60 px-3 py-2.5 shadow-[0_4px_14px_rgba(1,50,32,0.07)] backdrop-blur-sm"
            >
              <img
                src={logoSekretariat}
                alt="Sekretariat DPRD"
                className={`h-[66px] w-auto max-w-[122px] ${logoSekretariatClass}`}
              />
              <div
                className="h-[54px] w-px shrink-0 bg-gradient-to-b from-transparent via-[#c9a227]/90 to-transparent"
                aria-hidden
              />
              <img
                src={logoDihatimu}
                alt="DIHATIMU"
                className={`h-[80px] w-auto max-w-[172px] ${logoDihatimuClass}`}
              />
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-[2rem] font-bold tracking-tight text-[#013220]"
            >
              DIHATIMU
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-2 text-[15px] leading-relaxed text-[#2a4a3a]/80"
            >
              Digitalisasi Kehadiran Tamu DPRD
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mt-3.5 text-[11px] font-semibold uppercase leading-relaxed tracking-[0.14em] text-[#b8941f]"
            >
              SEKRETARIAT DPRD KABUPATEN SUBANG
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.34 }}
              className="relative -mb-1 mt-2.5 flex w-full justify-center"
            >
              <img
                src={gedungDprd}
                alt=""
                aria-hidden
                className="w-[94%] origin-bottom scale-[1.17] object-contain opacity-20 [mask-image:linear-gradient(to_bottom,black_48%,transparent_100%)]"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-b from-transparent via-[#F8F5EE]/55 to-[#F8F5EE]"
                aria-hidden
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1.5 flex w-full justify-center"
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate('/scanner')}
                className="h-14 w-[88%] rounded-2xl bg-gradient-to-b from-[#014D2F] to-[#013220] text-center text-[15px] font-bold tracking-[0.05em] text-white shadow-[0_8px_24px_rgba(1,50,32,0.22)] active:opacity-95"
              >
                MULAI SCAN
              </motion.button>
            </motion.div>

            <motion.footer
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.46 }}
              className="mt-3 w-full"
            >
              <p className="text-[10px] font-semibold tracking-wide text-[#013220]/55">
                Sistem Resmi & Terpercaya
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-[#2a4a3a]/45">
                Dikelola oleh Sekretariat DPRD Kabupaten Subang
              </p>
            </motion.footer>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
