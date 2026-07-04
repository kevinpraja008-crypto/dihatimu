import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../components/AdminLayout'
import gedungDashboard from '../assets/logo-gedung-dashboard.png'
import { useMasterData } from '../context/MasterDataContext'
import {
  computeDashboardStats,
  computeGroupStats,
  getActiveGroups,
  getRecentActivity,
} from '../data/dummy'

const STAT_CONFIG = [
  { key: 'totalPeserta', label: 'Total Peserta', accent: '#0F3D2E', featured: true, icon: 'idCard' },
  { key: 'sudahHadir', label: 'Sudah Hadir', accent: '#16A34A', icon: 'checkBadge' },
  { key: 'belumHadir', label: 'Belum Hadir', accent: '#64748B', icon: 'userMinus' },
  { key: 'progress', label: 'Progress Kehadiran', accent: '#14532D', icon: 'trendUp' },
]

function Icon({ type, className = 'h-8 w-8' }) {
  const paths = {
    users: 'M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-6a4 4 0 11-8 0zm-8 0a4 4 0 11-8 0 4 4 0 018 0z',
    idCard: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M8 10h4 M8 14h8 M8 17h5 M15 9h2 M15 12h2',
    checkBadge: 'M9 12l2 2 4-4 M12 3l2.2 2.1 3-.4.8 2.9 2.6 1.5-1.2 2.8 1.2 2.8-2.6 1.5-.8 2.9-3-.4L12 21l-2.2-2.1-3 .4-.8-2.9-2.6-1.5 1.2-2.8-1.2-2.8L6 7.6l.8-2.9 3 .4L12 3z',
    userMinus: 'M15 19a6 6 0 00-12 0 M9 11a4 4 0 100-8 4 4 0 000 8z M16 11h6',
    trendUp: 'M4 17l6-6 4 4 6-8 M14 7h6v6',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    chart: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
    bell: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0',
    calendar: 'M8 7V3m8 4V3M4 11h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
    building: 'M3 21h18M5 21V8l7-4 7 4v13M9 21v-4h6v4',
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[type]} />
    </svg>
  )
}

function MiniTrend({ featured }) {
  return (
    <svg className="h-12 w-20" viewBox="0 0 90 52" fill="none">
      <path
        d="M4 42 C16 20, 25 44, 36 25 C45 9, 52 35, 62 18 C70 4, 77 22, 86 9"
        stroke={featured ? '#FFFFFF' : '#166534'}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="86" cy="9" r="4" fill={featured ? '#FFFFFF' : '#166534'} />
    </svg>
  )
}

function SummaryCard({ label, value, accent, icon, featured, delay = 0, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={
        featured
          ? 'relative min-h-[190px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0F3D2E] via-[#0B3328] to-[#031F1A] p-5 text-white shadow-[0_18px_45px_rgba(15,61,46,0.24)]'
          : 'relative min-h-[190px] overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]'
      }
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={featured ? 'text-sm font-semibold text-white/85' : 'text-sm font-semibold text-[#111827]'}>
            {label}
          </p>

          <p className={featured ? 'mt-3 text-4xl font-black tracking-tight text-white' : 'mt-3 text-4xl font-black tracking-tight text-[#0F172A]'}>
            {value}
          </p>

          <p className={featured ? 'mt-3 text-xs font-medium text-white/80' : 'mt-3 text-xs font-medium text-[#166534]'}>
            {trend}
          </p>
        </div>

        <div
          className={featured ? 'flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white' : 'flex h-14 w-14 items-center justify-center rounded-2xl'}
          style={!featured ? { background: `${accent}12`, color: accent } : undefined}
        >
          <Icon type={icon} />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <MiniTrend featured={featured} />
      </div>
    </motion.div>
  )
}

