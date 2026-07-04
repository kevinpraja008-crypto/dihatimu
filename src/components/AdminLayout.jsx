import { NavLink, useLocation } from 'react-router-dom'
import logoSekretariat from "../assets/logo-sekretariat-dprd.png";

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'home' },
  { label: 'Master Group', path: '/master-group', icon: 'users' },
  { label: 'Live Monitor', path: '/live', icon: 'monitor' },
  { label: 'Laporan', path: '/laporan', icon: 'file' },
  { label: 'Pengaturan', path: '/pengaturan', icon: 'settings' },
]

const SYSTEM_STATUS = [
  { label: 'Scanner', status: 'Aktif' },
  { label: 'Database', status: 'Normal' },
  { label: 'Realtime', status: 'Aktif' },
]

function Icon({ type }) {
  const icons = {
    home: 'M3 12l9-9 9 9M5 10v10h14V10',
    users: 'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 7a4 4 0 118 0',
    monitor: 'M4 5h16v11H4zM8 21h8M12 16v5',
    file: 'M7 3h7l5 5v13H7zM14 3v5h5',
    settings:
      'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1 .6 1.65 1.65 0 00-.33 1.82A2 2 0 0110.5 22a2 2 0 01-1.67-3.1 1.65 1.65 0 00-.6-1A1.65 1.65 0 006.4 17.6l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004 13a1.65 1.65 0 00-.6-1 1.65 1.65 0 00-1.82-.33A2 2 0 012 8.5a2 2 0 013.1-1.67 1.65 1.65 0 00.6-1A1.65 1.65 0 006.4 4.2l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 0011 2.6a1.65 1.65 0 001-.6 1.65 1.65 0 00.33-1.82A2 2 0 0115.5 2a2 2 0 011.67 3.1 1.65 1.65 0 00.6 1 1.65 1.65 0 001.82.33A2 2 0 0122 9.5a2 2 0 01-3.1 1.67 1.65 1.65 0 00-.6 1 1.65 1.65 0 00.6 1z',
  }

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.85}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[type]} />
    </svg>
  )
}

export default function AdminLayout({ children }) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="hidden w-[230px] shrink-0 flex-col overflow-hidden bg-[#031F1A] text-white shadow-[10px_0_35px_rgba(15,23,42,0.16)] lg:flex">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#16A34A]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-72 rounded-full bg-[#0F7A43]/10 blur-3xl" />

        <div className="relative px-5 pt-7 pb-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <img
            src={logoSekretariat}
            alt="Sekretariat DPRD"
            className="h-20 w-auto object-contain drop-shadow-xl"
          />
          </div>

          <div className="mt-5">
            <p className="text-[15px] font-black leading-snug tracking-wide text-white">
              SEKRETARIAT DPRD
            </p>
            <p className="text-[15px] font-black leading-snug tracking-wide text-white">
              KABUPATEN SUBANG
            </p>
            <p className="mt-2 text-xs font-medium text-white/70">
              Digital Kehadiran Tamu
            </p>
          </div>
        </div>

        <div className="relative mx-5 h-px bg-white/10" />

        <nav className="relative flex-1 space-y-1.5 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Menu
          </p>

          {NAV_ITEMS.map((item) => {
            const isActive =
            location.pathname === item.path ||
            (item.path === '/master-group' && location.pathname.startsWith('/master-group')) ||
            (item.path === '/laporan' && location.pathname.startsWith('/laporan'))

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0F7A43] to-[#166534] text-white shadow-[0_12px_26px_rgba(22,101,52,0.28)]'
                    : 'text-white/78 hover:bg-white/8 hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-[#22C55E] shadow-[0_0_16px_rgba(34,197,94,0.70)]" />
                )}

                <span className={isActive ? 'text-white' : 'text-white/65 group-hover:text-white'}>
                  <Icon type={item.icon} />
                </span>

                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="relative px-4 pb-6">
          <div className="mb-4 h-px bg-white/10" />

          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
            Status Sistem
          </p>

          <div className="space-y-2.5">
            {SYSTEM_STATUS.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-white/78">
                  <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                  {item.label}
                </div>
                <span className="font-bold text-white/90">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/8 px-3.5 py-3 ring-1 ring-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
              <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                Versi 1.0.0
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">
          {children}
        </main>
      </div>
    </div>
  )
}