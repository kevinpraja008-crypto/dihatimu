import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'
import QrCameraScanner from '../components/QrCameraScanner'
import ScannerErrorBoundary from '../components/ScannerErrorBoundary'
import ScannerFrame from '../components/ScannerFrame'
import { parseQrPayload } from '../data/scannerService'
import {
  beginPublicParticipantCheckIn,
} from '../data/publicScannerService'

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

  const [scannerKey, setScannerKey] =
    useState(0)

  const [
    cameraActive,
    setCameraActive,
  ] = useState(true)

  const [
    cameraStatus,
    setCameraStatus,
  ] = useState(
    'Meminta izin kamera...',
  )

  const [
    scanError,
    setScanError,
  ] = useState(
    location.state?.error || '',
  )

  const [
    scanNotice,
    setScanNotice,
  ] = useState('')

  const [
    scanSuccess,
    setScanSuccess,
  ] = useState(
    location.state?.success || '',
  )

  useEffect(() => {
    if (!location.state?.success) {
      return
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    })
  }, [
    location.pathname,
    location.state?.success,
    navigate,
  ])

  useEffect(() => {
    if (!scanSuccess) {
      return undefined
    }

    const timer = window.setTimeout(
      () => {
        setScanSuccess('')
      },
      2000,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [scanSuccess])

  const restartScanner = useCallback(
    () => {
      setScanError('')
      setScanNotice('')
      setScanSuccess('')
      setCameraActive(true)
      setCameraStatus(
        'Memuat kamera...',
      )
      setScannerKey(
        (key) => key + 1,
      )
    },
    [],
  )

  const handleDecode = useCallback(
    async (decodedText) => {
      setScanSuccess('')
      setScanError('')
      setScanNotice('')
      setCameraActive(false)
      setCameraStatus(
        'QR terbaca, memvalidasi peserta...',
      )

      const parsed =
        parseQrPayload(decodedText)

      if (
        !parsed.valid
        || !parsed.payload?.qrId
      ) {
        setScanError(
          parsed.error
          || 'Format QR tidak valid.',
        )

        window.setTimeout(
          restartScanner,
          2500,
        )
        return
      }

      try {
        const result =
          await beginPublicParticipantCheckIn(
            parsed.payload.qrId,
          )

        vibrateScan()

        if (result.alreadyHadir) {
          setScanNotice(
            'Peserta sudah tercatat hadir.',
          )
        }

        window.setTimeout(
          () => {
            navigate('/review', {
              state: {
                ...result,
                returnTo: '/scanner',
                returnLabel:
                  result.alreadyHadir
                    ? 'Scan QR Lain'
                    : 'Batal',
              },
            })
          },
          result.alreadyHadir
            ? 600
            : 0,
        )
      } catch (error) {
        console.error(
          '[DIHATIMU] QR gagal diproses:',
          error,
        )

        setScanError(
          error?.message
          || 'QR belum dapat diproses. Periksa koneksi internet.',
        )

        window.setTimeout(
          restartScanner,
          2500,
        )
      }
    },
    [
      navigate,
      restartScanner,
    ],
  )

  const handleCameraReady =
    useCallback(() => {
      setCameraStatus(
        'Kamera aktif — siap scan',
      )
      setScanError('')
    }, [])

  const handleCameraError =
    useCallback(() => {
      setCameraActive(false)
      setCameraStatus(
        'Kamera tidak dapat diakses',
      )
      setScanError(CAMERA_FAIL_MSG)
    }, [])

  const handleScannerCrash =
    useCallback(() => {
      setCameraActive(false)
      setCameraStatus(
        'Kamera tidak dapat diakses',
      )
      setScanError(CAMERA_FAIL_MSG)
    }, [])

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white">
      <header className="safe-area-inset-top relative z-20 flex items-center justify-between px-3 py-3">
        <button
          type="button"
          onClick={() => {
            navigate('/landing')
          }}
          className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
        >
          ← Kembali
        </button>

        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            DIHATIMU
          </p>

          <p className="text-xs font-medium text-white/80">
            Scanner Kehadiran
          </p>
        </div>

        <div className="w-16" />
      </header>

      <main className="relative min-h-0 flex-1 bg-black">
        {cameraActive && (
          <ScannerErrorBoundary
            onError={handleScannerCrash}
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6">
                <p className="text-center text-sm text-red-300">
                  {CAMERA_FAIL_MSG}
                </p>

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
              onCameraReady={
                handleCameraReady
              }
              onCameraError={
                handleCameraError
              }
            />
          </ScannerErrorBoundary>
        )}

        {!cameraActive
          && scanError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6">
              <p className="text-center text-sm font-medium text-red-300">
                {scanError}
              </p>

              <button
                type="button"
                onClick={restartScanner}
                className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white"
              >
                Coba lagi
              </button>
            </div>
          )}

        {!cameraActive
          && !scanError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <p className="text-sm text-white/60">
                QR terbaca, memproses...
              </p>
            </div>
          )}

        {cameraActive
          && !scanError && (
            <ScannerFrame
              scanning
              status={cameraStatus}
            />
          )}

        {(scanError
          || scanNotice
          || scanSuccess) && (
            <div className="absolute bottom-28 left-4 right-4 z-20 space-y-2">
              {scanSuccess && (
                <p className="rounded-xl border border-emerald-300/30 bg-emerald-600/95 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                  {scanSuccess}
                </p>
              )}

              {scanNotice && (
                <p className="rounded-xl bg-amber-500/90 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
                  {scanNotice}
                </p>
              )}

              {scanError && (
                <div className="rounded-xl bg-red-600/90 px-4 py-3 text-center shadow-lg">
                  <p className="text-sm font-semibold text-white">
                    {scanError}
                  </p>

                  {!cameraActive && (
                    <button
                      type="button"
                      onClick={
                        restartScanner
                      }
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