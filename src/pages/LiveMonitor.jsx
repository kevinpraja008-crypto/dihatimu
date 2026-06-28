import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import logoDihatimu from '../assets/logo-dihatimu.png'
import logoDprd from '../assets/logo-dprd.png'
import LiveDisplay, { LiveStandby } from '../components/LiveDisplay'
import { computeGroupStats, getLatestCheckIn } from '../data/dummy'
import { getMasterGroups, subscribe } from '../data/masterStore'

function formatClock() {
  return (
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' WIB'
  )
}

function formatDate() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function playCheckInSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(784, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.7)
  } catch {
    /* audio tidak tersedia */
  }
}

export default function LiveMonitor() {
  const [, setTick] = useState(0)
  const [clock, setClock] = useState(formatClock())
  const prevCheckInId = useRef(null)

  useEffect(() => subscribe(() => setTick((n) => n + 1)), [])

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock()), 1000)
    return () => clearInterval(timer)
  }, [])

  const masterGroups = getMasterGroups()
  const latest = getLatestCheckIn(masterGroups)

  const groupStats = useMemo(() => {
    if (!latest) return null
    const group = masterGroups.find((g) => g.id === latest.groupId)
    return group ? computeGroupStats(group) : null
  }, [latest, masterGroups])

  const instansi = useMemo(() => {
    if (!latest) return null
    const group = masterGroups.find((g) => g.id === latest.groupId)
    return group?.instansi || null
  }, [latest, masterGroups])

  useEffect(() => {
    if (!latest?.id) return
    if (prevCheckInId.current && prevCheckInId.current !== latest.id) {
      playCheckInSound()
    }
    prevCheckInId.current = latest.id
  }, [latest?.id])

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#011a10]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#013220] via-[#012818] to-[#011a10]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(248,245,238,0.07)_0%,transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_100%,rgba(212,175,55,0.05)_0%,transparent_40%)]" />

      <header className="relative z-10 shrink-0 border-b border-[#d4af37]/15 bg-[#013220]/80 px-5 py-2.5 backdrop-blur-sm sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img
              src={logoDprd}
              alt="DPRD"
              className="h-9 w-auto shrink-0 object-contain sm:h-10"
            />
            <div className="h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#d4af37]/60 to-transparent" />
            <img
              src={logoDihatimu}
              alt="DIHATIMU"
              className="h-10 w-auto shrink-0 object-contain sm:h-11"
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold tracking-tight text-[#F8F5EE] sm:text-lg">
                DIHATIMU
              </h1>
              <p className="truncate text-[0.65rem] text-[#F8F5EE]/55 sm:text-xs">
                Digitalisasi Kehadiran Tamu DPRD
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#014D2F]/50 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[#d4af37]/50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4af37]" />
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#d4af37]">
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {latest ? (
            <LiveDisplay key={latest.id} checkIn={latest} groupStats={groupStats} instansi={instansi} />
          ) : (
            <LiveStandby key="standby" now={clock} dateLabel={formatDate()} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