function formatDateTime(date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export default function Dashboard() {
  const { masterGroups } = useMasterData()
  const activeGroups = getActiveGroups(masterGroups)
  const stats = computeDashboardStats(masterGroups)
  const activities = getRecentActivity(masterGroups)

  const instansiTerbanyak = activeGroups
    .map((group) => ({
      name: group.name,
      total: group.participants.length,
    }))
    .sort((a, b) => b.total - a.total)
   
  const maxInstansi =
    instansiTerbanyak.length > 0
      ? instansiTerbanyak[0].total
      : 1

  const [now, setNow] = useState(() => new Date())

  const progress =
    stats.totalPeserta > 0
      ? Math.round((stats.sudahHadir / stats.totalPeserta) * 100)
      : 0

  const statValues = {
    ...stats,
    progress: `${progress}%`,
  }

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <Icon type="calendar" className="h-6 w-6 text-[#0F172A]" />

            <div>
              <p className="text-xs font-medium capitalize text-[#64748B]">
                {formatDateTime(now)}
              </p>

              <p className="font-mono text-2xl font-black tabular-nums text-[#0F172A]">
                {formatTime(now)} <span className="text-sm font-semibold">WIB</span>
              </p>
            </div>
          </div>

          <div className="relative grid h-[58px] w-[58px] place-items-center rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <Icon type="bell" className="h-6 w-6 text-[#0F172A]" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#0F172A] text-sm font-black text-white">
              A
            </div>

            <div>
              <p className="text-sm font-bold text-[#0F172A]">
                Admin Sekretariat
              </p>
              <p className="text-xs text-[#64748B]">
                Super Admin
              </p>
            </div>
          </div>
        </div>

        <motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
>
  <div
    className="absolute inset-0 bg-cover bg-[center_40%]"
    style={{ backgroundImage: `url(${gedungDashboard})` }}
  />

  <div
    className="absolute inset-0"
    style={{
      background:
        'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 28%, rgba(255,255,255,0.72) 42%, rgba(255,255,255,0.24) 58%, rgba(255,255,255,0) 72%)',
    }}
  />

  <div className="relative flex min-h-[300px] items-center px-10 sm:px-12">
    <div className="max-w-[520px]">
      <p className="text-xl font-medium text-[#111827]">
        Selamat Datang
      </p>

      <h1 className="mt-3 -mr-8 bg-gradient-to-r from-[#031F1A] via-[#0F3D2E] to-[#168044] bg-clip-text text-6xl font-black leading-none tracking-[-0.06em] text-transparent sm:text-7xl">
        DIHATIMU
      </h1>

      <p className="mt-4 text-2xl font-medium text-[#1F2937]">
        Digitalisasi Kehadiran Tamu
      </p>

      <div className="mt-6 h-1 w-14 rounded-full bg-[#166534]" />
    </div>
  </div>
</motion.div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CONFIG.map((cfg, i) => (
            <SummaryCard
              key={cfg.key}
              label={cfg.label}
              value={statValues[cfg.key]}
              accent={cfg.accent}
              icon={cfg.icon}
              featured={cfg.featured}
              delay={i * 0.05}
              trend={
                cfg.key === 'totalPeserta'
                  ? '↑ 15% dari kegiatan sebelumnya'
                  : cfg.key === 'sudahHadir'
                    ? '↑ 18% dari kegiatan sebelumnya'
                    : cfg.key === 'belumHadir'
                      ? '↓ 5% dari kegiatan sebelumnya'
                      : '↑ 12% dari kegiatan sebelumnya'
              }
            />
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-12">
  <section className="xl:col-span-4">
    <h2 className="mb-4 text-base font-bold text-[#0F172A]">
      Statistik Kehadiran 7 Hari Terakhir
    </h2>

    <div className="h-[330px] rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      <div className="flex h-full items-end justify-between gap-4">
        {[
          ['Sab', 70],
          ['Min', 65],
          ['Sen', 78],
          ['Sel', 84],
          ['Rab', 90],
          ['Kam', 76],
          ['Hari Ini', progress],
        ].map(([day, value]) => (
          <div key={day} className="flex flex-1 flex-col items-center gap-3">
            <span className="text-xs font-semibold text-[#0F172A]">
              {value}%
            </span>

            <div className="flex h-32 w-full max-w-[34px] items-end rounded-full bg-[#E8F1EC]">
              <div
                className={
                  day === 'Hari Ini'
                    ? 'w-full rounded-full bg-gradient-to-b from-[#166534] to-[#06281F]'
                    : 'w-full rounded-full bg-[#DCE8E2]'
                }
                style={{ height: `${value}%` }}
              />
            </div>

            <span className="text-xs text-[#475569]">
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section className="xl:col-span-4">
    <h2 className="mb-4 text-base font-bold text-[#0F172A]">
      Kegiatan Aktif Hari Ini
    </h2>

    <div className="h-[330px] rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      {activeGroups.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          Belum ada group aktif.
        </p>
      ) : (
        <div className="h-full space-y-4 overflow-y-auto pr-2">
          {activeGroups.map((group) => {
            const g = computeGroupStats(group)
            const pct = g.total > 0 ? Math.round((g.hadir / g.total) * 100) : 0

            return (
              <div
                key={group.id}
                className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] p-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ECFDF5] text-[#166534]">
                  <Icon type="users" className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#0F172A]">
                    {group.name}
                  </p>

                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {g.total} Peserta • {g.hadir} Hadir
                  </p>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0F3D2E] to-[#166534]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <p className="w-12 text-right text-sm font-bold text-[#0F172A]">
                  {pct}%
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  </section>

  <section className="xl:col-span-4">
    <h2 className="mb-4 text-base font-bold text-[#0F172A]">
      Ringkasan Kehadiran Hari Ini
    </h2>

    <div className="h-[330px] rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-center">
        <div
          className="relative grid h-40 w-40 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#0F3D2E 0 ${progress}%, #DDE9E3 ${progress}% 100%)`,
          }}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-3xl font-black text-[#0F172A]">
                {progress}%
              </p>
              <p className="text-sm font-semibold text-[#166534]">
                Hadir
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[#475569]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0F3D2E]" />
            Hadir
          </span>
          <span className="font-bold text-[#0F172A]">{stats.sudahHadir}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[#475569]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DDE9E3]" />
            Belum Hadir
          </span>
          <span className="font-bold text-[#0F172A]">{stats.belumHadir}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[#F0FDF4] p-3 ring-1 ring-[#DCFCE7]">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white">
            <svg className="h-5 w-5 text-[#166534]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-bold text-[#166534]">
              Kehadiran lebih tinggi 12%
            </p>
            <p className="text-xs text-[#64748B]">
              dibandingkan kegiatan sebelumnya
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<div className="grid gap-6 lg:grid-cols-5">
  <section className="lg:col-span-2">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold text-[#0F172A]">
        Aktivitas Terbaru
      </h2>

      <button className="rounded-xl bg-[#F1F5F9] px-3 py-1.5 text-xs font-bold text-[#334155]">
        Lihat Semua
      </button>
    </div>

    <div className="h-[330px] overflow-y-auto rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      {activities.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          Belum ada kehadiran tercatat.
        </p>
      ) : (
        <div className="space-y-4 pr-2">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center gap-3">
              {act.foto ? (
                <img
                  src={act.foto}
                  alt={act.nama}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#166534] text-xs font-bold text-white">
                  {initials(act.nama)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#0F172A]">
                  {act.nama}
                </p>
                <p className="text-xs text-[#64748B]">
                  {act.jabatan || 'Tamu DPRD'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-[#166534]">
                  {act.time} WIB
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Telah Hadir
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>

  <section className="lg:col-span-3">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold text-[#0F172A]">
        Instansi Terbanyak Hari Ini
      </h2>
    </div>

    <div className="h-[330px] overflow-y-auto rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      {instansiTerbanyak.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          Belum ada data instansi.
        </p>
      ) : (
        <div className="space-y-4 pr-2">
          {instansiTerbanyak.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-[auto_1fr_2fr_auto] items-center gap-4"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0F3D2E] to-[#166534] text-white shadow-sm">
                <Icon type="building" className="h-4 w-4" />
              </div>

              <p className="truncate text-sm font-medium text-[#0F172A]">
                {item.name}
              </p>

              <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0F3D2E] to-[#166534]"
                  style={{
                    width: `${(item.total / maxInstansi) * 100}%`,
                  }}
                />
              </div>

              <p className="text-sm font-bold text-[#0F172A]">
                {item.total}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
        </div>
      </div>
    </AdminLayout>
  )
}