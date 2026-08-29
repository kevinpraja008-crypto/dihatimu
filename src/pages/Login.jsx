import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoDihatimu from '../assets/logo-dihatimu.png'
import logoSekretariat from '../assets/logo-sekretariat-dprd.png'

function normalizeAdminIdentifier(value) {
  const normalized = value.trim().toLowerCase()

  if (normalized.includes('@')) {
    return normalized
  }

  return `${normalized}@dihatimu.id`
}

export default function Login() {
  const navigate = useNavigate()
  const {
    loading,
    isAuthenticated,
    signIn,
  } = useAuth()

  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const destination = '/dashboard'

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(destination, { replace: true })
    }
  }, [destination, isAuthenticated, loading, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!adminId.trim() || !password) {
      setErrorMessage('Masukkan ID admin dan password.')
      return
    }

    setSubmitting(true)

    const email = normalizeAdminIdentifier(adminId)
    const { error } = await signIn(email, password)

    if (error) {
      console.error('[DIHATIMU] Login admin gagal:', error)
      setErrorMessage('ID admin atau password tidak sesuai.')
      setSubmitting(false)
      return
    }

    navigate(destination, { replace: true })
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#F4F7F6] px-5 py-10">
      <div className="absolute inset-x-0 top-0 h-2 bg-[#013220]" />

      <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />

      <section className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_70px_rgba(1,50,32,0.14)]">
        <div className="bg-[#013220] px-8 pb-8 pt-9 text-center text-white">
          <div className="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3">
            <img
              src={logoSekretariat}
              alt="Logo Sekretariat DPRD"
              className="h-14 w-14 object-contain"
            />

            <div className="h-10 w-px bg-white/20" />

            <img
              src={logoDihatimu}
              alt="Logo DIHATIMU"
              className="h-14 w-14 object-contain"
            />
          </div>

          <p className="mt-5 text-xs font-bold tracking-[0.24em] text-amber-300">
            DIHATIMU
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Login Administrator
          </h1>

          <p className="mt-2 text-sm text-white/70">
            Sistem Digital Kehadiran Tamu DPRD
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-8 py-8"
        >
          <div>
            <label
              htmlFor="admin-id"
              className="mb-2 block text-sm font-semibold text-[#0F172A]"
            >
              ID Admin
            </label>

            <input
              id="admin-id"
              type="text"
              value={adminId}
              onChange={(event) => setAdminId(event.target.value)}
              autoComplete="username"
              placeholder="Masukkan ID admin"
              disabled={submitting}
              className="h-12 w-full rounded-xl border border-[#DCE3E0] bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#027A54] focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-semibold text-[#0F172A]"
            >
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Masukkan password"
              disabled={submitting}
              className="h-12 w-full rounded-xl border border-[#DCE3E0] bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#027A54] focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="h-13 w-full rounded-xl bg-[#013220] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/15 transition hover:bg-[#02533A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Memeriksa akun...' : 'Masuk ke Sistem'}
          </button>

          <p className="text-center text-xs leading-5 text-[#64748B]">
            Halaman ini hanya diperuntukkan bagi administrator resmi.
          </p>
        </form>
      </section>
    </main>
  )
}