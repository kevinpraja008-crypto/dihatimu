import {
    useEffect,
    useRef,
    useState,
  } from 'react'

  const PHOTO_MAX_WIDTH = 960

  function stopCameraStream(stream) {
    stream?.getTracks().forEach((track) => {
      track.stop()
    })
  }

  export default function AttendanceCameraModal({
    participantName,
    onCapture,
    onClose,
  }) {
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    const [cameraReady, setCameraReady] =
      useState(false)

    const [cameraError, setCameraError] =
      useState('')

    const [retryKey, setRetryKey] =
      useState(0)

    useEffect(() => {
      let cancelled = false

      async function startCamera() {
        setCameraReady(false)
        setCameraError('')

        stopCameraStream(streamRef.current)
        streamRef.current = null

        if (
          !navigator.mediaDevices?.getUserMedia
        ) {
          throw new Error(
            'Browser tidak mendukung kamera langsung.',
          )
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: {
                ideal: 'environment',
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
          })

        if (cancelled) {
          stopCameraStream(stream)
          return
        }

        streamRef.current = stream

        const video = videoRef.current

        if (!video) {
          stopCameraStream(stream)
          return
        }

        video.srcObject = stream
        await video.play()

        if (!cancelled) {
          setCameraReady(true)
        }
      }

      startCamera().catch((error) => {
        if (cancelled) return

        console.error(
          '[DIHATIMU] Kamera foto gagal dibuka:',
          error,
        )

        setCameraError(
          'Kamera tidak dapat dibuka. Periksa izin kamera, lalu coba lagi.',
        )
      })

      return () => {
        cancelled = true
        stopCameraStream(streamRef.current)
        streamRef.current = null
      }
    }, [retryKey])

    function handleCapture() {
      const video = videoRef.current

      if (
        !video ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        setCameraError(
          'Gambar kamera belum siap. Silakan coba lagi.',
        )
        return
      }

      const width = Math.min(
        video.videoWidth,
        PHOTO_MAX_WIDTH,
      )

      const height = Math.round(
        video.videoHeight *
          (width / video.videoWidth),
      )

      const canvas =
        document.createElement('canvas')

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')

      if (!context) {
        setCameraError(
          'Foto gagal diproses. Silakan coba lagi.',
        )
        return
      }

      context.drawImage(
        video,
        0,
        0,
        width,
        height,
      )

      const photoDataUrl = canvas.toDataURL(
        'image/jpeg',
        0.82,
      )

      onCapture(photoDataUrl)
      onClose()
    }

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ambil foto kehadiran"
        className="fixed inset-0 z-[100] flex flex-col bg-black text-white"
      >
        <header className="safe-area-inset-top relative z-20 flex items-center justify-between bg-black/80 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white"
          >
            Batal
          </button>

          <div className="text-center">
            <p className="text-sm font-bold">
              Foto Kehadiran
            </p>
            <p className="text-[11px] text-white/60">
              {participantName}
            </p>
          </div>

          <div className="w-14" />
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
          />

          {cameraReady && !cameraError && (
            <div className="pointer-events-none absolute inset-8 rounded-[28px] border-2 border-emerald-400/80" />
          )}

          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <p className="text-sm text-white/70">
                Membuka kamera...
              </p>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black px-8 text-center">
              <p className="text-sm font-medium text-red-300">
                {cameraError}
              </p>

              <button
                type="button"
                onClick={() =>
                  setRetryKey((value) => value + 1)
                }
                className="mt-4 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </main>

        <footer className="safe-area-inset-bottom bg-black px-5 py-5">
          <p className="mb-3 text-center text-xs text-white/60">
            Pastikan wajah peserta terlihat jelas
          </p>

          <button
            type="button"
            disabled={
              !cameraReady || !!cameraError
            }
            onClick={handleCapture}
            className="w-full rounded-2xl bg-emerald-700 py-4 text-base font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ambil Gambar
          </button>
        </footer>
      </div>
    )
  }