import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useMasterData } from '../context/MasterDataContext'
import logoDihatimu from '../assets/logo-dihatimu.png'
import logoSekretariat from "../assets/logo-sekretariat-dprd.png";
import {
  exportBackup,
  getSettings,
  restoreBackup,
  subscribe,
  updateLiveMonitorSettings,
  updateSettings,
} from '../data/settingsStore'

function SectionCard({ icon, title, description, children }) {
  return (
    <section className="admin-card overflow-hidden">
      <div className="border-b border-[rgba(1,50,32,0.08)] bg-gradient-to-r from-[#013220]/6 via-[#013220]/3 to-transparent px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#013220]/12 to-[#d4af37]/10 text-[#013220] ring-1 ring-[rgba(1,50,32,0.08)]">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0B2E26]">{title}</h2>
            {description && (
              <p className="text-xs text-muted">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

export default function Pengaturan() {
  const { setMasterGroups } = useMasterData()
  const [, setTick] = useState(0)
  const [settings, setLocalSettings] = useState(getSettings())
  const [restoreMsg, setRestoreMsg] = useState('')

  useEffect(() => subscribe(() => {
    setTick((n) => n + 1)
    setLocalSettings(getSettings())
  }), [])

  function handleRestore(e) {
    const file = e.target.files?.[0]
    if (!file) return
    restoreBackup(file)
      .then((data) => {
        if (data.masterGroups) setMasterGroups(data.masterGroups)
        setRestoreMsg('Backup berhasil dipulihkan.')
      })
      .catch(() => setRestoreMsg('Gagal memulihkan backup.'))
    e.target.value = ''
  }

  return (
    <AdminLayout title="Pengaturan" subtitle="Konfigurasi sistem DIHATIMU">
      <div className="mx-auto max-w-3xl space-y-6">
        <SectionCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          title="Identitas Sistem"
          description="Logo dan nama instansi resmi"
        >
          <div className="mb-5 flex items-center gap-5 rounded-xl border border-[rgba(1,50,32,0.08)] bg-[#F5F7F9] p-5">
            <img src={logoSekretariat} alt="Sekretariat DPRD" className="h-16 w-auto object-contain" />
            <div className="h-12 w-px bg-[rgba(1,50,32,0.12)]" />
            <img src={logoDihatimu} alt="DIHATIMU" className="h-20 w-auto object-contain" />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Nama Instansi</span>
            <input
              value={settings.namaInstansi}
              onChange={(e) => updateSettings({ namaInstansi: e.target.value })}
              className="admin-input"
            />
          </label>
          <p className="mt-3 text-xs text-muted">
            Logo Sekretariat DPRD dan DIHATIMU menggunakan asset resmi sistem.
          </p>
        </SectionCard>

        <SectionCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="Live Monitor"
          description="Pengaturan tampilan monitor kehadiran"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Durasi Tampil (detik)
              </span>
              <input
                type="number"
                min={3}
                max={30}
                value={settings.liveMonitor.displayDuration}
                onChange={(e) =>
                  updateLiveMonitorSettings({ displayDuration: Number(e.target.value) })
                }
                className="admin-input"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-[#e8eaed] bg-soft-gray px-4 py-3">
              <input
                type="checkbox"
                checked={settings.liveMonitor.animationEnabled}
                onChange={(e) =>
                  updateLiveMonitorSettings({ animationEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-[#e8eaed] text-[#013220]"
              />
              <span className="text-sm text-gray-700">Aktifkan animasi pergantian data</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-[#e8eaed] bg-soft-gray px-4 py-3">
              <input
                type="checkbox"
                checked={settings.liveMonitor.soundEnabled}
                onChange={(e) =>
                  updateLiveMonitorSettings({ soundEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-[#e8eaed] text-[#013220]"
              />
              <span className="text-sm text-gray-700">Aktifkan notifikasi suara</span>
            </label>
          </div>
        </SectionCard>

        <SectionCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
          title="Backup Data"
          description="Ekspor dan pulihkan data sistem"
        >
          <p className="mb-4 text-sm text-muted">
            Ekspor seluruh data group, peserta, dan pengaturan sistem.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={exportBackup} className="admin-btn-primary">
              EXPORT BACKUP
            </button>
            <label className="admin-btn-secondary cursor-pointer">
              RESTORE BACKUP
              <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
            </label>
          </div>
          {restoreMsg && (
            <p className="mt-3 rounded-lg bg-[#013220]/5 px-4 py-2.5 text-sm text-[#013220]">
              {restoreMsg}
            </p>
          )}
        </SectionCard>

        <SectionCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Informasi Sistem"
          description="Detail versi dan status aplikasi"
        >
          <div className="space-y-3">
            {[
              { label: 'Nama Aplikasi', value: 'DIHATIMU' },
              { label: 'Versi', value: '1.0.0' },
              { label: 'Instansi', value: 'Sekretariat DPRD Kabupaten Subang' },
              { label: 'Platform', value: 'Admin Desktop' },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-[#e8eaed] bg-soft-gray px-4 py-3"
              >
                <span className="text-sm text-muted">{row.label}</span>
                <span className="text-sm font-semibold text-[#013220]">{row.value}</span>
              </div>
            ))}
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Scanner', status: 'Aktif' },
                { label: 'Live Monitor', status: 'Aktif' },
                { label: 'Database', status: 'Normal' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-[rgba(1,50,32,0.08)] bg-[#F5F7F9] px-3 py-3"
                >
                  <span className="text-xs text-muted">{item.label}</span>
                  <span className="status-badge status-badge-ok !text-[10px]">
                    <span className="dot" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </AdminLayout>
  )
}
