import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import gedungDprd from '../assets/logo-gedung-line-art.png'
import logoSekretariat from "../assets/logo-sekretariat-dprd.png";
import { computeGroupStats, formatTanggalKegiatan } from '../data/dummy'
import { buildMonitorUrl } from '../data/qrService'

export default function MonitorQrModal({ group, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const monitorUrl = buildMonitorUrl(group.id)
  const stats = computeGroupStats(group)

  useEffect(() => {
    QRCode.toDataURL(monitorUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#013220', light: '#FFFFFF' },
    }).then(setQrDataUrl)
  }, [monitorUrl])

  async function handleCopy() {
    await navigator.clipboard.writeText(monitorUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="modal-backdrop absolute inset-0"
        aria-label="Tutup"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="modal-premium relative z-10 w-full max-w-lg overflow-hidden p-0"
      >
        <div className="relative bg-gradient-to-br from-[#013220] via-[#014D2F] to-[#011a10] px-6 py-5 text-white">
          <img
            src={gedungDprd}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 h-full w-2/3 object-contain object-bottom opacity-[0.06]"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d4af37]">
                QR Monitor Resmi
              </p>
              <h3 className="mt-1 text-lg font-bold">{group.name}</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/75">
                {group.tanggalKegiatan && (
                  <span>{formatTanggalKegiatan(group.tanggalKegiatan)}</span>
                )}
                <span>{stats.total} Peserta</span>
                <span className="status-badge status-badge-ok !bg-emerald-500/15 !text-emerald-100">
                  <span className="dot" />
                  Aktif
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-white/60 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="relative bg-[#F5F7F9] px-6 py-6">
          <div className="mb-4 flex items-center justify-center gap-3">
            <img src={logoDprd} alt="DPRD" className="h-10 w-auto object-contain opacity-80" />
            <div className="h-8 w-px bg-[rgba(1,50,32,0.12)]" />
            <p className="text-xs font-bold uppercase tracking-wide text-[#013220]">Monitor Kehadiran</p>
          </div>

          <div className="mb-4 flex justify-center rounded-xl border border-[rgba(1,50,32,0.08)] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Monitor Group" className="h-64 w-64 rounded-lg" />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center text-sm text-muted">
                Memuat QR...
              </div>
            )}
          </div>

          <p className="mb-3 text-center text-xs text-muted">
            Scan untuk membuka Monitor Kehadiran (read-only)
          </p>

          <div className="mb-4 flex gap-2">
            <input
              readOnly
              value={monitorUrl}
              className="admin-input min-w-0 flex-1 !py-2 text-xs text-[#0B2E26]"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="admin-btn-secondary shrink-0 !px-3 !py-2 !text-xs"
            >
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>

          <a
            href={monitorUrl}
            target="_blank"
            rel="noreferrer"
            className="admin-btn-primary block w-full py-3 text-center"
          >
            BUKA MONITOR
          </a>
        </div>
      </motion.div>
    </div>
  )
}
