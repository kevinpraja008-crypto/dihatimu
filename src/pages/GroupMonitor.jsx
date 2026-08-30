import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import logoDihatimu from '../assets/logo-dihatimu.png'
import logoSekretariat from '../assets/logo-sekretariat-dprd.png'
import { computeGroupStats } from '../data/dummy'
import {
  fetchPublicGroupMonitor,
  subscribeToPublicGroupMonitor,
} from '../data/monitorService'

function formatNow() {
  const time = new Date().toLocaleTimeString(
    'id-ID',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    },
  )

  return `${time} WIB`
}

export default function GroupMonitor() {
  const { monitorToken } = useParams()

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] =
    useState('')
  const [lastUpdate, setLastUpdate] =
    useState('-')

  const refreshTimerRef = useRef(null)
  const unsubscribeRef = useRef(null)
  const requestIdRef = useRef(0)

  const loadMonitor = useCallback(
    async ({
      showLoading = false,
    } = {}) => {
      const requestId =
        requestIdRef.current + 1

      requestIdRef.current = requestId

      if (showLoading) {
        setLoading(true)
      }

      try {
        const monitorData =
          await fetchPublicGroupMonitor(
            monitorToken,
          )

        if (
          requestId
          !== requestIdRef.current
        ) {
          return
        }

        if (!monitorData) {
          setGroup(null)
          setErrorMessage(
            'Link QR Monitor tidak ditemukan atau sudah tidak berlaku.',
          )
          return
        }

        setGroup(monitorData)
        setErrorMessage('')
        setLastUpdate(formatNow())
      } catch (error) {
        console.error(
          '[DIHATIMU] Data QR Monitor gagal dimuat:',
          error,
        )

        if (
          requestId
          === requestIdRef.current
        ) {
          setErrorMessage(
            'Monitor belum dapat terhubung. Periksa koneksi internet.',
          )
        }
      } finally {
        if (
          requestId
          === requestIdRef.current
        ) {
          setLoading(false)
        }
      }
    },
    [monitorToken],
  )

  const scheduleRefresh = useCallback(() => {
    if (
      document.visibilityState
      !== 'visible'
    ) {
      return
    }

    if (refreshTimerRef.current) {
      window.clearTimeout(
        refreshTimerRef.current,
      )
    }

    refreshTimerRef.current =
      window.setTimeout(() => {
        refreshTimerRef.current = null
        void loadMonitor()
      }, 600)
  }, [loadMonitor])

  useEffect(() => {
    let disposed = false
    let hasSubscribed = false

    function stopSubscription() {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }

      hasSubscribed = false
    }

    function startSubscription() {
      if (
        disposed
        || document.visibilityState
          !== 'visible'
      ) {
        return
      }

      stopSubscription()

      unsubscribeRef.current =
        subscribeToPublicGroupMonitor(
          monitorToken,
          {
            onChange: () => {
              scheduleRefresh()
            },
            onStatus: (status) => {
              if (status === 'SUBSCRIBED') {
                if (hasSubscribed) {
                  scheduleRefresh()
                }

                hasSubscribed = true
              }
            },
          },
        )
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState
        === 'hidden'
      ) {
        stopSubscription()

        if (refreshTimerRef.current) {
          window.clearTimeout(
            refreshTimerRef.current,
          )
          refreshTimerRef.current = null
        }

        return
      }

      void loadMonitor()
      startSubscription()
    }

    void loadMonitor({
      showLoading: true,
    })

    startSubscription()

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    return () => {
      disposed = true
      requestIdRef.current += 1

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )

      stopSubscription()

      if (refreshTimerRef.current) {
        window.clearTimeout(
          refreshTimerRef.current,
        )
        refreshTimerRef.current = null
      }
    }
  }, [
    loadMonitor,
    monitorToken,
    scheduleRefresh,
  ])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8F5EE] p-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#D8E5E0] border-t-[#013220]" />

          <p className="mt-4 text-sm font-medium text-[#2a4a3a]">
            Memuat Monitor Kehadiran...
          </p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5EE] p-6">
        <div className="max-w-md rounded-2xl border border-[#e8eaed] bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-[#013220]">
            QR Monitor Tidak Tersedia
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#64748B]">
            {errorMessage
              || 'Link QR Monitor tidak ditemukan.'}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadMonitor({
                showLoading: true,
              })
            }}
            className="mt-5 rounded-xl bg-[#013220] px-5 py-3 text-sm font-semibold text-white"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const stats = computeGroupStats(group)

  const hadirList =
    group.participants.filter(
      (participant) =>
        participant.kehadiran === 'HADIR',
    )

  const belumList =
    group.participants.filter(
      (participant) =>
        participant.kehadiran !== 'HADIR',
    )

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

            <img
              src={logoDihatimu}
              alt="DIHATIMU"
              className="h-14 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-[#013220]">
            DIHATIMU
          </h1>

          <p className="mt-1 text-sm text-[#2a4a3a]/80">
            Monitor Kehadiran Tamu
          </p>

          <p className="mt-3 text-sm font-bold uppercase tracking-wide text-[#b8941f]">
            {group.name}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {errorMessage && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {errorMessage}
          </div>
        )}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          {[
            {
              label: 'Total Peserta',
              value: stats.total,
            },
            {
              label: 'Sudah Hadir',
              value: stats.hadir,
            },
            {
              label: 'Belum Hadir',
              value: stats.belum,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e8eaed] bg-white p-4 text-center shadow-sm"
            >
              <p className="text-xs text-muted">
                {item.label}
              </p>

              <p className="mt-1 text-2xl font-bold text-[#013220]">
                {item.value}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="mb-6 rounded-2xl border border-[#e8eaed] bg-white p-5 shadow-sm">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-[#013220]">
              {stats.hadir} / {stats.total}
            </span>

            <span className="font-semibold text-[#b8941f]">
              {stats.percent}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#e8eaed]">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${stats.percent}%`,
              }}
              transition={{
                duration: 0.6,
              }}
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
              <p className="text-sm text-muted">
                Belum ada peserta hadir.
              </p>
            ) : (
              <ul className="space-y-3">
                {hadirList.map(
                  (participant, index) => (
                    <li
                      key={
                        `${participant.nama}-${participant.jabatan}-${index}`
                      }
                      className="flex items-start gap-3 border-b border-[#f4f5f7] pb-3 last:border-0"
                    >
                      <span className="mt-0.5 text-[#013220]">
                        {'\u2713'}
                      </span>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {participant.nama}
                        </p>

                        <p className="text-sm text-muted">
                          {participant.jabatan}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-[#013220]/10 px-2 py-0.5 text-xs font-semibold text-[#013220]">
                          HADIR
                        </span>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-[#e8eaed] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-orange-700">
              Belum Hadir
            </h2>

            {belumList.length === 0 ? (
              <p className="text-sm text-muted">
                Semua peserta sudah hadir.
              </p>
            ) : (
              <ul className="space-y-3">
                {belumList.map(
                  (participant, index) => (
                    <li
                      key={
                        `${participant.nama}-${participant.jabatan}-${index}`
                      }
                      className="flex items-start gap-3 border-b border-[#f4f5f7] pb-3 last:border-0"
                    >
                      <span className="mt-0.5 text-orange-500">
                        {'\u25CB'}
                      </span>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {participant.nama}
                        </p>

                        <p className="text-sm text-muted">
                          {participant.jabatan}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                          BELUM HADIR
                        </span>
                      </div>
                    </li>
                  ),
                )}
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