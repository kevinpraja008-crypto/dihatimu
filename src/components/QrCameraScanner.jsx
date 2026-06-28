import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { DecodeHintType } from '@zxing/library'
import { Html5Qrcode } from 'html5-qrcode'

const FALLBACK_READER_ID = 'dihatimu-qr-reader-fallback'

const ZXING_HINTS = new Map([[DecodeHintType.TRY_HARDER, true]])

const ZXING_OPTIONS = {
  delayBetweenScanAttempts: 80,
  delayBetweenScanSuccess: 200,
}

const HTML5_FALLBACK_CONFIG = {
  fps: 20,
  aspectRatio: 1.777778,
  disableFlip: false,
}

const CAMERA_FAIL_MSG =
  'Kamera belum dapat diaktifkan. Periksa izin kamera atau refresh halaman.'

async function safeStopZxing(controls, reader) {
  try {
    if (controls && typeof controls.stop === 'function') {
      await Promise.resolve(controls.stop())
    }
  } catch (err) {
    console.warn('[DIHATIMU] ZXing stop gagal:', err)
  }
  try {
    if (reader && typeof reader.reset === 'function') {
      reader.reset()
    }
  } catch (err) {
    console.warn('[DIHATIMU] ZXing reset gagal:', err)
  }
}

async function safeStopHtml5(html5) {
  if (!html5) return
  try {
    if (typeof html5.stop === 'function') {
      const scanning =
        html5.isScanning === true ||
        (typeof html5.getState === 'function' && html5.getState() === 2)
      if (scanning) {
        await html5.stop()
      }
    }
  } catch (err) {
    console.warn('[DIHATIMU] html5 stop gagal:', err)
  }
  try {
    if (typeof html5.clear === 'function') {
      await html5.clear()
    }
  } catch (err) {
    console.warn('[DIHATIMU] html5 clear gagal:', err)
  }
}

function clearVideoStream(videoEl) {
  if (!videoEl?.srcObject) return
  try {
    videoEl.srcObject.getTracks?.().forEach((track) => track.stop())
  } catch (err) {
    console.warn('[DIHATIMU] stop video tracks gagal:', err)
  }
  videoEl.srcObject = null
}

async function pickBackCameraHtml5() {
  try {
    const cameras = await Html5Qrcode.getCameras()
    if (!cameras?.length) return { facingMode: 'environment' }
    const back =
      cameras.find((c) => /back|rear|environment|belakang/i.test(c.label)) ||
      cameras[cameras.length - 1]
    return back?.id || { facingMode: 'environment' }
  } catch {
    return { facingMode: 'environment' }
  }
}

