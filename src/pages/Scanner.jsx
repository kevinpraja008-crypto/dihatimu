import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QrCameraScanner from '../components/QrCameraScanner'
import ScannerErrorBoundary from '../components/ScannerErrorBoundary'
import ScannerFrame from '../components/ScannerFrame'
import { useMasterData } from '../context/MasterDataContext'
import * as store from '../data/masterStore'
import { buildReviewState, resolveQrScan } from '../data/scannerService'

const CAMERA_FAIL_MSG =
  'Kamera belum dapat diaktifkan. Periksa izin kamera atau refresh halaman.'

function vibrateScan() {
  try {
    navigator.vibrate?.(50)
  } catch {
    /* tidak didukung */
  }
}

export default function Scanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshMasterGroups } = useMasterData()

  const [scannerKey, setScannerKey] = useState(0)
  const [cameraActive, setCameraActive] = useState(true)
  const [cameraStatus, setCameraStatus] = useState('Meminta izin kamera...')
  const [scanError, setScanError] = useState(location.state?.error || '')
  const [scanNotice, setScanNotice] = useState('')

  const restartScanner = useCallback(() => {
    setScanError('')
    setScanNotice('')
    setCameraActive(true)
    setCameraStatus('Memuat kamera...')
    setScannerKey((k) => k + 1)
  }, [])

  const handleDecode = useCallback(
    async (decodedText) => {
      console.log('QR TERBACA RAW:', decodedText)

      setCameraActive(false)
      setCameraStatus('QR terbaca, mengambil data terbaru...')

      try {
        await refreshMasterGroups()

        const latestGroups = store.getMasterGroups()
        const result = resolveQrScan(latestGroups, decodedText)

        if (!result.ok) {
          setScanError(result.error)
          setTimeout(restartScanner, 2500)
          return
        }

        vibrateScan()

        if (result.alreadyHadir) {
          setScanNotice('Peserta sudah tercatat hadir.')
        }

        setTimeout(() => {
          navigate('/review', {
            state: buildReviewState({
              group: result.group,
              participant: result.participant,
              source: result.source,
            }),
          })
        }, result.alreadyHadir ? 600 : 0)
      } catch (err) {
        console.error('[DIHATIMU] Gagal refresh data saat scan:', err)
        setScanError('Gagal mengambil data terbaru. Periksa koneksi internet.')
        setTimeout(restartScanner, 2500)
      }
    },
    [refreshMasterGroups, navigate, restartScanner],
  )

  const handleCameraReady = useCallback(() => {
    setCameraStatus('Kamera aktif — siap scan')
    setScanError('')
  }, [])

  const handleCameraError = useCallback(() => {
    setCameraActive(false)
    setCameraStatus('Kamera tidak dapat diakses')
    setScanError(CAMERA_FAIL_MSG)
  }, [])

  const handleScannerCrash = useCallback(() => {
    setCameraActive(false)
    setCameraStatus('Kamera tidak dapat diakses')
    setScanError(CAMERA_FAIL_MSG)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white">
      <header className="safe-area-inset-top relative z-20 flex items-center justify-between px-3 py-3">
        <button
          type="button"
          onClick={() => navigate('/landing')}
          className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
        >
          ← Kembali
        </button>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            DIHATIMU
          </p>
          <p className="text-xs font-medium text-white/80">Scanner Kehadiran</p>
        </div>
        <div className="w-16" />
      </header>

      <main className="relative min-h-0 flex-1 bg-black">
        {cameraActive && (
          <ScannerErrorBoundary
            onError={handleScannerCrash}
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
                <p className="text-center text-sm text-red-300">{CAMERA_FAIL_MSG}</p>
                <button
                  type="button"
                  onClick={restartScanner}
                  className="mt-4 text-xs text-white/80 underline"
                >
                  Coba lagi
                </button>
              </div>
            }
          >
            <QrCameraScanner
              key={scannerKey}
              active={cameraActive}
              onDecode={handleDecode}
              onCameraReady={handleCameraReady}
              onCameraError={handleCameraError}
            />
          </ScannerErrorBoundary>
        )}

        {!cameraActive && scanError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6">
            <p className="text-center text-sm font-medium text-red-300">{scanError}</p>
            <button
              type="button"
              onClick={restartScanner}
              className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!cameraActive && !scanError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <p className="text-sm text-white/60">QR terbaca, memproses...</p>
          </div>
        )}

        {cameraActive && !scanError && <ScannerFrame scanning status={cameraStatus} />}

        {(scanError || scanNotice) && (
          <div className="absolute bottom-28 left-4 right-4 z-20 space-y-2">
            {scanNotice && (
              <p className="rounded-xl bg-amber-500/90 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
                {scanNotice}
              </p>
            )}
            {scanError && (
              <div className="rounded-xl bg-red-600/90 px-4 py-3 text-center shadow-lg">
                <p className="text-sm font-semibold text-white">{scanError}</p>
                {!cameraActive && (
                  <button
                    type="button"
                    onClick={restartScanner}
                    className="mt-2 text-xs font-medium text-white/90 underline"
                  >
                    Coba lagi
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="safe-area-inset-bottom relative z-20 px-4 py-4 text-center">
        <p className="text-[11px] text-white/45">
          Scan QR peserta dari Master Group DIHATIMU
        </p>
      </footer>
    </div>
  )
}