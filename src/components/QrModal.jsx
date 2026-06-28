import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { buildQrFilename, downloadQrPng, generatePremiumQrCard } from '../data/qrService'

export default function QrModal({ participant, group, onClose }) {
  const [cardDataUrl, setCardDataUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    generatePremiumQrCard({ participant, group })
      .then((url) => {
        if (active) setCardDataUrl(url)
      })
      .catch(() => {
        if (active) setError('Gagal memuat QR Code.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [participant, group])

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadQrPng(participant, group, buildQrFilename(participant.nama))
    } catch {
      setError('Gagal mengunduh QR Code.')
    } finally {
      setDownloading(false)
    }
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
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="modal-premium relative z-10 w-full max-w-[460px] p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-[rgba(1,50,32,0.08)] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d4af37]">
              Digital Attendance Pass
            </p>
            <h3 className="text-lg font-bold text-[#0B2E26]">QR Peserta</h3>
            <p className="text-xs text-muted">{participant.nama}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-[#F5F7F9]"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 flex justify-center rounded-xl border border-[rgba(1,50,32,0.08)] bg-[#F5F7F9] p-4 shadow-inner">
          {loading && (
            <div className="flex h-[520px] w-full max-w-[360px] items-center justify-center text-sm text-muted">
              Memuat pass digital...
            </div>
          )}
          {!loading && error && (
            <div className="flex h-[520px] w-full max-w-[360px] items-center justify-center text-center text-sm text-red-600">
              {error}
            </div>
          )}
          {!loading && !error && cardDataUrl && (
            <img
              src={cardDataUrl}
              alt={`QR Kehadiran ${participant.nama}`}
              className="h-auto w-full max-w-[360px] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            />
          )}
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {['VERIFIED', 'SECURE QR', 'AKTIF'].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/8 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#8a6d12]"
            >
              {badge}
            </span>
          ))}
        </div>

        <p className="mb-4 text-center text-xs text-muted">
          Pass digital siap dikirim melalui WhatsApp kepada{' '}
          <strong className="text-[#0B2E26]">{participant.nama}</strong>
        </p>

        <button
          type="button"
          disabled={loading || !!error || downloading}
          onClick={handleDownload}
          className="admin-btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? 'MENGUNDUH...' : 'DOWNLOAD PNG'}
        </button>
      </motion.div>
    </div>
  )
}
