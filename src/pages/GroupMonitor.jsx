import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import logoDihatimu from '../assets/logo-dihatimu.png'
import logoSekretariat from "../assets/logo-sekretariat-dprd.png";
import { computeGroupStats } from '../data/dummy'
import { findGroupById, subscribe } from '../data/masterStore'

function formatNow() {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export default function GroupMonitor() {
  const { groupId } = useParams()
  const [, setTick] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(formatNow())

  useEffect(() => subscribe(() => setTick((n) => n + 1)), [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((n) => n + 1)
      setLastUpdate(formatNow() + ' WIB')
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const group = findGroupById(groupId)

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5EE] p-6">
        <p className="text-center text-[#013220]">Group tidak ditemukan.</p>
      </div>
    )
  }

  const stats = computeGroupStats(group)
  const hadirList = group.participants.filter((p) => p.kehadiran === 'HADIR')
  const belumList = group.participants.filter((p) => p.kehadiran !== 'HADIR')

  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      <header className="border-b border-[#e8eaed] bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
          <img
  src={logoSekretariat}
  alt="Sekretariat DPRD"
  className="h-12 w-auto object-contain"
/>
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#c9a227] to-transparent" />
            <img src={logoDihatimu} alt="DIHATIMU" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#013220]">DIHATIMU</h1>
          <p className="mt-1 text-sm text-[#2a4a3a]/80">Monitor Kehadiran Tamu</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-wide text-[#b8941f]">
            {group.name}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Total Peserta', value: stats.total },
            { label: 'Sudah Hadir', value: stats.hadir },
            { label: 'Belum Hadir', value: stats.belum },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e8eaed] bg-white p-4 text-center shadow-sm"
            >
              <p className="text-xs text-muted">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#013220]">{item.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="mb-6 rounded-2xl border border-[#e8eaed] bg-white p-5 shadow-sm">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-[#013220]">
              {stats.hadir} / {stats.total}
            </span>
            <span className="font-semibold text-[#b8941f]">{stats.percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#e8eaed]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-[#014D2F] to-[#013220]"
            />
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[#e8eaed] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#013220]">
              Sudah Hadir
            </h2>
            {hadirList.length === 0 ? (
              <p className="text-sm text-muted">Belum ada peserta hadir.</p>
            ) : (
              <ul className="space-y-3">
                {hadirList.map((p) => (
                  <li key={p.id} className="flex items-start gap-3 border-b border-[#f4f5f7] pb-3 last:border-0">
                    <span className="mt-0.5 text-[#013220]">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">{p.nama}</p>
                      <p className="text-sm text-muted">{p.jabatan}</p>
                      <span className="mt-1 inline-flex rounded-full bg-[#013220]/10 px-2 py-0.5 text-xs font-semibold text-[#013220]">
                        HADIR
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-[#e8eaed] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-orange-700">
              Belum Hadir
            </h2>
            {belumList.length === 0 ? (
              <p className="text-sm text-muted">Semua peserta sudah hadir.</p>
            ) : (
              <ul className="space-y-3">
                {belumList.map((p) => (
                  <li key={p.id} className="flex items-start gap-3 border-b border-[#f4f5f7] pb-3 last:border-0">
                    <span className="mt-0.5 text-orange-500">○</span>
                    <div>
                      <p className="font-semibold text-gray-900">{p.nama}</p>
                      <p className="text-sm text-muted">{p.jabatan}</p>
                      <span className="mt-1 inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                        BELUM HADIR
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Terakhir diperbarui {lastUpdate}
        </p>
      </main>
    </div>
  )
}