export default function QrCameraScanner({ active, onDecode, onCameraReady, onCameraError }) {
  const videoRef = useRef(null)
  const lockedRef = useRef(false)
  const mountIdRef = useRef(0)
  const zxingReaderRef = useRef(null)
  const zxingControlsRef = useRef(null)
  const html5Ref = useRef(null)
  const [showHtml5Layer, setShowHtml5Layer] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!active) return undefined

    const mountId = mountIdRef.current + 1
    mountIdRef.current = mountId
    lockedRef.current = false
    setLocalError('')
    setShowHtml5Layer(false)
    setCameraReady(false)

    let cancelled = false
    const isStale = () => cancelled || mountIdRef.current !== mountId

    function emitDecode(decodedText) {
      if (isStale()) return
      console.log('[DIHATIMU] QR decoded:', decodedText)
      onDecode(decodedText)
    }

    function failAll(err) {
      console.error('[DIHATIMU] Scanner gagal total:', err)
      if (isStale()) return
      setLocalError(CAMERA_FAIL_MSG)
      onCameraError?.(err instanceof Error ? err : new Error(String(err)))
    }

    async function startZxing(constraints) {
      const videoEl = videoRef.current
      if (!videoEl) throw new Error('Video element tidak tersedia')

      const reader = new BrowserQRCodeReader(ZXING_HINTS, ZXING_OPTIONS)
      zxingReaderRef.current = reader

      const controls = await reader.decodeFromConstraints(
        constraints,
        videoEl,
        (result) => {
          if (isStale() || lockedRef.current) return

          if (result && typeof result.getText === 'function') {
            const decodedText = result.getText()

            lockedRef.current = true

            safeStopZxing(zxingControlsRef.current, reader).finally(() => {
              emitDecode(decodedText)
            })
          }
        },
      )

      if (isStale()) {
        await safeStopZxing(controls, reader)
        return false
      }

      zxingControlsRef.current = controls
      setShowHtml5Layer(false)
      setCameraReady(true)
      return true
    }

    async function startHtml5Fallback() {
      const html5 = new Html5Qrcode(FALLBACK_READER_ID, { verbose: false })
      html5Ref.current = html5
      const cameraIdOrConfig = await pickBackCameraHtml5()

      if (isStale()) {
        await safeStopHtml5(html5)
        return false
      }

      clearVideoStream(videoRef.current)
      setShowHtml5Layer(true)

      await html5.start(
        cameraIdOrConfig,
        HTML5_FALLBACK_CONFIG,
        (decodedText) => {
          if (lockedRef.current || isStale()) return

          lockedRef.current = true

          safeStopHtml5(html5).finally(() => {
            emitDecode(decodedText)
          })
        },
        () => {},
      )

      if (!isStale()) {
        setCameraReady(true)
      }

      return !isStale()
    }

    async function boot() {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      if (isStale()) return

      const zxingConstraintsList = [
        {
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        {
          audio: false,
          video: { facingMode: 'environment' },
        },
      ]

      for (const constraints of zxingConstraintsList) {
        if (isStale()) return
        try {
          const ok = await startZxing(constraints)
          if (ok) {
            onCameraReady?.('zxing')
            return
          }
        } catch (zxingErr) {
          console.warn('[DIHATIMU] ZXing gagal, coba constraints berikutnya:', zxingErr)
          await safeStopZxing(zxingControlsRef.current, zxingReaderRef.current)
          zxingControlsRef.current = null
          zxingReaderRef.current = null
          clearVideoStream(videoRef.current)
        }
      }

      console.warn('[DIHATIMU] ZXing gagal, fallback html5-qrcode')

      try {
        const ok = await startHtml5Fallback()
        if (ok) {
          onCameraReady?.('html5')
          return
        }

        if (!isStale()) {
          failAll(new Error('html5-qrcode tidak berhasil dimulai'))
        }
      } catch (fallbackErr) {
        console.error('[DIHATIMU] html5-qrcode fallback gagal:', fallbackErr)
        await safeStopHtml5(html5Ref.current)
        html5Ref.current = null
        setShowHtml5Layer(false)
        failAll(fallbackErr)
      }
    }

    boot().catch((err) => {
      failAll(err)
    })

    return () => {
      cancelled = true
      lockedRef.current = true

      safeStopZxing(zxingControlsRef.current, zxingReaderRef.current).finally(() => {
        zxingControlsRef.current = null
        zxingReaderRef.current = null
      })

      safeStopHtml5(html5Ref.current).finally(() => {
        html5Ref.current = null
      })

      clearVideoStream(videoRef.current)
    }
  }, [active, onDecode, onCameraReady, onCameraError])

  return (
    <>
      <video
        ref={videoRef}
        className={`qr-scanner-video absolute inset-0 h-full w-full object-cover ${
          showHtml5Layer ? 'hidden' : ''
        }`}
        playsInline
        muted
        autoPlay
      />

      <div
        id={FALLBACK_READER_ID}
        className={`qr-camera-reader absolute inset-0 ${showHtml5Layer ? '' : 'hidden'}`}
        aria-hidden={!showHtml5Layer}
      />

      {localError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 p-6">
          <p className="text-center text-sm font-medium text-red-300">{localError}</p>
        </div>
      )}

      {!localError && !cameraReady && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-black/40">
          <p className="rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/80">
            Menyiapkan kamera...
          </p>
        </div>
      )}
    </>
  )
}